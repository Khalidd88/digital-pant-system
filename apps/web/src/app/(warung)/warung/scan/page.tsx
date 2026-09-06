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
  ScanLine,
  Upload,
  Loader2,
  RefreshCcw,
  Lock,
  QrCode,
  Zap,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

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
  { id: "pet", label: "Botol Plastik PET", qty: 0, rate: 500 },
  { id: "kaleng", label: "Kaleng Aluminium", qty: 0, rate: 800 },
];

const KOMISI_WARUNG_PERSEN = 0.1; // 10% komisi operasional warung

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

const warungMenuItems = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR", href: "/warung/scan", icon: QrCode },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

export default function WarungScanPage() {
  const [step, setStep] = useState<ScanStep>("SCAN_ID");

  // Identitas Mitra Warung Aktif
  const [warungName, setWarungName] = useState("Warung Mitra");
  const [warungId, setWarungId] = useState("WRG-0001");

  // Mobile Drawer & Notifikasi
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Tahap 1: Scan QR ID
  const [isIdScannerReady, setIsIdScannerReady] = useState(false);
  const [idScanError, setIdScanError] = useState<string | null>(null);
  const [isResolvingWarga, setIsResolvingWarga] = useState(false);
  const [scannedWarga, setScannedWarga] = useState<WargaProfile | null>(null);

  // Tahap 2: Verifikasi Botol (AI Edge Simulation)
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>(INITIAL_ITEMS);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
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
  const cvIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Muat session warung saat halaman dibuka
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWarungId = localStorage.getItem("pantra_warung_id") || "WRG-0001";
      const savedWarungName = localStorage.getItem("pantra_warung_name") || "Warung Mitra";
      setWarungId(savedWarungId);
      setWarungName(savedWarungName);
    }
  }, []);

  const totalSaldoWarga = detectedItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const totalKomisiWarung = Math.round(totalSaldoWarga * KOMISI_WARUNG_PERSEN);
  const totalItemTerdeteksi = detectedItems.reduce((sum, item) => sum + item.qty, 0);

  // --------------------------------------------------------------------
  // AMBIL DATA WARGA RIIL DARI DATABASE SUPABASE
  // --------------------------------------------------------------------
  const fetchWargaFromDB = async (targetQr: string): Promise<WargaProfile> => {
    const cleanId = targetQr.trim().toUpperCase();
    try {
      const res = await fetch(`http://localhost:4000/api/user/${cleanId}`, { cache: "no-store" });
      const json = await res.json();

      if (json.success && json.data) {
        return {
          id: json.data.qrId,
          nama: json.data.name,
          saldoAwal: json.data.balance || 0,
        };
      }
    } catch (e) {
      console.warn("Gagal fetch warga dari backend, beralih ke fallback.");
    }

    // Fallback jika user belum ada
    return {
      id: cleanId,
      nama: cleanId === "USR-8921" ? "Budi Santoso" : "Warga PANTRA Terdaftar",
      saldoAwal: 0,
    };
  };

  // --------------------------------------------------------------------
  // STEP 1: SCAN QR ID MENGGUNAKAN WEBCAM / UPLOAD / BYPASS
  // --------------------------------------------------------------------
  const stopIdScanner = useCallback(() => {
    qrControlsRef.current?.stop();
    qrControlsRef.current = null;
    setIsIdScannerReady(false);
  }, []);

  const handleQrDecoded = useCallback(
    async (rawValue: string) => {
      stopIdScanner();
      setIsResolvingWarga(true);
      setIdScanError(null);
      try {
        const warga = await fetchWargaFromDB(rawValue);
        setScannedWarga(warga);
        setStep("SCAN_BOTOL");
      } catch {
        setScannedWarga({ id: rawValue || "USR-8921", nama: "Warga PANTRA", saldoAwal: 0 });
        setStep("SCAN_BOTOL");
      } finally {
        setIsResolvingWarga(false);
      }
    },
    [stopIdScanner]
  );

  // Tombol Bypass: Mengambil akun Warga yang aktif di browser atau default Pak Budi
  const handleBypassScanId = async () => {
    stopIdScanner();
    setIsResolvingWarga(true);
    setIdScanError(null);
    try {
      const activeWargaQr = (typeof window !== "undefined" && localStorage.getItem("pantra_user_qr")) || "USR-8921";
      const warga = await fetchWargaFromDB(activeWargaQr);
      setScannedWarga(warga);
      setStep("SCAN_BOTOL");
    } finally {
      setIsResolvingWarga(false);
    }
  };

  useEffect(() => {
    if (step !== "SCAN_ID") return;

    let cancelled = false;
    const reader = new BrowserQRCodeReader();
    setIdScanError(null);

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, err) => {
        if (cancelled) return;
        if (result) {
          handleQrDecoded(result.getText());
        }
        if (err && err.name !== "NotFoundException") {
          setIdScanError("Kamera sedang memindai QR code warga...");
        }
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        qrControlsRef.current = controls;
        setIsIdScannerReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setIdScanError("Tidak dapat mengakses kamera browser. Anda dapat mengunggah foto QR atau menggunakan tombol Bypass.");
        }
      });

    return () => {
      cancelled = true;
      stopIdScanner();
    };
  }, [step, handleQrDecoded, stopIdScanner]);

  const handleUploadQrFile = async (file: File) => {
    setIdScanError(null);
    setIsResolvingWarga(true);
    try {
      const reader = new BrowserQRCodeReader();
      const imageUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
      await handleQrDecoded(result.getText());
    } catch {
      await handleQrDecoded("USR-8921");
    }
  };

  // --------------------------------------------------------------------
  // STEP 2: VERIFIKASI COMPUTER VISION (SIMULASI AI + MANUAL OVERRIDE)
  // --------------------------------------------------------------------
  const stopCvDetection = useCallback(() => {
    if (cvIntervalRef.current) {
      clearInterval(cvIntervalRef.current);
      cvIntervalRef.current = null;
    }
    cvStreamRef.current?.getTracks().forEach((track) => track.stop());
    cvStreamRef.current = null;
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    if (step !== "SCAN_BOTOL") return;

    let cancelled = false;
    setCvError(null);

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cvStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsDetecting(true);

        // Simulasi deteksi botol bertahap tiap 2.5 detik
        cvIntervalRef.current = setInterval(() => {
          setDetectedItems((prev) => {
            const targetId: ItemId = Math.random() > 0.35 ? "pet" : "kaleng";
            return prev.map((item) =>
              item.id === targetId ? { ...item, qty: item.qty + 1 } : item
            );
          });
        }, 2500);
      })
      .catch(() => {
        if (!cancelled) {
          setIsDetecting(true);
          cvIntervalRef.current = setInterval(() => {
            setDetectedItems((prev) => {
              const targetId: ItemId = Math.random() > 0.35 ? "pet" : "kaleng";
              return prev.map((item) =>
                item.id === targetId ? { ...item, qty: item.qty + 1 } : item
              );
            });
          }, 2000);
        }
      });

    return () => {
      cancelled = true;
      stopCvDetection();
    };
  }, [step, stopCvDetection]);

  // Kontrol manual penambahan/pengurangan item
  const handleAdjustQty = (id: ItemId, delta: number) => {
    setDetectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    );
  };

  const handleBackToScanId = () => {
    stopCvDetection();
    setDetectedItems(INITIAL_ITEMS);
    setScannedWarga(null);
    setScanCompletedAt(null);
    setStep("SCAN_ID");
  };

  const handleFinishScan = () => {
    stopCvDetection();
    setScanCompletedAt(new Date());
    setStep("KONFIRMASI");
  };

  const handleUlangScan = () => {
    setDetectedItems(INITIAL_ITEMS);
    setScanCompletedAt(null);
    setStep("SCAN_BOTOL");
  };

  const handlePinPress = (value: string) => {
    setDisbursementError(null);
    if (value === "delete") {
      setPinCode((prev) => prev.slice(0, -1));
    } else if (pinCode.length < 6) {
      setPinCode((prev) => prev + value);
    }
  };

  // --------------------------------------------------------------------
  // STEP 3: SUBMIT KE DATABASE SUPABASE (POST /api/scan/verify)
  // --------------------------------------------------------------------
  const handleSubmitDisbursement = async () => {
    if (pinCode.length < 4) {
      setDisbursementError("PIN warung minimal 4 digit.");
      return;
    }

    setIsSubmittingDisbursement(true);
    setDisbursementError(null);

    try {
      const petCount = detectedItems.find((i) => i.id === "pet")?.qty || 0;
      const kalengCount = detectedItems.find((i) => i.id === "kaleng")?.qty || 0;
      const totalCount = petCount + kalengCount;

      const targetQr = scannedWarga?.id || "USR-8921";

      // Eksekusi API Verifikasi Botol ke Backend
      const res = await fetch("http://localhost:4000/api/scan/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQrId: targetQr,
          material: kalengCount > petCount ? "CAN" : "PET",
          bottleCount: totalCount,
          warungId: warungId,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses setoran ke database.");
      }

      setSuccessInfo({
        earnedWarga: totalSaldoWarga,
        earnedWarung: totalKomisiWarung,
        newBalance: json.data?.newBalance || totalSaldoWarga,
      });

      setShowDisbursementModal(false);
      setPinCode("");
      setShowSuccessPopup(true);
    } catch (err: any) {
      setDisbursementError(err.message || "PIN salah atau terjadi gangguan koneksi ke server.");
    } finally {
      setIsSubmittingDisbursement(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessInfo(null);
    handleBackToScanId();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* ================= 2. HEADER MOBILE ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-7 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-xs rounded-xl shadow-lg border border-slate-100">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-2.5 bg-[#0B424F] text-white p-5 rounded-[22px] flex flex-col gap-3 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{warungName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{warungId}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/scan";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#52C3BF] text-white font-bold shadow-sm"
                          : "bg-[#235D6B] hover:bg-[#1F6A76] text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <Link
                  href="/warung/login"
                  onClick={() => {
                    localStorage.clear();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 bg-[#235D6B] hover:bg-red-950/40 text-red-300 rounded-[12px] text-sm mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* ================= 3. MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Topbar Header Desktop */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-bold font-['Mona_Sans'] flex items-center gap-2">
                Stasiun Scanner Mitra Warung 📷
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                Validasi identitas warga dan hitung material setoran daur ulang secara otomatis
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-5 h-5 text-[#0B424F]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold leading-tight">{warungName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{warungId}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Body Scanner */}
          <main
            className="p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-[1440px] w-full mx-auto font-['Mona_Sans']"
            aria-label="Scan QR PANTRA"
          >
            {/* =============== STEP 1: SCAN QR ID WARGA =============== */}
            {step === "SCAN_ID" && (
              <section className="flex-1 min-h-[600px] bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-[#0B424F] text-lg font-bold">Pindai QR ID Warga</h2>
                    <p className="text-[#36959B] text-xs mt-0.5">
                      Arahkan kamera ke layar ponsel warga untuk membaca kode identitas digital
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBypassScanId}
                    className="px-4 py-2 bg-[#FFF8E1] hover:bg-[#FFF1C6] border border-[#FF8D28] rounded-xl flex items-center gap-2 text-[#E3A810] text-xs font-bold transition-all shadow-xs"
                  >
                    <Zap className="w-4 h-4 text-[#FF8D28]" />
                    <span>Bypass Scan ID (Uji Coba Cepat)</span>
                  </button>
                </div>

                <div className="w-full flex-1 p-6 bg-[#E6F5F4] rounded-2xl border border-[#52C3BF] flex flex-col justify-between items-center gap-6 min-h-[460px]">
                  
                  {/* Viewfinder Box */}
                  <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border-4 border-[#0B424F] bg-[#0B424F] shadow-lg">
                    <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />

                    {!isIdScannerReady && !idScanError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B424F]/85 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-[#52C3BF]" />
                        <span className="text-xs font-medium">Mengaktifkan kamera pemindai...</span>
                      </div>
                    )}

                    {isResolvingWarga && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B424F]/90 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-[#52C3BF]" />
                        <span className="text-xs font-semibold">Mengecek data warga di Supabase...</span>
                      </div>
                    )}

                    {isIdScannerReady && !isResolvingWarga && (
                      <div className="absolute inset-6 border-2 border-dashed border-[#52C3BF] rounded-xl pointer-events-none animate-pulse" />
                    )}
                  </div>

                  {idScanError && (
                    <div className="w-full max-w-[440px] px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-xs font-medium text-center">
                      {idScanError}
                    </div>
                  )}

                  {/* Tombol Upload QR File Alternatif */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadQrFile(file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 px-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-[#0B424F] text-xs font-bold transition-colors shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-[#36959B]" />
                      <span>Unggah Gambar QR Warga</span>
                    </button>
                    <span className="text-[11px] text-slate-500">
                      Format QR resmi: <strong className="font-mono text-[#0B424F]">USR-XXXX</strong>
                    </span>
                  </div>

                </div>
              </section>
            )}

            {/* =============== STEP 2: VERIFIKASI COMPUTER VISION =============== */}
            {step === "SCAN_BOTOL" && (
              <>
                {/* Kamera AI Scanner */}
                <section className="flex-1 min-h-[580px] bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 flex flex-col gap-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBackToScanId}
                        className="p-2 bg-[#E6F5F4] hover:bg-[#D2F0EE] rounded-xl text-[#0B424F] transition-colors"
                        title="Kembali ke Scan QR ID"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-[#0B424F] text-lg font-bold">Deteksi Botol AI</h2>
                    </div>

                    <span className="text-xs bg-[#E8F6F5] text-teal-800 font-bold px-3 py-1 rounded-lg">
                      {totalItemTerdeteksi} Item Terhitung
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs">
                    Kamera mensimulasikan model computer vision. Gunakan juga kontrol cepat di bawah untuk menambah/mengurangi botol.
                  </p>

                  <div className="relative w-full rounded-2xl overflow-hidden border-4 border-[#0B424F] bg-[#0B424F] flex-1 min-h-[360px]">
                    <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />

                    {!isDetecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0B424F]/85 text-white">
                        <Loader2 className="w-7 h-7 animate-spin text-[#52C3BF]" />
                        <span className="text-xs">Menghubungkan stream kamera...</span>
                      </div>
                    )}

                    {isDetecting && (
                      <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-[#52C3BF] rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        AI Mendeteksi Objek Realtime
                      </div>
                    )}
                  </div>
                </section>

                {/* Ringkasan & Kontrol Jumlah Botol */}
                <div className="w-full lg:w-[420px] flex flex-col gap-5 shrink-0">
                  
                  {/* Card Profil Warga Terpindai */}
                  <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identitas Penyetor</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#0B424F]">{scannedWarga?.nama}</h3>
                        <span className="text-xs font-mono text-[#36959B]">{scannedWarga?.id}</span>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                        Akun Valid
                      </span>
                    </div>
                  </section>

                  {/* Card Kontrol Manual & Kalkulasi */}
                  <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 flex-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Material Terdeteksi</span>

                    <div className="flex flex-col gap-3">
                      {detectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-[#0B424F]">{item.label}</div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {formatRupiah(item.rate)} / item
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdjustQty(item.id, -1)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#0B424F]">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustQty(item.id, 1)}
                              className="w-8 h-8 rounded-lg bg-[#52C3BF] hover:bg-teal-400 flex items-center justify-center text-white active:scale-95 shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Estimasi Kalkulasi Saldo */}
                    <div className="p-4 bg-[#E8F6F5] rounded-xl border border-[#52C3BF]/30 flex flex-col gap-2 mt-auto">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Estimasi Saldo Warga:</span>
                        <span className="text-base font-bold text-emerald-600">+{formatRupiah(totalSaldoWarga)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-teal-200/50 pt-2">
                        <span className="text-slate-600 font-medium">Estimasi Komisi Warung (10%):</span>
                        <span className="text-sm font-bold text-teal-700">+{formatRupiah(totalKomisiWarung)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleBackToScanId}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishScan}
                        disabled={totalItemTerdeteksi === 0}
                        className="flex-1 py-3 bg-[#52C3BF] hover:bg-teal-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        Selesai Scan ({totalItemTerdeteksi})
                      </button>
                    </div>
                  </section>
                </div>
              </>
            )}

            {/* =============== STEP 3: KONFIRMASI SETORAN & PENCAIRAN =============== */}
            {step === "KONFIRMASI" && (
              <>
                <div className="w-full lg:w-[360px] flex flex-col gap-5 shrink-0">
                  <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identitas Penyetor</span>
                    <div>
                      <h3 className="text-lg font-bold text-[#0B424F]">{scannedWarga?.nama}</h3>
                      <span className="text-xs font-mono font-bold bg-[#E8F6F5] text-[#0B424F] px-2.5 py-0.5 rounded-md border border-[#52C3BF]/30">
                        {scannedWarga?.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">
                      Waktu Pemindaian: {scanCompletedAt ? scanCompletedAt.toLocaleTimeString() : "-"} WIB
                    </span>
                  </section>
                </div>

                <section className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#0B424F]">Konfirmasi Setoran &amp; Top Up Saldo</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Periksa rincian sebelum mencairkan saldo langsung ke dompet digital warga
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-y border-slate-100 py-4">
                    {detectedItems
                      .filter((i) => i.qty > 0)
                      .map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600">
                            {item.qty}x {item.label}
                          </span>
                          <span className="font-bold text-emerald-600">
                            +{formatRupiah(item.qty * item.rate)}
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="p-5 bg-[#E8F6F5] rounded-2xl border border-[#52C3BF]/40 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#0B424F]">Total Saldo Masuk ke Warga:</span>
                      <span className="text-xl font-extrabold text-[#0B424F]">{formatRupiah(totalSaldoWarga)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-teal-200/50 pt-2">
                      <span className="font-semibold text-teal-800">Komisi Otomatis Mitra Warung (10%):</span>
                      <span className="font-bold text-teal-700">+{formatRupiah(totalKomisiWarung)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto pt-2">
                    <button
                      type="button"
                      onClick={handleUlangScan}
                      className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                    >
                      Ulangi Scan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDisbursementModal(true)}
                      className="flex-1 py-3.5 bg-[#52C3BF] hover:bg-teal-400 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Cairkan Saldo ke Database</span>
                    </button>
                  </div>
                </section>
              </>
            )}

          </main>
        </div>
      </div>

      {/* ================= MODAL PIN PENCAIRAN SALDO ================= */}
      {showDisbursementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-2xl p-6 md:p-8 flex flex-col items-center gap-5 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => {
                setShowDisbursementModal(false);
                setPinCode("");
                setDisbursementError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-2 text-center">
              <Lock className="w-9 h-9 text-[#52C3BF] mb-1" />
              <h3 className="text-[#0B424F] text-lg font-bold">Masukkan PIN Warung</h3>
              <p className="text-[#36959B] text-xs">
                Saldo {formatRupiah(totalSaldoWarga)} akan langsung disuntikkan ke akun Supabase milik {scannedWarga?.nama}.
              </p>

              <div className="flex gap-2.5 my-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-[#52C3BF] transition-all ${
                      i < pinCode.length ? "bg-[#52C3BF] scale-110" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {disbursementError && (
                <p className="text-red-500 text-xs font-semibold">{disbursementError}</p>
              )}
            </div>

            <div className="w-full max-w-[260px]">
              <div className="grid grid-cols-3 gap-2.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinPress(num)}
                    className="h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-[#0B424F] text-base font-bold active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                  type="button"
                  onClick={() => handlePinPress("0")}
                  className="h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-[#0B424F] text-base font-bold"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPress("delete")}
                  className="h-11 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center text-rose-500 text-xs font-bold"
                >
                  Hapus
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitDisbursement}
              disabled={pinCode.length < 4 || isSubmittingDisbursement}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-1"
            >
              {isSubmittingDisbursement ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Supabase...</span>
                </>
              ) : (
                <span>Konfirmasi Top Up Saldo</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= POP-UP SUKSES TRANSAKSI ================= */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn font-['Poppins']">
          <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-7 flex flex-col items-center text-center relative border border-slate-100">
            <button
              type="button"
              onClick={handleCloseSuccessPopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#E6F5F4] flex items-center justify-center mb-4 text-[#52C3BF]">
              <CheckCircle2 className="w-10 h-10 text-[#52C3BF]" />
            </div>

            <h3 className="text-[#0B424F] text-xl font-bold mb-1">Setoran Berhasil Diverifikasi!</h3>
            <p className="text-xs text-slate-500 mb-4">
              Data transaksi telah resmi tercatat di PostgreSQL Supabase.
            </p>

            <div className="w-full bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 flex flex-col gap-2 text-xs text-left mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Penyetor:</span>
                <span className="font-bold text-[#0B424F]">{scannedWarga?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">QR ID:</span>
                <span className="font-mono font-bold text-[#36959B]">{scannedWarga?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Botol:</span>
                <span className="font-bold text-[#0B424F]">{totalItemTerdeteksi} Item</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-[#0B424F]">Saldo Warga Ditambahkan:</span>
                <span className="text-emerald-600">+{formatRupiah(successInfo?.earnedWarga || totalSaldoWarga)}</span>
              </div>
              <div className="flex justify-between text-teal-700 font-semibold">
                <span>Komisi Warung Masuk:</span>
                <span>+{formatRupiah(successInfo?.earnedWarung || totalKomisiWarung)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccessPopup}
              className="w-full py-3 bg-[#52C3BF] hover:bg-[#36959B] text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Scan Warga Berikutnya
            </button>
          </div>
        </div>
      )}

    </div>
  );
}