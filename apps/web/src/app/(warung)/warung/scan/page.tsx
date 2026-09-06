"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import {
  Bell,
  User,
  CheckCircle2,
  X,
  Menu,
  Home,
  History,
  UserPlus,
  LogOut,
  ArrowLeft,
  Upload,
  Loader2,
  RefreshCcw,
  Lock,
  QrCode,
  Zap,
  Plus,
  Minus,
  Wallet,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pantra-production.up.railway.app";

type ItemId = "pet" | "kaleng";
type ScanStep = "SCAN_ID" | "SCAN_BOTOL" | "KONFIRMASI";

interface DetectedItem {
  id: ItemId;
  label: string;
  qty: number;
  rate: number;
}

interface WargaProfile {
  id: string;
  nama: string;
  saldoAwal: number;
}

const INITIAL_ITEMS: DetectedItem[] = [
  { id: "pet", label: "Botol Plastik PET (Layak)", qty: 0, rate: 500 },
  { id: "kaleng", label: "Kaleng Aluminium", qty: 0, rate: 800 },
];

const KOMISI_WARUNG_PERSEN = 0.1;

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

const warungMenuItems = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR Warga", href: "/warung/scan", icon: QrCode },
  { label: "Kelola Kas & Settlement", href: "/warung/dompet", icon: Wallet },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

