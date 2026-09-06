"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar, { MenuItem } from "@/components/Sidebar";
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
  QrCode,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Building2,
  Smartphone,
  CreditCard,
  Copy,
  Clock,
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

const warungMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR Warga", href: "/warung/scan", icon: QrCode },
  { label: "Kelola Kas & Settlement", href: "/warung/dompet", icon: Wallet },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

export default function WarungDompetPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Tab Menu: TOPUP (Modal Kasir) vs SETTLEMENT (Tarik ke Rekening Bank)
  const [activeTab, setActiveTab] = useState<"TOPUP" | "SETTLEMENT">("TOPUP");

  // Identitas Warung Aktif
  const [warungName, setWarungName] = useState("Warung Mitra");
  const [warungId, setWarungId] = useState("WRG-0001");
  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);

  // State Top Up (Modal Kasir)
  const [topupAmount, setTopupAmount] = useState<string>("100000");
  const [topupChannel, setTopupChannel] = useState<"QRIS" | "BCA_VA">("QRIS");
  const [showDemoPayModal, setShowDemoPayModal] = useState<boolean>(false);
  const [isSimulatingPay, setIsSimulatingPay] = useState<boolean>(false);

  // State Settlement (Pencairan Kasir)
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [bankTarget, setBankTarget] = useState<string>("BCA");
  const [accountNumber, setAccountNumber] = useState<string>("8920192381");
  const [accountHolder, setAccountHolder] = useState<string>("BU TEJO");
  const [isSubmittingSettle, setIsSubmittingSettle] = useState<boolean>(false);

  // Feedback State
  const [feedbackAlert, setFeedbackAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Fetch Saldo Terkini
  const fetchWallet = useCallback(async (currentWarungId: string) => {
    if (!currentWarungId) return;
    setLoadingBalance(true);
    try {
      const res = await fetch(`https://pantra-production.up.railway.app/api/user/${currentWarungId}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setBalance(json.data.balance || 0);
        if (json.data.name) setWarungName(json.data.name);
      }
    } catch (e) {
      console.error("Gagal sinkron saldo warung:", e);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedId = localStorage.getItem("pantra_warung_id") || sessionStorage.getItem("pantra_warung_id") || "WRG-0001";
    const savedName = localStorage.getItem("pantra_warung_name") || sessionStorage.getItem("pantra_warung_name") || "Warung Mitra";
    setWarungId(savedId);
    setWarungName(savedName);
    fetchWallet(savedId);
  }, [fetchWallet]);

  // Eksekusi Simulasi Bayar Demo (Menembak Endpoint POST /api/wallet/topup)
  const handleExecuteDemoTopup = async () => {
    const num = parseInt(topupAmount, 10);
    if (isNaN(num) || num <= 0) {
      alert("Nominal tidak valid.");
      return;
    }

    setIsSimulatingPay(true);
    setFeedbackAlert(null);

    try {
      const res = await fetch("https://pantra-production.up.railway.app/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: warungId,
          amount: num,
          channel: topupChannel === "QRIS" ? "QRIS_DEMO" : "BCA_VA_DEMO",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses top up.");
      }

      setBalance(json.data.newBalance);
      setShowDemoPayModal(false);
      setFeedbackAlert({
        type: "success",
        msg: `Top Up Berhasil! Modal talangan kasir warung bertambah Rp${num.toLocaleString("id-ID")}.`,
      });
    } catch (err: any) {
      setFeedbackAlert({ type: "error", msg: err.message || "Gagal sinkron ke database." });
    } finally {
      setIsSimulatingPay(false);
    }
  };

  // Eksekusi Settlement Rekening (Menembak Endpoint POST /api/wallet/withdraw)
  const handleExecuteSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackAlert(null);

    const num = parseInt(settleAmount, 10);
    if (isNaN(num) || num <= 0) {
      setFeedbackAlert({ type: "error", msg: "Nominal penarikan tidak valid." });
      return;
    }

    if (num > balance) {
      setFeedbackAlert({ type: "error", msg: `Saldo kasir tidak mencukupi. Saldo aktif: Rp${balance.toLocaleString("id-ID")}` });
      return;
    }

    setIsSubmittingSettle(true);
    try {
      const res = await fetch("https://pantra-production.up.railway.app/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId: warungId,
          amount: num,
          channel: bankTarget,
          destinationNumber: accountNumber,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses settlement.");
      }

      setBalance(json.data.remainingBalance);
      setSettleAmount("");
      setFeedbackAlert({
        type: "success",
        msg: `Settlement Sukses! Dana Rp${num.toLocaleString("id-ID")} berhasil ditransfer ke rekening ${bankTarget} (${accountNumber} a.n ${accountHolder}).`,
      });
    } catch (err: any) {
      setFeedbackAlert({ type: "error", msg: err.message || "Gagal memproses penarikan settlement." });
    } finally {
      setIsSubmittingSettle(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR DESKTOP */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* HEADER MOBILE */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA" className="h-7 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchWallet(warungId)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBalance ? "animate-spin" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="mt-2.5 bg-[#0B424F] text-white p-5 rounded-[22px] flex flex-col gap-3 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2 bg-[#235D6B] rounded-xl">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{warungName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{warungId}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/dompet";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                        isActive ? "bg-[#52C3BF] text-white font-bold" : "bg-[#235D6B] hover:bg-[#1F6A76] text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-bold font-['Mona_Sans'] flex items-center gap-2">
                Manajemen Kas &amp; Settlement Warung 💳
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                Isi modal talangan kasir atau cairkan hasil penjualan sembako ke rekening bank Anda
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchWallet(warungId)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh saldo"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBalance ? "animate-spin" : ""}`} />
                <span className="hidden xl:inline">Perbarui Saldo</span>
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

          <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto font-['Mona_Sans']">
            
            {/* KARTU SALDO KAS UTAMA */}
            <div className="w-full bg-[linear-gradient(135deg,#0B424F_0%,#165463_60%,#36959B_100%)] rounded-[24px] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
              <div className="absolute right-[-40px] bottom-[-40px] w-[180px] h-[180px] bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-1 z-10">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8AD4D0] uppercase tracking-wider">
                  <Wallet className="w-4 h-4" />
                  Total Kasir Aktif Warung
                </div>
                <div className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1">
                  {loadingBalance ? "Memuat..." : `Rp${balance.toLocaleString("id-ID")}`}
                </div>
                <span className="text-xs text-slate-300 mt-1">
                  ID Mitra: <strong className="font-mono text-[#52C3BF]">{warungId}</strong> | Terintegrasi Supabase
                </span>
              </div>

              {/* TAB SWITCHER */}
              <div className="z-10 bg-black/20 p-1.5 rounded-2xl border border-white/10 flex gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("TOPUP");
                    setFeedbackAlert(null);
                  }}
                  className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "TOPUP"
                      ? "bg-[#52C3BF] text-[#0B424F] shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Isi Modal Kasir (Top Up)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("SETTLEMENT");
                    setFeedbackAlert(null);
                  }}
                  className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "SETTLEMENT"
                      ? "bg-[#52C3BF] text-[#0B424F] shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Tarik ke Rekening (Settlement)</span>
                </button>
              </div>
            </div>

            {/* ALERT FEEDBACK */}
            {feedbackAlert && (
              <div
                className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
                  feedbackAlert.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {feedbackAlert.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{feedbackAlert.msg}</span>
              </div>
            )}

            {/* TAB 1: TOP UP SALDO KASIR (DILENGKAPI DEMO MODE) */}
            {activeTab === "TOPUP" && (
              <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#0B424F]">Isi Modal Talangan Kasir</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gunakan saldo kasir untuk melayani transaksi talangan setoran botol dan sembako warga
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#FFF8E1] border border-[#FF8D28] text-[#E3A810] text-[11px] font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Demo Simulator Ready
                  </span>
                </div>

                {/* Pilih Metode Pembayaran */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#0B424F]">Metode Pembayaran Top Up</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTopupChannel("QRIS")}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        topupChannel === "QRIS"
                          ? "border-[#52C3BF] bg-[#F3FEFD] ring-2 ring-[#52C3BF]/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                          QRIS
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0B424F]">QRIS Instan (Semua Bank / E-Wallet)</div>
                          <div className="text-[11px] text-slate-400">BCA, Mandiri, GoPay, OVO, ShopeePay</div>
                        </div>
                      </div>
                      {topupChannel === "QRIS" && <CheckCircle2 className="w-5 h-5 text-[#52C3BF]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTopupChannel("BCA_VA")}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        topupChannel === "BCA_VA"
                          ? "border-[#52C3BF] bg-[#F3FEFD] ring-2 ring-[#52C3BF]/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          BCA
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0B424F]">BCA Virtual Account</div>
                          <div className="text-[11px] text-slate-400">Verifikasi otomatis 24 jam</div>
                        </div>
                      </div>
                      {topupChannel === "BCA_VA" && <CheckCircle2 className="w-5 h-5 text-[#52C3BF]" />}
                    </button>
                  </div>
                </div>

                {/* Pilih Nominal Top Up */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-[#0B424F]">Pilih Nominal Top Up (Rp)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["50000", "100000", "250000", "500000"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTopupAmount(val)}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                          topupAmount === val
                            ? "bg-[#0B424F] text-white border-[#0B424F] shadow-sm"
                            : "bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        Rp{parseInt(val, 10).toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#0B424F]">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="Atau ketik nominal manual..."
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF] focus:bg-white"
                      min={10000}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDemoPayModal(true)}
                  className="w-full py-4 bg-[#52C3BF] hover:bg-teal-400 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buka Tagihan Pembayaran / Simulator</span>
                </button>
              </div>
            )}

            {/* TAB 2: SETTLEMENT / PENARIKAN HASIL PENJUALAN KE REKENING PRIBADI */}
            {activeTab === "SETTLEMENT" && (
              <form onSubmit={handleExecuteSettlement} className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-[#0B424F]">Settlement Penjualan ke Rekening Pribadi</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cairkan hasil pembayaran sembako warga dan komisi daur ulang langsung ke rekening bank Anda
                  </p>
                </div>

                {/* Pilih Bank Tujuan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["BCA", "BRI", "MANDIRI"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankTarget(b)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        bankTarget === b
                          ? "border-[#52C3BF] bg-[#F3FEFD] ring-2 ring-[#52C3BF]/20 font-bold text-[#0B424F]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-[#36959B]" />
                        <span className="text-xs">Bank {b}</span>
                      </div>
                      {bankTarget === b && <CheckCircle2 className="w-4 h-4 text-[#52C3BF]" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B424F]">Nomor Rekening Tujuan</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B424F]">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#0B424F]">Nominal Settlement (Rp)</label>
                    <button
                      type="button"
                      onClick={() => setSettleAmount(balance.toString())}
                      className="text-[11px] font-bold text-[#36959B] hover:underline"
                    >
                      Tarik Semua (Rp{balance.toLocaleString("id-ID")})
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#0B424F]">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="Contoh: 150000"
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-bold text-[#0B424F] focus:outline-none focus:border-[#52C3BF]"
                      max={balance}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSettle || balance <= 0}
                  className="w-full py-4 bg-[#0B424F] hover:bg-[#1F6A76] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingSettle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memproses Settlement ke Supabase...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Penarikan ke Rekening Bank</span>
                  )}
                </button>
              </form>
            )}

          </main>
        </div>

      </div>

      {/* ================= MODAL SIMULATOR PEMBAYARAN TOP UP (DEMO MODE) ================= */}
      {showDemoPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn font-['Mona_Sans']">
          <div className="w-full max-w-[430px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative">
            <button
              type="button"
              onClick={() => setShowDemoPayModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[11px] font-bold mb-2">
              PANTRA BILLING GATEWAY
            </span>

            <h3 className="text-lg font-bold text-[#0B424F]">
              {topupChannel === "QRIS" ? "Pindai QRIS Top Up" : "BCA Virtual Account"}
            </h3>

            <div className="text-2xl font-extrabold text-[#0B424F] mt-1 mb-4">
              Rp{parseInt(topupAmount, 10).toLocaleString("id-ID")}
            </div>

            {/* QRIS Tampilan */}
            {topupChannel === "QRIS" ? (
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 flex flex-col items-center gap-2 mb-4">
                <QRCodeSVG
                  value={`PANTRA-TOPUP-${warungId}-${topupAmount}`}
                  size={180}
                  level="H"
                  fgColor="#0B424F"
                />
                <span className="text-[10px] font-mono text-slate-400">NMID: ID202619283719</span>
              </div>
            ) : (
              <div className="w-full bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 flex flex-col gap-2 mb-4 text-left">
                <span className="text-xs text-slate-400">Nomor Virtual Account BCA:</span>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-base font-bold text-[#0B424F]">80012 08123456789</span>
                  <button type="button" onClick={() => alert("Nomor VA disalin!")} className="text-xs text-[#36959B] font-bold flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Salin
                  </button>
                </div>
              </div>
            )}

            {/* TOMBOL SAKTI SIMULATOR DEMO */}
            <div className="w-full bg-[#FFF8E1] border border-[#FF8D28] rounded-2xl p-4 flex flex-col gap-2.5 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E3A810]">
                <Zap className="w-4 h-4 text-[#FF8D28]" />
                <span>Tombol Simulator Pitching / Demo</span>
              </div>
              <p className="text-[11px] text-slate-600 text-left">
                Klik tombol di bawah ini untuk mensimulasikan pembayaran instan sukses tanpa perlu transfer uang asli.
              </p>
              <button
                type="button"
                onClick={handleExecuteDemoTopup}
                disabled={isSimulatingPay}
                className="w-full py-3 bg-[#FF8D28] hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isSimulatingPay ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Saldo ke Supabase...</span>
                  </>
                ) : (
                  <span>⚡ Bayar Sekarang (Simulasi Berhasil)</span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDemoPayModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Batal &amp; Kembali
            </button>
          </div>
        </div>
      )}

    </div>
  );
}