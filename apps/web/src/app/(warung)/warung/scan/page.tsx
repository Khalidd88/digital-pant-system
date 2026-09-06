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
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

// ============================================================================
// Konstanta bisnis — samakan dengan aturan tarif yang berlaku di backend.
// ============================================================================
const HARGA_PER_ITEM: Record<ItemId, number> = {
  pet: 1200, // Rp / botol PET
  kaleng: 1800, // Rp / kaleng
};
const KOMISI_WARUNG_PERSEN = 0.1; // 10% dari total setoran menjadi komisi warung

type ItemId = "pet" | "kaleng";

type ScanStep = "SCAN_ID" | "SCAN_BOTOL" | "KONFIRMASI";

interface DetectedItem {
  id: ItemId;
  label: string;
  qty: number;
}

interface WargaProfile {
  id: string;
  nama: string;
}

const INITIAL_ITEMS: DetectedItem[] = [
  { id: "pet", label: "Botol PET", qty: 0 },
  { id: "kaleng", label: "Kaleng", qty: 0 },
];

async function fetchWargaByQrId(rawValue: string): Promise<WargaProfile> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    id: rawValue || "QR-MOCK-ID",
    nama: "Ahmad Rafli Ramadhan",
  };
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// Menu khusus warung untuk sidebar
const warungMenuItems = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR", href: "/warung/scan", icon: QrCode },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

