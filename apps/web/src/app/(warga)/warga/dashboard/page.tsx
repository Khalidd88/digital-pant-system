"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { QRCodeSVG } from "qrcode.react";
import { 
  Bell, 
  User, 
  X, 
  Menu, 
  Home, 
  History, 
  UserPlus, 
  LogOut,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  Recycle,
  Store,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

export default function WargaDashboardPage() {
  const router = useRouter();

  // Mobile Drawer & Notifikasi
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  // User Profile & Realtime Data dari Backend
  const [userName, setUserName] = useState<string>("Warga PANTRA");
  const [qrId, setQrId] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [totalBottles, setTotalBottles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Modal QR Fullscreen untuk kemudahan scan kamera
  const [showFullQR, setShowFullQR] = useState<boolean>(false);

  // Ucapan Dinamis Sesuai Waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Fetch Profil & Saldo Realtime dari Backend Supabase
  const fetchDashboardData = useCallback(async (targetQr: string, silent = false) => {
    if (!targetQr) return;
    if (!silent) setIsRefreshing(true);

    try {
      const res = await fetch(`http://localhost:4000/api/user/${targetQr}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && json.data) {
        const u = json.data;
        setBalance(u.balance ?? 0);
        if (u.name) setUserName(u.name);

        // Hitung total botol yang pernah disetor
        if (Array.isArray(u.scanLogs)) {
          const count = u.scanLogs.reduce((acc: number, curr: any) => acc + (curr.bottleCount || 1), 0);
          setTotalBottles(count);
        }

        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Inisialisasi User Login dari LocalStorage & Jalankan Polling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedQr = localStorage.getItem("pantra_user_qr") || "USR-8921";
    const savedUserStr = localStorage.getItem("pantra_user");
    let activeName = "Warga PANTRA";

    if (savedUserStr) {
      try {
        const uObj = JSON.parse(savedUserStr);
        if (uObj.name) activeName = uObj.name;
      } catch (e) {}
    }

    setUserName(activeName);
    setQrId(savedQr);
    fetchDashboardData(savedQr);

    // Auto-polling tiap 4 detik agar saldo update otomatis saat disetor di warung
    const interval = setInterval(() => {
      fetchDashboardData(savedQr, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* SIDEBAR DESKTOP */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warga" />
        </div>

        {/* HEADER MOBILE & DRAWER */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-7 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fetchDashboardData(qrId)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                title="Perbarui Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>

              <button 
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors relative"
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
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{userName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{qrId}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                <Link href="/warga/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-[#52C3BF] text-white rounded-[14px] text-sm font-semibold shadow-sm">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/warga/riwayat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-[#235D6B] hover:bg-[#1F6A76] rounded-[14px] text-sm">
                  <History className="w-4 h-4" />
                  <span>Riwayat Aktivitas</span>
                </Link>
                <Link href="/warga/assistant" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-[#235D6B] hover:bg-[#1F6A76] rounded-[14px] text-sm">
                  <UserPlus className="w-4 h-4" />
                  <span>PANTRA Assistant</span>
                </Link>
                <Link 
                  href="/warga/login" 
                  onClick={() => {
                    localStorage.clear();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="flex items-center gap-3 px-4 py-3 bg-[#235D6B] hover:bg-red-950/40 text-red-300 rounded-[14px] text-sm mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Topbar Header Desktop */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-bold font-['Mona_Sans'] flex items-center gap-2">
                {getGreeting()}, {userName}! 👋
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                {lastUpdated ? `Sinkronisasi realtime terakhir: ${lastUpdated}` : "Memuat status akun terkini..."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => fetchDashboardData(qrId)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh manual data backend"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden xl:inline">Sinkronkan</span>
              </button>

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
                  <span className="text-sm font-semibold leading-tight">{userName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{qrId || "No QR"}</span>
                </div>
              </div>
            </div>
          </header>

          {/* DASHBOARD BODY */}
          <main className="p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-[1440px] w-full mx-auto font-['Mona_Sans']">
            
            {/* KOLOM KIRI: STATUS SALDO & STATISTIK */}
            <div className="w-full lg:w-[440px] flex flex-col gap-5 shrink-0">
              
              {/* Card Saldo Utama */}
              <div className="w-full bg-[linear-gradient(135deg,#0B424F_0%,#165463_60%,#36959B_100%)] rounded-[22px] p-6 text-white shadow-md flex flex-col justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-[-30px] bottom-[-30px] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col gap-1 z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8AD4D0] uppercase tracking-wider">
                      Saldo PANTRA Kamu
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
                    {loading ? (
                      <span className="text-2xl text-slate-300">Memuat...</span>
                    ) : (
                      `Rp${balance.toLocaleString("id-ID")}`
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 mt-1">
                    Bisa dibelanjakan langsung di Warung atau dicairkan ke E-Wallet.
                  </p>
                </div>

                {/* Tombol Tarik Saldo */}
                <div className="flex items-center gap-3 z-10 pt-2 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => router.push("/warga/tarik-saldo")}
                    className="flex-1 py-3 px-4 bg-[#52C3BF] hover:bg-teal-400 text-[#0B424F] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Tarik Saldo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <Link
                    href="/warga/riwayat"
                    className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-white/20 text-center"
                  >
                    Riwayat
                  </Link>
                </div>
              </div>

              {/* Card Statistik Setoran */}
              <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-[#0B424F]">Statistik Dampak Lingkungan</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Recycle className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold text-[#0B424F] mt-1">{totalBottles}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Botol Disetor</span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold text-[#0B424F] mt-1">Rp500</span>
                    <span className="text-[11px] text-slate-500 font-medium">Per Botol PET</span>
                  </div>
                </div>

                <div className="p-3 bg-[#E8F6F5] rounded-xl flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#36959B] shrink-0" />
                  <span className="text-xs text-[#0B424F] font-medium leading-relaxed">
                    Setiap botol bernilai Rp500 langsung masuk ke saldo begitu diverifikasi warung!
                  </span>
                </div>
              </div>

            </div>

            {/* KOLOM KANAN: IDENTITAS QR ID DIGITAL */}
            <div className="flex-1 bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-[#0B424F] text-lg font-bold">QR ID Warga</h2>
                  <p className="text-[#36959B] text-xs mt-0.5">
                    Tunjukkan QR code ini ke kamera Warung Mitra untuk mulai setor botol
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-[#E8F6F5] text-[#0B424F] px-3 py-1 rounded-lg border border-[#52C3BF]/30">
                  {qrId || "USR-8921"}
                </span>
              </div>

              {/* Kotak Tampilan QR Code */}
              <div className="w-full flex-1 bg-[#F3FEFD] rounded-2xl border-2 border-dashed border-[#52C3BF] p-6 sm:p-8 flex flex-col items-center justify-center gap-5">
                
                <div 
                  onClick={() => setShowFullQR(true)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:scale-105 transition-transform group flex flex-col items-center gap-2"
                  title="Klik untuk memperbesar QR Code"
                >
                  <QRCodeSVG 
                    value={qrId || "USR-8921"} 
                    size={230}
                    level="H"
                    includeMargin={false}
                    fgColor="#0B424F"
                  />
                  <span className="text-[10px] text-slate-400 font-medium group-hover:text-[#36959B] flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" />
                    Klik untuk memperbesar
                  </span>
                </div>

                {/* ID Tag Label */}
                <div className="w-full max-w-[380px] bg-white border border-[#BAE5E2] rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Nomor Identitas</span>
                    <span className="text-sm font-bold font-mono text-[#0B424F]">{qrId || "USR-8921"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Terverifikasi
                  </div>
                </div>

                <div className="text-center max-w-[400px]">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sistem otomatis PANTRA akan membaca ID ini dan mendata jumlah botol yang dimasukkan ke stasiun scanner warung mitra.
                  </p>
                </div>

              </div>

            </div>

          </main>
        </div>

      </div>

      {/* MODAL FULLSCREEN QR CODE */}
      {showFullQR && (
        <div 
          onClick={() => setShowFullQR(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl p-8 max-w-[380px] w-full flex flex-col items-center text-center shadow-2xl border border-slate-100 font-['Mona_Sans'] relative"
          >
            <button
              type="button"
              onClick={() => setShowFullQR(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-[#36959B] uppercase tracking-wider mb-1">PANTRA QR PASS</span>
            <h3 className="text-xl font-bold text-[#0B424F] mb-4">{userName}</h3>

            <div className="bg-white p-4 rounded-2xl border-2 border-[#52C3BF] shadow-md mb-4">
              <QRCodeSVG 
                value={qrId || "USR-8921"} 
                size={260}
                level="H"
                includeMargin={false}
                fgColor="#0B424F"
              />
            </div>

            <span className="font-mono text-base font-extrabold text-[#0B424F] bg-[#E8F6F5] px-4 py-1.5 rounded-xl border border-[#52C3BF]/30 mb-2">
              {qrId || "USR-8921"}
            </span>

            <p className="text-xs text-slate-500 mt-2">
              Arahkan layar ini tepat ke arah webcam / stasiun pemindai warung.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}