"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar, { MenuItem } from "@/components/Sidebar";
import { 
  Bell, 
  User, 
  X, 
  Menu, 
  Home, 
  History, 
  UserPlus, 
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  QrCode,
  ScanLine,
  CheckCircle2,
  Lock,
  Wallet,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  Recycle
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

// URL Dinamis: Otomatis membaca env Vercel saat live atau fallback ke Railway production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pantra-production.up.railway.app";

interface VerificationItem {
  id: string;
  warga: string;
  detail: string;
  nominal: string;
  isPositive: boolean;
  tanggal: string;
  rawDate: number;
  status: "Diproses" | "Berhasil" | "Gagal";
}

const warungMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR Warga", href: "/warung/scan", icon: QrCode },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

const E_WALLETS = [
  { id: "gopay", name: "GoPay", fee: "Gratis" },
  { id: "dana", name: "DANA", fee: "Gratis" },
  { id: "ovo", name: "OVO", fee: "Rp1.000" },
  { id: "bca", name: "BCA Virtual Account", fee: "Gratis" },
];

export default function WarungDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Identitas Akun yang Sedang Login (Dinamis dari Session / LocalStorage)
  const [activeUserName, setActiveUserName] = useState<string>("Mitra PANTRA");
  const [activeUserId, setActiveUserId] = useState<string>("WRG-0001");

  const [balance, setBalance] = useState<number>(0);
  const [totalBottlesCollected, setTotalBottlesCollected] = useState<number>(0);
  const [activities, setActivities] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // State Modal Tarik Saldo (Wizard 3 Step)
  const [withdrawStep, setWithdrawStep] = useState<"nominal" | "method" | "pin" | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("gopay");
  const [pinCode, setPinCode] = useState<string>("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");

  // State Modal Verifikasi Cepat (Quick Bottle Deposit for Demo)
  const [showQuickVerifyModal, setShowQuickVerifyModal] = useState<boolean>(false);
  const [targetUserQr, setTargetUserQr] = useState<string>("USR-8921");
  const [bottleCount, setBottleCount] = useState<number>(3);
  const [materialType, setMaterialType] = useState<string>("PET");
  const [verifyingBottle, setVerifyingBottle] = useState<boolean>(false);
  const [verifyAlert, setVerifyAlert] = useState<string>("");

  // Format Angka ke Rupiah
  const formatRupiah = (val: number | string) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num) || num <= 0) return "Rp0";
    return `Rp${num.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB";
    } catch {
      return dateStr;
    }
  };

  // 1. Ambil Profil User, Saldo, dan Log Transaksi Realtime dari Backend
  const fetchUserData = useCallback(async (userIdToFetch: string, silent = false) => {
    if (!userIdToFetch) return;
    if (!silent) setIsRefreshing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${userIdToFetch}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && json.data) {
        const data = json.data;
        setBalance(data.balance ?? 0);
        
        // Update nama dan ID resmi jika terkonfirmasi dari database
        if (data.name) setActiveUserName(data.name);
        if (data.qrId) setActiveUserId(data.qrId);

        const list: VerificationItem[] = [];
        let bottlesSum = 0;

        // Map data Scan Log
        if (Array.isArray(data.scanLogs)) {
          data.scanLogs.forEach((scan: any, idx: number) => {
            const count = scan.bottleCount || 1;
            bottlesSum += count;
            list.push({
              id: scan.id ? scan.id.slice(0, 8).toUpperCase() : `SCN-${idx + 1}`,
              warga: scan.user?.name || scan.userQrId || "Warga Setor",
              detail: `${count}x Botol ${scan.material || "PET"}`,
              nominal: `+Rp${(scan.depositAmount || 0).toLocaleString("id-ID")}`,
              isPositive: true,
              tanggal: formatDate(scan.createdAt),
              rawDate: new Date(scan.createdAt).getTime(),
              status: scan.status === "FAILED" ? "Gagal" : "Berhasil"
            });
          });
        }

        // Map data penarikan saldo
        if (Array.isArray(data.walletTransactions)) {
          data.walletTransactions.forEach((tx: any, idx: number) => {
            list.push({
              id: tx.id ? tx.id.slice(0, 8).toUpperCase() : `WD-${idx + 1}`,
              warga: `Pencairan Saldo (${tx.channel})`,
              detail: tx.description || `Transfer e-wallet ${tx.destinationNumber || ""}`,
              nominal: `-Rp${(tx.amount || 0).toLocaleString("id-ID")}`,
              isPositive: false,
              tanggal: formatDate(tx.createdAt),
              rawDate: new Date(tx.createdAt).getTime(),
              status: "Berhasil"
            });
          });
        }

        list.sort((a, b) => b.rawDate - a.rawDate);
        setActivities(list);
        setTotalBottlesCollected(bottlesSum);
      }
    } catch (err) {
      console.error("Gagal sinkron data user:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Inisialisasi Dinamis: Deteksi User yang Login dari Seluruh Storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    let detectedName = "Mitra PANTRA";
    let detectedId = "";

    // 1. Cek penyimpanan JSON terstruktur
    const savedUserStr = localStorage.getItem("pantra_user") || sessionStorage.getItem("pantra_user");
    if (savedUserStr) {
      try {
        const userObj = JSON.parse(savedUserStr);
        if (userObj.name) detectedName = userObj.name;
        if (userObj.qrId || userObj.id) detectedId = userObj.qrId || userObj.id;
      } catch (e) {
        console.warn("Gagal parse pantra_user:", e);
      }
    }

    // 2. Cek key individual
    const directName = 
      localStorage.getItem("pantra_warung_name") || 
      localStorage.getItem("pantra_user_name") || 
      sessionStorage.getItem("pantra_warung_name");
      
    const directId = 
      localStorage.getItem("pantra_warung_id") || 
      localStorage.getItem("pantra_user_qr") || 
      sessionStorage.getItem("pantra_warung_id");

    if (directName) detectedName = directName;
    if (directId) detectedId = directId;

    // Fallback default jika baru pertama kali buka browser
    if (!detectedId) detectedId = "WRG-0001";

    setActiveUserName(detectedName);
    setActiveUserId(detectedId);

    // Ambil data pertama kali & polling otomatis tiap 5 detik
    fetchUserData(detectedId);

    const interval = setInterval(() => {
      fetchUserData(detectedId, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchUserData]);

  // Handler Numpad Virtual Mobile (Nominal Tarik Saldo)
  const handleNumpadPress = (value: string) => {
    if (value === "back") {
      setWithdrawStep(null);
      setWithdrawAmount("");
    } else if (value === "delete") {
      setWithdrawAmount((prev) => prev.slice(0, -1));
    } else {
      if (withdrawAmount === "" && value === "0") return;
      if (withdrawAmount.length < 9) {
        setWithdrawAmount((prev) => prev + value);
      }
    }
  };

  // Handler PIN Virtual Numpad
  const handlePinPress = (value: string) => {
    if (value === "delete") {
      setPinCode((prev) => prev.slice(0, -1));
    } else {
      if (pinCode.length < 6) {
        setPinCode((prev) => prev + value);
      }
    }
  };

  // 2. Submit Penarikan Saldo Riil ke Backend
  const handleExecuteWithdraw = async () => {
    if (pinCode.length < 4) {
      alert("Masukkan PIN keamanan penarikan minimal 4 digit.");
      return;
    }

    const numericAmount = parseInt(withdrawAmount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Nominal penarikan tidak valid.");
      return;
    }

    if (numericAmount > balance) {
      alert(`Saldo tidak mencukupi! Saldo aktif: Rp${balance.toLocaleString("id-ID")}`);
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: activeUserId,
          amount: numericAmount,
          channel: selectedWallet.toUpperCase(),
          destinationNumber: "081234567890"
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mencairkan saldo.");
      }

      setBalance(json.data.remainingBalance);
      setPopupMessage(`Penarikan ${formatRupiah(numericAmount)} ke ${selectedWallet.toUpperCase()} berhasil diajukan dan diproses!`);
      setWithdrawStep(null);
      setPinCode("");
      setWithdrawAmount("");
      setShowPopup(true);
      fetchUserData(activeUserId, true);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses penarikan.");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  // 3. Eksekusi Verifikasi Setoran Botol Warga Cepat (Demo Pitching Helper)
  const handleVerifyBottleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyAlert("");

    if (!targetUserQr.trim()) {
      setVerifyAlert("Masukkan QR ID Warga (contoh: USR-8921)");
      return;
    }

    setVerifyingBottle(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/scan/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQrId: targetUserQr.trim(),
          material: materialType,
          bottleCount: Number(bottleCount),
          warungId: activeUserId
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Verifikasi botol gagal.");
      }

      setShowQuickVerifyModal(false);
      setPopupMessage(`Verifikasi Sukses! ${bottleCount}x Botol ${materialType} telah disetor oleh ${targetUserQr}. Saldo warga bertambah Rp${(json.data?.depositEarned || bottleCount * 500).toLocaleString("id-ID")}.`);
      setShowPopup(true);

      // Refresh data dashboard seketika
      fetchUserData(activeUserId, true);
    } catch (err: any) {
      setVerifyAlert(err.message || "Gagal menghubungi endpoint verifikasi.");
    } finally {
      setVerifyingBottle(false);
    }
  };

  // Filter Tabel
  const filteredData = useMemo(() => {
    return activities.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.warga.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.nominal.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [activities, searchQuery]);

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, startIndex, entriesPerPage]);

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* ================= 2. HEADER & NAVBAR (Mobile Only) ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-7 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fetchUserData(activeUserId)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                title="Sinkronkan data"
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
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-xs rounded-xl shadow-lg border border-slate-100 font-['Poppins']">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-2.5 bg-[#0B424F] text-white p-5 rounded-[22px] flex flex-col gap-3 shadow-2xl border border-[#235D6B] animate-fadeIn">
              {/* Profile Card Mobile: Dinamis sesuai yang login */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{activeUserName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{activeUserId}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/dashboard";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-[#52C3BF] text-white shadow-sm font-bold" 
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
                    localStorage.removeItem("pantra_user");
                    localStorage.removeItem("pantra_user_qr");
                    localStorage.removeItem("pantra_warung_id");
                    localStorage.removeItem("pantra_warung_name");
                    sessionStorage.clear();
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
          
          {/* Topbar Header (Desktop Only): Menyapa User Dinamis */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-bold font-['Mona_Sans'] flex items-center gap-2">
                Halo, {activeUserName}! 👋
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                ID Akun: <span className="font-mono font-bold text-[#0B424F]">{activeUserId}</span> • Validasi botol &amp; pantau rekam transaksi realtime
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => fetchUserData(activeUserId)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Sinkronisasi data backend"
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

              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-5 h-5 text-[#0B424F]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold leading-tight">{activeUserName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{activeUserId}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Body */}
          <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] w-full mx-auto font-['Mona_Sans']">
            
            {/* Top Widget Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
              
              {/* Card 1: Saldo Kas Utama */}
              <section className="bg-[linear-gradient(135deg,#0B424F_0%,#165463_60%,#36959B_100%)] rounded-[22px] p-6 text-white shadow-md flex flex-col justify-between gap-5 relative overflow-hidden">
                <div className="absolute right-[-30px] bottom-[-30px] w-[140px] h-[140px] bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col gap-1 z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8AD4D0] uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      Saldo Kas ({activeUserName})
                    </span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                      Live Supabase
                    </span>
                  </div>

                  <strong className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
                    {loading ? "Memuat..." : formatRupiah(balance)}
                  </strong>
                  
                  <span className="text-[11px] text-slate-300 mt-1">
                    Saldo kas dapat dicairkan langsung ke rekening bank atau e-wallet.
                  </span>
                </div>

                <div className="flex items-center gap-2.5 z-10 pt-3 border-t border-white/15">
                  <button 
                    type="button"
                    onClick={() => setWithdrawStep("nominal")}
                    className="flex-1 py-2.5 px-4 bg-[#52C3BF] hover:bg-teal-400 text-[#0B424F] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Tarik Saldo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

              {/* Card 2: Statistik Pengumpulan Botol */}
              <section className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Statistik Daur Ulang
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Recycle className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-[#0B424F]">{totalBottlesCollected}</span>
                    <span className="text-xs text-slate-500 font-medium">Botol PET Terkumpul</span>
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100 text-[11px] text-[#36959B] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Setiap verifikasi botol menambah Rp500 ke saldo warga secara otomatis.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuickVerifyModal(true)}
                  className="w-full py-2.5 bg-[#E8F6F5] hover:bg-[#d5f0ee] text-[#0B424F] font-bold text-xs rounded-xl transition-colors border border-[#52C3BF]/30 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#36959B]" />
                  <span>Verifikasi Setoran Cepat (Demo)</span>
                </button>
              </section>

              {/* Card 3: Action Scanner Kamera */}
              <section className="bg-[#E6F5F4] rounded-[22px] p-6 shadow-sm border border-[#52C3BF] flex flex-col items-center justify-between text-center gap-4 relative overflow-hidden group">
                <ScanLine className="absolute -right-6 -bottom-6 w-36 h-36 text-[#52C3BF] opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

                <div className="z-10 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#52C3BF] text-[#0B424F]">
                    <QrCode className="w-7 h-7 text-[#36959B]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0B424F]">Pindai QR ID Warga</h3>
                  <p className="text-[11px] text-[#1F6A76] max-w-[220px] leading-relaxed">
                    Buka kamera pemindai untuk membaca barcode/QR ID di ponsel warga
                  </p>
                </div>

                <Link
                  href="/warung/scan"
                  className="z-10 w-full py-3 bg-[#0B424F] hover:bg-[#1F6A76] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Buka Kamera Scanner</span>
                </Link>
              </section>

            </div>

            {/* Riwayat Verifikasi Terakhir Table */}
            <section className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-[#0B424F] text-base sm:text-lg font-bold">Riwayat Verifikasi &amp; Transaksi</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Tersinkronisasi langsung dari database PostgreSQL Supabase</p>
                </div>

                <div className="w-full sm:w-64 h-10 px-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center gap-2 focus-within:border-[#52C3BF] focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-[#36959B] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari warga, botol, ref..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-transparent text-xs text-[#0B424F] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Table Toolbar */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:border-[#52C3BF]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                  <span>Entries</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Total {totalEntries} Aktivitas Terdaftar
                </span>
              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-100 text-slate-600 text-xs font-semibold">
                      <th className="py-3 px-3 text-center w-14">No</th>
                      <th className="py-3 px-3">Warga / Transaksi</th>
                      <th className="py-3 px-3">Detail Material</th>
                      <th className="py-3 px-3">Nominal (Rp)</th>
                      <th className="py-3 px-3 text-center">Waktu</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#52C3BF]" />
                            <span className="text-xs">Memuat transaksi dari Supabase...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          Belum ada aktivitas verifikasi. Gunakan tombol scanner atau Verifikasi Cepat di atas!
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-[#F3FEFD]/50 transition-colors">
                          <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {startIndex + idx + 1}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-[#0B424F]">{row.warga}</td>
                          <td className="py-3.5 px-3 text-slate-600 font-medium">{row.detail}</td>
                          <td
                            className={`py-3.5 px-3 font-bold ${
                              row.isPositive ? "text-teal-600" : "text-rose-500"
                            }`}
                          >
                            {row.nominal}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-400 whitespace-nowrap">
                            {row.tanggal}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                                row.status === "Diproses"
                                  ? "bg-amber-100 text-amber-700"
                                  : row.status === "Berhasil"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-600"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 text-xs text-slate-600">
                <span>
                  Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  <span className="px-3 py-1.5 bg-[#52C3BF] text-white rounded-lg text-xs font-bold shadow-sm">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage >= totalPages || loading}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </section>
          </main>
        </div>

      </div>

      {/* ================= 4. MODAL WIZARD PENARIKAN SALDO ================= */}
      
      {/* STEP 1: Masukkan Nominal */}
      {withdrawStep === "nominal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-5 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => setWithdrawStep(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-2 text-center">
              <h3 className="text-[#52C3BF] text-2xl font-bold">Masukkan Nominal</h3>
              <p className="text-xs text-slate-400">Saldo aktif: {formatRupiah(balance)}</p>

              <div className="px-5 py-2.5 bg-[#E8F6F5] rounded-xl inline-flex items-center justify-center min-w-[140px] border border-[#52C3BF]/30 mt-1">
                <input
                  type="text"
                  value={withdrawAmount ? `Rp${parseInt(withdrawAmount, 10).toLocaleString("id-ID")}` : "Rp0"}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setWithdrawAmount(raw);
                  }}
                  className="hidden md:block w-full text-center bg-transparent text-[#0B424F] text-lg font-bold focus:outline-none"
                  placeholder="Rp0"
                />
                <span className="block md:hidden text-[#0B424F] text-lg font-bold">
                  {withdrawAmount ? `Rp${parseInt(withdrawAmount, 10).toLocaleString("id-ID")}` : "Rp0"}
                </span>
              </div>
            </div>

            {/* Virtual Numpad Mobile */}
            <div className="block md:hidden w-full max-w-[280px]">
              <div className="grid grid-cols-3 gap-2.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpadPress(num)}
                    className="h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-[#0B424F] text-base font-bold active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("back")}
                  className="h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("0")}
                  className="h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-[#0B424F] text-base font-bold"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("delete")}
                  className="h-11 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center text-rose-500 text-xs font-bold"
                >
                  Hapus
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 w-full">
              {[25000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWithdrawAmount(val.toString())}
                  className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200"
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const num = parseInt(withdrawAmount, 10);
                if (isNaN(num) || num <= 0) {
                  alert("Masukkan nominal penarikan yang valid.");
                  return;
                }
                if (num > balance) {
                  alert("Saldo tidak mencukupi.");
                  return;
                }
                setWithdrawStep("method");
              }}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-white font-bold text-sm rounded-xl transition-colors shadow-md"
            >
              Lanjutkan ke Metode
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pilih Metode E-Wallet */}
      {withdrawStep === "method" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-5 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => setWithdrawStep(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-1 text-center">
              <Wallet className="w-9 h-9 text-[#52C3BF] mb-1" />
              <h3 className="text-[#0B424F] text-lg font-bold">Pilih Akun Rekening Tujuan</h3>
              <p className="text-xs text-[#36959B]">Nominal: {formatRupiah(withdrawAmount)}</p>
            </div>

            <div className="w-full flex flex-col gap-2">
              {E_WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWallet(wallet.id)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedWallet === wallet.id
                      ? "border-[#52C3BF] bg-[#E8F6F5] text-[#0B424F] font-bold ring-1 ring-[#52C3BF]"
                      : "border-slate-200 bg-white text-slate-600 font-medium"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold">{wallet.name}</span>
                    <span className="text-[10px] text-slate-400">Biaya Admin: {wallet.fee}</span>
                  </div>
                  {selectedWallet === wallet.id && <CheckCircle2 className="w-5 h-5 text-[#52C3BF]" />}
                </button>
              ))}
            </div>

            <div className="w-full flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setWithdrawStep("nominal")}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => setWithdrawStep("pin")}
                className="w-2/3 py-3 bg-[#52C3BF] hover:bg-[#36959B] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Lanjut ke PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Masukkan PIN Penarikan */}
      {withdrawStep === "pin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-5 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => setWithdrawStep(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-1 text-center">
              <Lock className="w-9 h-9 text-[#52C3BF] mb-1" />
              <h3 className="text-[#0B424F] text-lg font-bold">Masukkan PIN Keamanan</h3>
              <p className="text-xs text-slate-400">Konfirmasi pencairan {formatRupiah(withdrawAmount)}</p>

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

            <div className="w-full flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setWithdrawStep("method")}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleExecuteWithdraw}
                disabled={submittingWithdraw}
                className="w-2/3 py-3 bg-[#52C3BF] hover:bg-[#36959B] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                {submittingWithdraw ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Cairkan Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. MODAL QUICK VERIFICATION (DEMO HELPER) ================= */}
      {showQuickVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn font-['Mona_Sans']">
          <div className="w-full max-w-[440px] bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setShowQuickVerifyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F6F5] text-[#36959B] flex items-center justify-center">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B424F]">Verifikasi Setoran Cepat</h3>
                <p className="text-[11px] text-slate-400">Simulasikan proses scanner kamera untuk demo</p>
              </div>
            </div>

            {verifyAlert && (
              <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{verifyAlert}</span>
              </div>
            )}

            <form onSubmit={handleVerifyBottleSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#0B424F]">QR ID Warga</label>
                <input
                  type="text"
                  value={targetUserQr}
                  onChange={(e) => setTargetUserQr(e.target.value.toUpperCase())}
                  placeholder="Contoh: USR-8921"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-mono font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#0B424F]">Jumlah Botol</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bottleCount}
                    onChange={(e) => setBottleCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#0B424F]">Material</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF]"
                  >
                    <option value="PET">Plastik PET (Rp500)</option>
                    <option value="HDPE">Plastik HDPE (Rp600)</option>
                    <option value="CAN">Kaleng Aluminium (Rp800)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#E8F6F5] rounded-xl flex justify-between items-center text-[#0B424F] font-bold">
                <span>Insentif Masuk ke Warga:</span>
                <span className="text-sm text-teal-700">Rp{(bottleCount * 500).toLocaleString("id-ID")}</span>
              </div>

              <button
                type="submit"
                disabled={verifyingBottle}
                className="w-full py-3 bg-[#52C3BF] hover:bg-teal-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-1"
              >
                {verifyingBottle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghubungi AI Backend...</span>
                  </>
                ) : (
                  <span>Konfirmasi &amp; Tambah Saldo Warga</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 6. POP-UP SUKSES UMUM ================= */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn font-['Poppins']">
          <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-7 flex flex-col items-center text-center relative border border-slate-100">
            <button 
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#E6F5F4] flex items-center justify-center mb-4 text-[#52C3BF]">
              <CheckCircle2 className="w-10 h-10 text-[#52C3BF]" />
            </div>

            <h3 className="text-[#0B424F] text-xl font-bold mb-2">
              Transaksi Berhasil!
            </h3>
            <p className="text-[#1F6A76] text-xs sm:text-sm font-normal mb-6 leading-relaxed">
              {popupMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="w-full py-3 bg-[#52C3BF] hover:bg-[#36959B] text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}