export default function WarungScanPage() {
  const [step, setStep] = useState<ScanStep>("SCAN_ID");

  // Mobile drawer & notifikasi
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Scan QR ID
  const [isIdScannerReady, setIsIdScannerReady] = useState(false);
  const [idScanError, setIdScanError] = useState<string | null>(null);
  const [isResolvingWarga, setIsResolvingWarga] = useState(false);
  const [scannedWarga, setScannedWarga] = useState<WargaProfile | null>(null);

  // Verifikasi Computer Vision
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>(INITIAL_ITEMS);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  const [scanCompletedAt, setScanCompletedAt] = useState<Date | null>(null);

  // Pencairan saldo
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [disbursementError, setDisbursementError] = useState<string | null>(null);
  const [isSubmittingDisbursement, setIsSubmittingDisbursement] = useState(false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrControlsRef = useRef<IScannerControls | null>(null);
  const cvStreamRef = useRef<MediaStream | null>(null);
  const cvIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSaldoWarga = detectedItems.reduce(
    (sum, item) => sum + item.qty * HARGA_PER_ITEM[item.id],
    0
  );
  const totalKomisiWarung = Math.round(totalSaldoWarga * KOMISI_WARUNG_PERSEN);
  const totalItemTerdeteksi = detectedItems.reduce((sum, item) => sum + item.qty, 0);

  // --------------------------------------------------------------------
  // SCAN_ID — baca QR ID Warga lewat kamera menggunakan @zxing/browser
  // --------------------------------------------------------------------
  const stopIdScanner = useCallback(() => {
    qrControlsRef.current?.stop();
    qrControlsRef.current = null;
    setIsIdScannerReady(false);
  }, []);

  const handleQrDecoded = useCallback(async (rawValue: string) => {
    stopIdScanner();
    setIsResolvingWarga(true);
    setIdScanError(null);
    try {
      const warga = await fetchWargaByQrId(rawValue);
      setScannedWarga(warga);
      setStep("SCAN_BOTOL");
    } catch {
      setScannedWarga({ id: rawValue || "MOCK-ID-01", nama: "Ahmad Rafli Ramadhan" });
      setStep("SCAN_BOTOL");
    } finally {
      setIsResolvingWarga(false);
    }
  }, [stopIdScanner]);

  // Tombol pintasan untuk bypass scan ID warga langsung ke tahapan Computer Vision
  const handleBypassScanId = async () => {
    stopIdScanner();
    setIsResolvingWarga(true);
    setIdScanError(null);
    try {
      const warga = await fetchWargaByQrId("BYPASS-QR-ID");
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
          setIdScanError("Kamera bermasalah. Periksa izin akses kamera atau gunakan tombol Bypass Scan ID.");
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
          setIdScanError("Tidak bisa mengakses kamera. Gunakan tombol Bypass Scan ID untuk uji coba instan.");
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
      await handleQrDecoded("UPLOADED-MOCK-ID");
    }
  };

  // --------------------------------------------------------------------
  // SCAN_BOTOL — verifikasi Edge Computer Vision (klasifikasi PET/Kaleng)
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
      .getUserMedia({ video: { facingMode: "environment" } })
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

        cvIntervalRef.current = setInterval(() => {
          setDetectedItems((prev) => {
            const targetId: ItemId = Math.random() > 0.3 ? "pet" : "kaleng";
            return prev.map((item) =>
              item.id === targetId ? { ...item, qty: item.qty + 1 } : item
            );
          });
        }, 1800);
      })
      .catch(() => {
        if (!cancelled) {
          setIsDetecting(true);
          cvIntervalRef.current = setInterval(() => {
            setDetectedItems((prev) => {
              const targetId: ItemId = Math.random() > 0.3 ? "pet" : "kaleng";
              return prev.map((item) =>
                item.id === targetId ? { ...item, qty: item.qty + 1 } : item
              );
            });
          }, 1500);
        }
      });

    return () => {
      cancelled = true;
      stopCvDetection();
    };
  }, [step, stopCvDetection]);

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
    setScannedWarga(scannedWarga);
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

  async function submitDisbursement(pin: string) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (pin.length < 4) {
      throw new Error("PIN minimal 4 digit.");
    }
  }

  const handleSubmitDisbursement = async () => {
    setIsSubmittingDisbursement(true);
    setDisbursementError(null);
    try {
      await submitDisbursement(pinCode);
      setShowDisbursementModal(false);
      setPinCode("");
      setShowSuccessPopup(true);
    } catch (err) {
      setDisbursementError(err instanceof Error ? err.message : "PIN salah, coba lagi.");
    } finally {
      setIsSubmittingDisbursement(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    handleBackToScanId();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* ================= 1. SIDEBAR NAVIGATION (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* ================= 2. HEADER & NAVBAR DRAWER (Mobile Only) ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-4 px-4 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between px-5 py-3.5 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[20px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-8 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-sm rounded-xl shadow-lg border border-slate-100 font-['Poppins']">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-3 bg-[#0B424F] text-white p-6 rounded-[24px] flex flex-col gap-6 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <span className="text-sm font-medium font-['Mona_Sans']">Warung Berkah Jaya</span>
              </div>

              <nav className="flex flex-col gap-3">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/scan";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-5 py-3.5 rounded-[16px] text-sm font-semibold font-['Poppins'] transition-all ${
                        isActive
                          ? "bg-[#52C3BF] text-white shadow-sm"
                          : "bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <Link
                  href="/warung/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-red-950/40 text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins'] mt-2 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* ================= 3. MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar Header (Desktop Only) */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-[#0B424F] text-xl font-semibold font-['Mona_Sans']">
                Selamat Pagi, Warung Berkah Jaya<span className="tracking-[0.04px]">!</span>
              </h1>
              <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                Siap menerima setoran warga hari ini?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="p-3.5 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors"
                  aria-label="Lihat notifikasi"
                >
                  <Bell className="w-6 h-6" />
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-[60px] w-[220px] rounded-[10px] bg-white p-3 text-sm text-[#0B424F] shadow-md border border-slate-100 z-20 font-['Poppins']">
                    Tidak ada notifikasi baru.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-6 h-6 text-[#0B424F]" />
                <span className="text-base font-medium font-['Mona_Sans'] hidden sm:inline">
                  Warung Berkah Jaya
                </span>
              </div>
            </div>
          </header>

          {/* Body */}
          <main
            className="p-4 md:p-8 flex flex-col lg:flex-row gap-5 max-w-[1440px] w-full mx-auto"
            aria-label="Scan QR PANTRA"
          >
            {/* =============== STEP 1: SCAN QR ID WARGA =============== */}
            {step === "SCAN_ID" && (
              <section
                className="flex-1 min-h-[645px] bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5 animate-fadeIn"
                aria-labelledby="scan-id-heading"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 id="scan-id-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                      QR ID WARGA
                    </h2>
                    {/* Tombol Bypass Scan ID Warga */}
                    <button
                      type="button"
                      onClick={handleBypassScanId}
                      className="px-4 py-2 bg-[#FFF8E1] hover:bg-[#FFF1C6] border border-[#FF8D28] rounded-[10px] flex items-center gap-2 text-[#E3A810] text-xs font-bold font-['Poppins'] transition-colors shadow-sm"
                    >
                      <Zap className="w-4 h-4 text-[#FF8D28]" />
                      Bypass Scan ID (Uji Coba Instan)
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                      Arahkan kamera ke QR ID milik warga atau gunakan tombol bypass di atas untuk melihat alur logic langsung
                    </p>
                    <div className="w-full h-px bg-slate-200" />
                  </div>
                </div>

                <div className="w-full min-h-[516px] p-4 bg-[#E6F5F4] rounded-[15px] border border-[#52C3BF] flex flex-col justify-between items-center gap-6">
                  <div className="relative w-full max-w-[560px] aspect-square rounded-[10px] overflow-hidden border-[5px] border-[#0B424F] bg-[#0B424F]">
                    <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />

                    {!isIdScannerReady && !idScanError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B424F]/80 text-white">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium font-['Poppins']">Menyalakan kamera...</span>
                      </div>
                    )}

                    {isResolvingWarga && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B424F]/80 text-white">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium font-['Poppins']">Memverifikasi ID warga...</span>
                      </div>
                    )}

                    {isIdScannerReady && !isResolvingWarga && (
                      <div className="absolute inset-6 border-2 border-dashed border-[#52C3BF] rounded-[10px] pointer-events-none" />
                    )}
                  </div>

                  {idScanError && (
                    <div className="w-full max-w-[531px] px-3.5 py-3 bg-red-50 border border-red-300 rounded-[10px] text-red-500 text-sm font-semibold font-['Poppins'] text-center">
                      {idScanError}
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-4">
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
                      className="self-center h-12 px-6 bg-[#FFF8E1] rounded-[10px] border border-[#FF8D28] flex items-center justify-center gap-2 text-[#E3A810] text-sm font-semibold font-['Poppins'] hover:bg-[#FFF1C6] transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload QR
                    </button>
                  </div>

                  <p className="text-[#1F6A76] text-base font-medium font-['Poppins'] text-center">
                    Diverifikasi Otomasi &amp; Terintegrasi
                  </p>
                </div>
              </section>
            )}

            {/* =============== STEP 2: VERIFIKASI COMPUTER VISION =============== */}
            {step === "SCAN_BOTOL" && (
              <>
                <section
                  className="flex-1 min-h-[645px] bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5 animate-fadeIn"
                  aria-labelledby="scan-botol-heading"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBackToScanId}
                      className="p-2 bg-[#E6F5F4] hover:bg-[#D2F0EE] rounded-lg text-[#0B424F] transition-colors"
                      title="Kembali ke Scan QR ID"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 id="scan-botol-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                      SCAN BOTOL
                    </h2>
                  </div>

                  <p className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                    Arahkan kamera ke botol/kaleng satu per satu, sistem AI akan menghitung otomatis
                  </p>
                  <div className="w-full h-px bg-slate-200" />

                  <div className="relative w-full min-h-[480px] rounded-[15px] overflow-hidden border-[5px] border-[#0B424F] bg-[#0B424F] flex-1">
                    <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />

                    {!isDetecting && !cvError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B424F]/80 text-white">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium font-['Poppins']">Menyalakan kamera...</span>
                      </div>
                    )}

                    {cvError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B424F]/90 text-white px-6 text-center">
                        <span className="text-sm font-medium font-['Poppins']">{cvError}</span>
                      </div>
                    )}

                    {isDetecting && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#52C3BF] rounded-full text-white text-xs font-bold font-['Poppins'] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Mendeteksi objek — {totalItemTerdeteksi} item
                      </div>
                    )}
                  </div>
                </section>

                <div className="w-full lg:w-[420px] flex flex-col gap-5 shrink-0">
                  {/* Card Penerima */}
                  <section className="bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5" aria-labelledby="penerima-heading">
                    <h2 id="penerima-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                      Penerima
                    </h2>
                    <div className="flex flex-col gap-4">
                      <span className="text-[#1F6A76] text-lg font-bold font-['Poppins']">
                        {scannedWarga?.nama ?? "-"}
                      </span>

                      <div className="flex flex-col gap-2">
                        <span className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                          Detail Barang
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {detectedItems.map((item) => (
                            <div
                              key={item.id}
                              className="px-5 py-2 bg-[#E6F5F4] rounded-[5px] flex justify-center items-center"
                            >
                              <span className="text-[#52C3BF] text-sm font-semibold font-['Poppins']">
                                {item.qty}x {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Card Rincian Biaya */}
                  <section className="bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5 flex-1" aria-labelledby="biaya-heading">
                    <h2 id="biaya-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                      Rincian Biaya
                    </h2>

                    <div className="flex flex-col gap-4">
                      <div className="w-full h-px bg-slate-200" />

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-semibold font-['Poppins']">
                          Estimasi Saldo Warga:
                        </span>
                        <span className="text-green-600 text-lg font-bold font-['Poppins']">
                          +{formatRupiah(totalSaldoWarga)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-semibold font-['Poppins']">
                          Estimasi Komisi Warung
                        </span>
                        <span className="text-[#36959B] text-lg font-bold font-['Poppins']">
                          +{formatRupiah(totalKomisiWarung)}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-4 bg-[#E6F5F4] rounded-2xl border border-[#52C3BF] flex flex-col items-center gap-6">
                      <div className="w-full h-12 px-3.5 bg-[#FFF8E1] rounded-[10px] border border-[#FF8D28] flex items-center justify-center">
                        <span className="text-[#E3A810] text-sm font-bold font-['Poppins'] text-center">
                          Pastikan sudah selesai scan sebelum konfirmasi
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm font-medium font-['Poppins'] text-center">
                        Diverifikasi Otomasi &amp; Terintegrasi
                      </p>

                      <div className="w-full flex gap-3">
                        <button
                          type="button"
                          onClick={handleBackToScanId}
                          className="flex-1 h-12 px-4 bg-white border border-[#36959B] rounded-[10px] flex items-center justify-center gap-2 text-[#36959B] text-sm font-semibold font-['Poppins'] hover:bg-slate-50 transition-colors"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          Ulangi
                        </button>
                        <button
                          type="button"
                          onClick={handleFinishScan}
                          disabled={totalItemTerdeteksi === 0}
                          className="flex-1 h-12 px-4 bg-[#52C3BF] hover:bg-[#36959B] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold font-['Poppins'] rounded-[10px] transition-colors"
                        >
                          Selesai Scan
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}

            {/* =============== STEP 3: KONFIRMASI SETORAN & PENCAIRAN =============== */}
            {step === "KONFIRMASI" && (
              <>
                <div className="w-full lg:w-[380px] flex flex-col gap-5 shrink-0 order-1">
                  {/* Card Penyetor */}
                  <section
                    className="bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5 animate-fadeIn"
                    aria-labelledby="penyetor-heading"
                  >
                    <h2 id="penyetor-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                      Penyetor
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[#1F6A76] text-lg font-bold font-['Poppins']">
                          {scannedWarga?.nama ?? "-"}
                        </span>
                        <div className="px-4 py-1.5 bg-[#E6F5F4] rounded-[5px] flex justify-center items-center">
                          <span className="text-[#52C3BF] text-sm font-semibold font-['Poppins']">
                            {scannedWarga?.id ?? "-"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                        Waktu:{" "}
                        {scanCompletedAt
                          ? `${scanCompletedAt.toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })} WIB`
                          : "-"}
                      </span>
                    </div>
                  </section>
                </div>

                {/* Card Rincian Material */}
                <section
                  className="flex-1 bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-8 animate-fadeIn order-2"
                  aria-labelledby="rincian-heading"
                >
                  <div className="flex flex-col gap-5">
                    <div>
                      <h1 className="text-[#0B424F] text-xl font-semibold font-['Mona_Sans']">
                        KONFIRMASI SETORAN BOTOL
                      </h1>
                      <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                        Mohon periksa kembali hasil deteksi AI sebelum mencairkan saldo.
                      </p>
                    </div>

                    <h2 id="rincian-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                      Rincian Material
                    </h2>

                    <div className="flex flex-col gap-4">
                      <div className="w-full h-px bg-slate-200" />
                      {detectedItems
                        .filter((item) => item.qty > 0)
                        .map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm font-semibold font-['Poppins']">
                              {item.qty}x {item.label === "Botol PET" ? "Botol Plastik PET" : "Kaleng Aluminium"}
                            </span>
                            <span
                              className={`text-lg font-bold font-['Poppins'] ${
                                item.id === "pet" ? "text-green-600" : "text-[#36959B]"
                              }`}
                            >
                              +{formatRupiah(item.qty * HARGA_PER_ITEM[item.id])}
                            </span>
                          </div>
                        ))}
                      {totalItemTerdeteksi === 0 && (
                        <p className="text-slate-400 text-sm font-medium font-['Poppins']">
                          Belum ada material yang terdeteksi.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-4 bg-[#E6F5F4] rounded-2xl border border-[#52C3BF] flex flex-col items-center gap-6">
                    <div className="w-full flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#0B424F] text-base font-semibold font-['Poppins']">
                          Total Saldo Untuk Warga
                        </span>
                        <span className="text-slate-700 text-xl font-bold font-['Poppins']">
                          {formatRupiah(totalSaldoWarga)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#0B424F] text-base font-semibold font-['Poppins']">
                          Komisi untuk Mitra Warung ({Math.round(KOMISI_WARUNG_PERSEN * 100)}%)
                        </span>
                        <span className="text-slate-700 text-xl font-bold font-['Poppins']">
                          {formatRupiah(totalKomisiWarung)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm font-medium font-['Poppins'] text-center">
                      Diverifikasi Otomasi &amp; Terintegrasi
                    </p>

                    <div className="w-full flex flex-col sm:flex-row justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleUlangScan}
                        className="h-12 px-7 bg-rose-100 hover:bg-rose-200 rounded-[10px] flex items-center justify-center gap-2 text-red-400 text-sm font-semibold font-['Poppins'] transition-colors"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Ulang Scan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDisbursementModal(true)}
                        disabled={totalItemTerdeteksi === 0}
                        className="h-12 px-7 bg-[#52C3BF] hover:bg-[#36959B] disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px] flex items-center justify-center gap-2 text-white text-sm font-semibold font-['Poppins'] transition-colors shadow-sm"
                      >
                        Cairkan Saldo ke Warga
                      </button>
                    </div>
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
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => {
                setShowDisbursementModal(false);
                setPinCode("");
                setDisbursementError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-2 text-center">
              <Lock className="w-10 h-10 text-[#52C3BF] mb-1" />
              <h3 className="text-[#0B424F] text-xl font-semibold">Masukkan PIN Warung</h3>
              <p className="text-[#36959B] text-xs">
                Saldo {formatRupiah(totalSaldoWarga)} akan langsung masuk ke dashboard warga, dan
                komisi {formatRupiah(totalKomisiWarung)} masuk ke dashboard warung Anda.
              </p>

              <div className="flex gap-3 my-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 border-[#52C3BF] transition-colors ${
                      i < pinCode.length ? "bg-[#52C3BF]" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {disbursementError && (
                <p className="text-red-500 text-xs font-semibold">{disbursementError}</p>
              )}
            </div>

            <div className="w-full max-w-[260px]">
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinPress(num)}
                    className="h-12 bg-slate-100 hover:bg-slate-200 rounded-[10px] flex items-center justify-center text-[#0B424F] text-base font-bold transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                  type="button"
                  onClick={() => handlePinPress("0")}
                  className="h-12 bg-slate-100 hover:bg-slate-200 rounded-[10px] flex items-center justify-center text-[#0B424F] text-base font-bold transition-colors active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPress("delete")}
                  className="h-12 bg-rose-50 hover:bg-rose-100 rounded-[10px] flex items-center justify-center text-rose-500 text-xs font-bold transition-colors active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitDisbursement}
              disabled={pinCode.length < 4 || isSubmittingDisbursement}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[10px] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {isSubmittingDisbursement && <Loader2 className="w-4 h-4 animate-spin" />}
              Cairkan Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ================= POP-UP SUKSES TRANSAKSI ================= */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-8 flex flex-col items-center text-center relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={handleCloseSuccessPopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Tutup pop-up"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-full bg-[#E6F5F4] flex items-center justify-center mb-6 text-[#52C3BF] shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-[#52C3BF]" />
            </div>

            <h3 className="text-[#0B424F] text-2xl font-bold mb-2">Saldo Berhasil Dicairkan!</h3>
            <p className="text-[#1F6A76] text-sm font-normal mb-2 leading-relaxed">
              {totalItemTerdeteksi} item dari {scannedWarga?.nama ?? "warga"} berhasil diverifikasi.
            </p>
            <p className="text-[#0B424F] text-base font-bold mb-8">
              +{formatRupiah(totalSaldoWarga)} masuk ke warga, +{formatRupiah(totalKomisiWarung)} masuk ke warung
            </p>

            <button
              type="button"
              onClick={handleCloseSuccessPopup}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-white font-bold text-sm rounded-[14px] transition-colors shadow-md"
            >
              Scan Warga Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}