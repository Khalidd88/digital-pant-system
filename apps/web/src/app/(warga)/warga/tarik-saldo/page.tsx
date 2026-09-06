"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { 
  Bell, 
  User, 
  X, 
  Menu, 
  Home, 
  History, 
  UserPlus, 
  LogOut,
  Wallet,
  Store,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

type ChannelType = "WARUNG" | "DANA" | "GOPAY";

export default function TarikSaldoPage() {
  const router = useRouter();

  // Layout State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // User & Wallet State
  const [userName, setUserName] = useState("Warga PANTRA");
  const [qrId, setQrId] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);

  // Form State
  const [channel, setChannel] = useState<ChannelType>("WARUNG");
  const [amount, setAmount] = useState<string>("");
  const [destinationNumber, setDestinationNumber] = useState<string>("");
  
  // Submission & Feedback State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successResult, setSuccessResult] = useState<{
    transactionId: string;
    amountDeducted: number;
    remainingBalance: number;
    channel: string;
    message: string;
  } | null>(null);

  // 1. Ambil data User & Saldo Aktif dari Backend
  const fetchUserWallet = async (targetQr: string) => {
    if (!targetQr) return;
    setLoadingBalance(true);
    try {
      const res = await fetch(`https://pantra-production.up.railway.app/api/user/${targetQr}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBalance(json.data.balance ?? 0);
        if (json.data.name) setUserName(json.data.name);
      }
    } catch (err) {
      console.error("Gagal mengambil data saldo:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQr = localStorage.getItem("pantra_user_qr") || sessionStorage.getItem("pantra_user_qr") || "USR-8921";
      const savedUserStr = localStorage.getItem("pantra_user") || sessionStorage.getItem("pantra_user");
      let activeName = "Warga PANTRA";

      if (savedUserStr) {
        try {
          const userObj = JSON.parse(savedUserStr);
          if (userObj.name) activeName = userObj.name;
        } catch (e) {}
      }

      setUserName(activeName);
      setQrId(savedQr);
      fetchUserWallet(savedQr);
    }
  }, []);

  // Quick Amount Presets
  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
    setErrorMessage("");
  };

  const handleWithdrawAll = () => {
    setAmount(balance.toString());
    setErrorMessage("");
  };

  // 2. Submit Penarikan Saldo ke Backend
  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const numericAmount = parseInt(amount, 10);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Masukkan nominal penarikan yang valid (lebih dari Rp0).");
      return;
    }

    if (numericAmount > balance) {
      setErrorMessage(`Saldo tidak mencukupi. Saldo saat ini: Rp${balance.toLocaleString("id-ID")}`);
      return;
    }

    if ((channel === "DANA" || channel === "GOPAY") && !destinationNumber.trim()) {
      setErrorMessage("Nomor handphone tujuan e-wallet wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("https://pantra-production.up.railway.app/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: qrId || "USR-8921",
          amount: numericAmount,
          channel: channel,
          destinationNumber: channel !== "WARUNG" ? destinationNumber.trim() : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses penarikan saldo.");
      }

      // Update saldo lokal
      setBalance(json.data.remainingBalance);
      setSuccessResult({
        transactionId: json.data.transactionId,
        amountDeducted: json.data.amountDeducted,
        remainingBalance: json.data.remainingBalance,
        channel: json.data.channel,
        message: json.message,
      });

      // Reset form
      setAmount("");
      setDestinationNumber("");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menghubungi server backend.");
    } finally {
      setSubmitting(false);
    }
  };

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
                onClick={() => fetchUserWallet(qrId)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBalance ? "animate-spin" : ""}`} />
              </button>
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
                  <span className="text-sm font-semibold">{userName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{qrId}</span>
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                <Link href="/warga/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-[#235D6B] hover:bg-[#1F6A76] rounded-[12px] text-sm">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/warga/riwayat" className="flex items-center gap-3 px-4 py-2.5 bg-[#235D6B] hover:bg-[#1F6A76] rounded-[12px] text-sm">
                  <History className="w-4 h-4" />
                  <span>Riwayat Aktivitas</span>
                </Link>
                <Link href="/warga/assistant" className="flex items-center gap-3 px-4 py-2.5 bg-[#235D6B] hover:bg-[#1F6A76] rounded-[12px] text-sm">
                  <UserPlus className="w-4 h-4" />
                  <span>PANTRA Assistant</span>
                </Link>
                <Link href="/warga/login" onClick={() => localStorage.clear()} className="flex items-center gap-3 px-4 py-2.5 bg-[#235D6B] hover:bg-red-950/40 text-red-300 rounded-[12px] text-sm mt-1">
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Topbar Header Desktop */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-semibold font-['Mona_Sans']">
                Tarik Saldo &amp; Belanja Warung
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                Tukarkan hasil daur ulang botol plastikmu menjadi sembako atau saldo e-wallet instan
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => fetchUserWallet(qrId)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh saldo"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBalance ? "animate-spin" : ""}`} />
                <span className="hidden xl:inline">Perbarui Saldo</span>
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

          {/* Form Content */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col items-center justify-start max-w-[1000px] w-full mx-auto font-['Mona_Sans']">
            
            {/* SALDO CARD SUMMARY */}
            <div className="w-full bg-[linear-gradient(135deg,#0B424F_0%,#165463_50%,#36959B_100%)] rounded-[20px] p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden mb-6">
              <div className="absolute right-[-40px] bottom-[-40px] w-[180px] h-[180px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col gap-1 z-10">
                <span className="text-xs sm:text-sm text-[#8AD4D0] font-medium flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#52C3BF]" />
                  Total Saldo Dompet PANTRA
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                  Rp{balance.toLocaleString("id-ID")}
                </div>
                <span className="text-[11px] text-slate-300 mt-1">
                  Didapat dari setoran botol plastik PET (Rp500/botol)
                </span>
              </div>

              <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 flex flex-col items-start sm:items-end">
                <span className="text-[11px] text-slate-200">QR ID Warga</span>
                <span className="text-sm font-mono font-bold text-[#52C3BF]">{qrId || "USR-8921"}</span>
              </div>
            </div>

            {/* FORM CONTAINER */}
            <div className="w-full bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-[#0B424F]">Detail Pencairan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Pilih metode tujuan dan tentukan nominal penarikan</p>
              </div>

              {errorMessage && (
                <div className="p-3.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitWithdraw} className="flex flex-col gap-6">
                
                {/* 1. PILIH CHANNEL */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#0B424F]">Pilih Metode Penarikan</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Warung */}
                    <button
                      type="button"
                      onClick={() => setChannel("WARUNG")}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        channel === "WARUNG"
                          ? "border-[#52C3BF] bg-[#F3FEFD] ring-2 ring-[#52C3BF]/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F6F5] flex items-center justify-center text-[#36959B]">
                          <Store className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">Bebas Biaya</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B424F]">Warung Bu Tejo</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Belanja sembako langsung</div>
                      </div>
                    </button>

                    {/* DANA */}
                    <button
                      type="button"
                      onClick={() => setChannel("DANA")}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        channel === "DANA"
                          ? "border-[#52C3BF] bg-[#F3FEFD] ring-2 ring-[#52C3BF]/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-xs font-mono">
                          D
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">E-Wallet</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B424F]">DANA</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Transfer instan 24 jam</div>
                      </div>
                    </button>

                    {/* GoPay */}
                    <button
                      type="button"
                      onClick={() => setChannel("GOPAY")}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        channel === "GOPAY"
                          ? "border-[#52C3BF] bg-[#F3FEFD] ring-2 ring-[#52C3BF]/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs font-mono">
                          G
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">E-Wallet</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B424F]">GoPay</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Transfer instan 24 jam</div>
                      </div>
                    </button>

                  </div>
                </div>

                {/* 2. NOMOR TUJUAN (Jika E-Wallet) */}
                {channel !== "WARUNG" && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-[#0B424F]">
                      Nomor Handphone {channel} Tujuan
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                        +62
                      </div>
                      <input
                        type="tel"
                        placeholder="81234567890"
                        value={destinationNumber}
                        onChange={(e) => setDestinationNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-[#0B424F] focus:outline-none focus:border-[#52C3BF] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 3. NOMINAL PENARIKAN */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0B424F]">Nominal Penarikan (Rp)</label>
                    <button
                      type="button"
                      onClick={handleWithdrawAll}
                      className="text-[11px] font-bold text-[#36959B] hover:text-[#0B424F] underline"
                    >
                      Tarik Semua (Rp{balance.toLocaleString("id-ID")})
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0B424F] font-bold text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="Contoh: 5000"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setErrorMessage("");
                      }}
                      className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-base font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF] focus:bg-white"
                      min={500}
                      max={balance}
                      required
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[1000, 2000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickAmount(val)}
                        disabled={val > balance}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0B424F] hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        Rp{val.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submitting || balance <= 0}
                  className="w-full py-4 bg-[#52C3BF] hover:bg-teal-400 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memproses Penarikan di Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi Penarikan Saldo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

            </div>
          </main>
        </div>

      </div>

      {/* MODAL SUCCESS NOTIFICATION */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center font-['Mona_Sans']">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-[#0B424F]">Penarikan Berhasil!</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {successResult.message}
            </p>

            {/* Receipt Box */}
            <div className="w-full bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 my-5 flex flex-col gap-2.5 text-xs text-slate-600 text-left">
              <div className="flex justify-between">
                <span>Ref ID:</span>
                <span className="font-mono font-bold text-[#0B424F]">{successResult.transactionId.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold text-[#0B424F]">{successResult.channel}</span>
              </div>
              <div className="flex justify-between">
                <span>Nominal Ditarik:</span>
                <span className="font-bold text-rose-600">-Rp{successResult.amountDeducted.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#0B424F]">
                <span>Sisa Saldo:</span>
                <span className="text-teal-600">Rp{successResult.remainingBalance.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setSuccessResult(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0B424F] font-bold text-xs rounded-xl transition-colors"
              >
                Tarik Lagi
              </button>
              <button
                type="button"
                onClick={() => router.push("/warga/riwayat")}
                className="py-2.5 bg-[#52C3BF] hover:bg-teal-400 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Lihat Riwayat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}