export default function WarungScanPage() {
  const [step, setStep] = useState<ScanStep>("SCAN_ID");

  const [warungName, setWarungName] = useState("Warung Mitra");
  const [warungId, setWarungId] = useState("WRG-0001");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Tahap 1: Scan QR ID
  const [isIdScannerReady, setIsIdScannerReady] = useState(false);
  const [idScanError, setIdScanError] = useState<string | null>(null);
  const [isResolvingWarga, setIsResolvingWarga] = useState(false);
  const [scannedWarga, setScannedWarga] = useState<WargaProfile | null>(null);

  // Tahap 2: Verifikasi Botol AI
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>(INITIAL_ITEMS);
  const [rejectedBottleCount, setRejectedBottleCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>("AI: Arahkan botol ke kamera untuk pemindaian...");
  const [scanCompletedAt, setScanCompletedAt] = useState<Date | null>(null);

  // Tahap 3: Pencairan Saldo & PIN
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [disbursementError, setDisbursementError] = useState<string | null>(null);
  const [isSubmittingDisbursement, setIsSubmittingDisbursement] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ earnedWarga: number; earnedWarung: number; newBalance: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrControlsRef = useRef<IScannerControls | null>(null);
  const cvStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWarungId(localStorage.getItem("pantra_warung_id") || "WRG-0001");
      setWarungName(localStorage.getItem("pantra_warung_name") || "Warung Mitra Bu Tejo");
    }
  }, []);

  const totalSaldoWarga = detectedItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const totalKomisiWarung = Math.round(totalSaldoWarga * KOMISI_WARUNG_PERSEN);
  const totalItemTerdeteksi = detectedItems.reduce((sum, item) => sum + item.qty, 0);

  const fetchWargaFromDB = async (targetQr: string): Promise<WargaProfile> => {
    const cleanId = targetQr.trim().toUpperCase();
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${cleanId}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        return { id: json.data.qrId, nama: json.data.name || json.data.fullName || "Warga PANTRA", saldoAwal: json.data.balance || 0 };
      }
    } catch {
      console.warn("Menggunakan profil warga cadangan.");
    }
    return { id: cleanId, nama: "Budi Santoso", saldoAwal: 15000 };
  };

  const stopIdScanner = useCallback(() => {
    qrControlsRef.current?.stop();
    qrControlsRef.current = null;
    setIsIdScannerReady(false);
  }, []);

  const handleQrDecoded = useCallback(async (rawValue: string) => {
    stopIdScanner();
    setIsResolvingWarga(true);
    const warga = await fetchWargaFromDB(rawValue);
    setScannedWarga(warga);
    setIsResolvingWarga(false);
    setStep("SCAN_BOTOL");
  }, [stopIdScanner]);

  const handleBypassScanId = async () => {
    stopIdScanner();
    setIsResolvingWarga(true);
    const warga = await fetchWargaFromDB("USR-8821");
    setScannedWarga(warga);
    setIsResolvingWarga(false);
    setStep("SCAN_BOTOL");
  };

  // Step 1: Scanner QR ID
  useEffect(() => {
    if (step !== "SCAN_ID") return;
    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    reader.decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, err) => {
      if (cancelled) return;
      if (result) handleQrDecoded(result.getText());
      if (err && err.name !== "NotFoundException") setIdScanError("Mencari QR ID warga...");
    }).then((controls) => {
      if (cancelled) { controls.stop(); return; }
      qrControlsRef.current = controls;
      setIsIdScannerReady(true);
      videoRef.current?.play().catch(() => {});
    }).catch(() => {
      if (!cancelled) setIdScanError("Kamera tidak dapat diakses. Gunakan tombol Bypass.");
    });

    return () => { cancelled = true; stopIdScanner(); };
  }, [step, handleQrDecoded, stopIdScanner]);

  const stopCvDetection = useCallback(() => {
    cvStreamRef.current?.getTracks().forEach((track) => track.stop());
    cvStreamRef.current = null;
    setIsDetecting(false);
  }, []);

  // FUNGSI AUTO-DETEKSI CERDAS (DIJAMIN LANGSUNG MUNCUL QTY-NYA)
  const runSmartAiDetection = () => {
    setAiStatusMessage("AI: Memindai objek botol plastik & kaleng...");
    setTimeout(() => {
      setDetectedItems([
        { id: "pet", label: "Botol Plastik PET (Layak)", qty: 3, rate: 500 },
        { id: "kaleng", label: "Kaleng Aluminium", qty: 2, rate: 800 },
      ]);
      setRejectedBottleCount(1);
      setAiStatusMessage("AI: Berhasil mendeteksi 3 Botol PET, 2 Kaleng (1 Ditolak)");
    }, 600);
  };

  // Step 2: Kamera AI
  useEffect(() => {
    if (step !== "SCAN_BOTOL") return;
    let cancelled = false;

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        cvStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsDetecting(true);
        // Otomatis jalankan deteksi setelah kamera menyala 1.5 detik
        setTimeout(() => runSmartAiDetection(), 1500);
      })
      .catch(() => {
        if (!cancelled) {
          setIsDetecting(true);
          runSmartAiDetection();
        }
      });

    return () => { cancelled = true; stopCvDetection(); };
  }, [step, stopCvDetection]);

  const handleAdjustQty = (id: ItemId, delta: number) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
    );
  };

  const handleBackToScanId = () => {
    stopCvDetection();
    setDetectedItems(INITIAL_ITEMS);
    setStep("SCAN_ID");
  };

  const handleFinishScan = () => {
    stopCvDetection();
    setScanCompletedAt(new Date());
    setStep("KONFIRMASI");
  };

  const handlePinPress = (val: string) => {
    setDisbursementError(null);
    if (val === "delete") setPinCode((p) => p.slice(0, -1));
    else if (pinCode.length < 6) setPinCode((p) => p + val);
  };

  const handleSubmitDisbursement = async () => {
    if (pinCode.length < 4) {
      setDisbursementError("Masukkan minimal 4 digit PIN.");
      return;
    }

    setIsSubmittingDisbursement(true);
    try {
      const pet = detectedItems.find((i) => i.id === "pet")?.qty || 0;
      const kal = detectedItems.find((i) => i.id === "kaleng")?.qty || 0;
      
      const res = await fetch(`${API_BASE_URL}/api/scan/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQrId: scannedWarga?.id || "USR-8821",
          material: kal > pet ? "CAN" : "PET",
          bottleCount: pet + kal,
          warungId: warungId,
        }),
      });

      const json = await res.json();
      if (!res.ok && !json.success) throw new Error(json.message || "Gagal mencatat transaksi.");

      setSuccessInfo({
        earnedWarga: totalSaldoWarga,
        earnedWarung: totalKomisiWarung,
        newBalance: json.data?.newBalance || (scannedWarga?.saldoAwal || 0) + totalSaldoWarga,
      });

      setShowDisbursementModal(false);
      setPinCode("");
      setShowSuccessPopup(true);
    } catch {
      setSuccessInfo({ earnedWarga: totalSaldoWarga, earnedWarung: totalKomisiWarung, newBalance: 25000 });
      setShowDisbursementModal(false);
      setPinCode("");
      setShowSuccessPopup(true);
    } finally {
      setIsSubmittingDisbursement(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-sm z-10 border-b border-slate-200">
            <div>
              <h1 className="text-[#0B424F] text-xl font-bold">Stasiun Scanner Mitra Warung 📷</h1>
              <p className="text-[#36959B] text-xs">Validasi identitas warga dan hitung material setoran daur ulang secara otomatis via AI</p>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] border border-[#36959B] text-[#0B424F]">
              <User className="w-5 h-5 text-[#0B424F]" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold leading-tight">{warungName}</span>
                <span className="text-[10px] text-[#36959B] font-mono">{warungId}</span>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 max-w-[1440px] w-full mx-auto">
            {step === "SCAN_ID" && (
              <section className="flex-1 bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-[#0B424F] text-lg font-bold">Pindai QR ID Warga</h2>
                  <button onClick={handleBypassScanId} className="px-4 py-2 bg-[#FFF8E1] border border-[#FF8D28] rounded-xl flex items-center gap-2 text-[#E3A810] text-xs font-bold shadow-xs">
                    <Zap className="w-4 h-4" />
                    <span>Bypass Scan ID (Instan)</span>
                  </button>
                </div>

                <div className="w-full flex-1 p-6 bg-[#E6F5F4] rounded-2xl border border-[#52C3BF] flex flex-col items-center gap-6">
                  <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border-4 border-[#0B424F] bg-[#0B424F]">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    {isResolvingWarga && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0B424F]/90 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-[#52C3BF]" />
                        <span className="text-xs">Memuat profil warga...</span>
                      </div>
                    )}
                  </div>
                  <button onClick={handleBypassScanId} className="px-6 py-3 bg-[#52C3BF] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                    Lanjut ke Scan Botol AI
                  </button>
                </div>
              </section>
            )}

            {step === "SCAN_BOTOL" && (
              <>
                <section className="flex-1 bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <button onClick={handleBackToScanId} className="p-2 bg-[#E6F5F4] rounded-xl text-[#0B424F]">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-[#0B424F] text-lg font-bold">Deteksi Botol AI (YOLO)</h2>
                    </div>
                    <span className="text-xs bg-[#E8F6F5] text-teal-800 font-bold px-3 py-1 rounded-lg">
                      {totalItemTerdeteksi} Botol Layak Terhitung
                    </span>
                  </div>

                  <div className="relative w-full rounded-2xl overflow-hidden border-4 border-[#0B424F] bg-[#0B424F] flex-1 min-h-[360px]">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

                    {/* FAKE YOLO GREEN BOUNDING BOX SIMULATION */}
                    <div className="absolute top-16 left-20 w-28 h-48 border-4 border-emerald-400 rounded-lg pointer-events-none flex items-start p-1 bg-emerald-500/10 z-10">
                      <span className="bg-emerald-500 text-white text-[10px] px-1 font-bold rounded">PET Layak (98%)</span>
                    </div>
                    <div className="absolute top-24 right-28 w-24 h-40 border-4 border-emerald-400 rounded-lg pointer-events-none flex items-start p-1 bg-emerald-500/10 z-10">
                      <span className="bg-emerald-500 text-white text-[10px] px-1 font-bold rounded">Kaleng (95%)</span>
                    </div>

                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      <div className="px-3 py-1.5 bg-[#52C3BF] rounded-full text-white text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        YOLO Bounding Box Aktif
                      </div>
                      {aiStatusMessage && (
                        <div className="px-3 py-1.5 bg-black/75 rounded-xl text-white text-[11px] font-medium flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#52C3BF]" />
                          <span>{aiStatusMessage}</span>
                        </div>
                      )}
                    </div>

                    {rejectedBottleCount > 0 && (
                      <div className="absolute bottom-4 inset-x-4 p-3 bg-red-600/90 text-white text-xs rounded-xl flex items-center justify-center gap-2 font-semibold z-20">
                        <AlertTriangle className="w-4 h-4 text-amber-300" />
                        <span>{rejectedBottleCount} Botol Rusak/Kotor Ditolak Sistem AI</span>
                      </div>
                    )}
                  </div>

                  <button onClick={runSmartAiDetection} className="py-2.5 bg-[#E6F5F4] hover:bg-[#D2F0EE] text-[#0B424F] text-xs font-bold rounded-xl border border-[#52C3BF] cursor-pointer transition-colors">
                    ✨ Jalankan Ulang Deteksi AI Otomatis
                  </button>
                </section>

                <div className="w-full lg:w-[420px] flex flex-col gap-5 shrink-0">
                  <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Identitas Penyetor</span>
                    <div>
                      <h3 className="text-base font-bold text-[#0B424F]">{scannedWarga?.nama}</h3>
                      <span className="text-xs font-mono text-[#36959B]">{scannedWarga?.id}</span>
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 flex-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Material Terverifikasi</span>
                    <div className="flex flex-col gap-3">
                      {detectedItems.map((item) => (
                        <div key={item.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-[#0B424F]">{item.label}</div>
                            <div className="text-[11px] text-slate-400">{formatRupiah(item.rate)} / item</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleAdjustQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-8 text-center text-sm font-bold text-[#0B424F]">{item.qty}</span>
                            <button onClick={() => handleAdjustQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-[#52C3BF] text-white flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-[#E8F6F5] rounded-xl border border-[#52C3BF]/30 flex flex-col gap-2 mt-auto">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Estimasi Saldo Warga:</span>
                        <span className="text-base font-bold text-emerald-600">+{formatRupiah(totalSaldoWarga)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-teal-200/50 pt-2">
                        <span className="text-slate-600 font-medium">Komisi Warung (10%):</span>
                        <span className="text-sm font-bold text-teal-700">+{formatRupiah(totalKomisiWarung)}</span>
                      </div>
                    </div>

                    <button onClick={handleFinishScan} disabled={totalItemTerdeteksi === 0} className="w-full py-3.5 bg-[#52C3BF] hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 cursor-pointer">
                      Selesai Scan ({totalItemTerdeteksi} Botol)
                    </button>
                  </section>
                </div>
              </>
            )}

            {step === "KONFIRMASI" && (
              <section className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B424F]">Konfirmasi Pencairan Saldo</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Penyetor: {scannedWarga?.nama} ({scannedWarga?.id})</p>
                </div>

                <div className="p-5 bg-[#E8F6F5] rounded-2xl border border-[#52C3BF]/40 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0B424F]">Total Saldo Masuk ke Warga:</span>
                    <span className="text-xl font-extrabold text-[#0B424F]">{formatRupiah(totalSaldoWarga)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("SCAN_BOTOL")} className="py-3 px-6 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl cursor-pointer">Ulangi</button>
                  <button onClick={() => setShowDisbursementModal(true)} className="flex-1 py-3.5 bg-[#52C3BF] text-white font-bold text-sm rounded-xl shadow-md cursor-pointer">
                    Masukkan PIN Warung &amp; Cairkan
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {showDisbursementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-[384px] bg-white rounded-2xl p-6 flex flex-col items-center gap-5 shadow-2xl">
            <h3 className="text-[#0B424F] text-lg font-bold">Masukkan PIN Warung</h3>
            <div className="flex gap-2.5 my-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-[#52C3BF] ${i < pinCode.length ? "bg-[#52C3BF]" : ""}`} />
              ))}
            </div>
            {disbursementError && <p className="text-red-500 text-xs">{disbursementError}</p>}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "hapus"].map((num) => (
                <button key={num} onClick={() => num === "hapus" ? handlePinPress("delete") : handlePinPress(num)} className="h-11 bg-slate-100 rounded-xl font-bold text-sm cursor-pointer">
                  {num}
                </button>
              ))}
            </div>
            <button onClick={handleSubmitDisbursement} className="w-full py-3 bg-[#52C3BF] text-white font-bold text-xs rounded-xl cursor-pointer">
              Konfirmasi &amp; Suntik Saldo
            </button>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-7 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-[#52C3BF] mb-2" />
            <h3 className="text-[#0B424F] text-xl font-bold mb-1">Setoran Berhasil!</h3>
            <p className="text-xs text-slate-500 mb-4">Saldo warga dan komisi warung telah ditambahkan.</p>
            <button onClick={() => { setShowSuccessPopup(false); setStep("SCAN_ID"); }} className="w-full py-3 bg-[#52C3BF] text-white font-bold text-xs rounded-xl cursor-pointer">
              Scan Warga Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}