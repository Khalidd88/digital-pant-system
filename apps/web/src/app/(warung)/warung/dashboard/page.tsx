"use client";

import { useState } from "react";
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
  Wallet
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

// Mock Data untuk Riwayat Verifikasi Terakhir (Warung)
interface VerificationItem {
  id: string;
  warga: string;
  detail: string;
  nominal: string;
  isPositive: boolean;
  status: "Diproses" | "Berhasil" | "Gagal";
}

const mockData: VerificationItem[] = [
  {
    id: "01",
    warga: "Ahmad Rafli",
    detail: "15x Botol PET",
    nominal: "-Rp10.000",
    isPositive: false,
    status: "Diproses",
  },
  {
    id: "02",
    warga: "Siti Aminah",
    detail: "3x Botol PET",
    nominal: "+Rp1.500",
    isPositive: true,
    status: "Berhasil",
  },
  {
    id: "03",
    warga: "Budi Santoso",
    detail: "3x Botol PET",
    nominal: "+Rp1.500",
    isPositive: true,
    status: "Gagal",
  },
  {
    id: "04",
    warga: "Diana Putri",
    detail: "10x Kaleng",
    nominal: "-Rp10.000",
    isPositive: false,
    status: "Berhasil",
  },
];

// Menu khusus untuk role Warung
const warungMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR Warga", href: "/warung/scan", icon: QrCode },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

const E_WALLETS = [
  { id: "gopay", name: "GoPay" },
  { id: "ovo", name: "OVO" },
  { id: "dana", name: "DANA" },
  { id: "bca", name: "BCA Virtual Account" },
];

export default function WarungDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");

  // State Modal Tarik Saldo & Alur Wizard
  const [withdrawStep, setWithdrawStep] = useState<"nominal" | "method" | "pin" | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("gopay");
  const [pinCode, setPinCode] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [withdrawMessage, setWithdrawMessage] = useState<string>("");

  const balance = "Rp. 12.000,00";

  // Format Angka ke Rupiah
  const formatRupiah = (val: string) => {
    if (!val) return "Rp.0,-";
    const num = parseInt(val, 10);
    if (isNaN(num)) return "Rp.0,-";
    return `Rp.${num.toLocaleString("id-ID")},-`;
  };

  // Handler Numpad Virtual (Mobile Nominal)
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

  // Handler Numpad PIN
  const handlePinPress = (value: string) => {
    if (value === "delete") {
      setPinCode((prev) => prev.slice(0, -1));
    } else {
      if (pinCode.length < 6) {
        setPinCode((prev) => prev + value);
      }
    }
  };

  // Finalisasi Tarik Saldo
  const handleSubmitWithdraw = () => {
    if (pinCode.length < 4) {
      alert("Masukkan PIN penarikan dengan benar.");
      return;
    }
    setWithdrawStep(null);
    setPinCode("");
    setShowPopup(true);
    setWithdrawMessage(`Penarikan ${formatRupiah(withdrawAmount)} via ${selectedWallet.toUpperCase()} berhasil diajukan.`);
    setWithdrawAmount("");
  };

  // Filter pencarian tabel
  const filteredData = mockData.filter(
    (item) =>
      item.warga.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* ================= 2. HEADER & NAVBAR (Mobile Only) ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-4 px-4 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between px-5 py-3.5 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[20px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={vectorLogo}
                alt="PANTRA Logo"
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
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
                <span className="text-sm font-medium font-['Mona_Sans']">Warung Bu Tejo</span>
              </div>

              <nav className="flex flex-col gap-3">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/dashboard";
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
                  href="/auth/warung/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-red-950/40 text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins'] mt-2"
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
                Selamat Pagi, Mitra PANTRA 👋
              </h1>
              <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                Siap melayani setoran warga hari ini?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-3.5 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors"
              >
                <Bell className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-6 h-6 text-[#0B424F]" />
                <span className="text-base font-medium font-['Mona_Sans'] hidden sm:inline">Warung Bu Tejo</span>
              </div>
            </div>
          </header>

          {/* Dashboard Body */}
          <main className="p-4 md:p-8 flex flex-col gap-6 max-w-[1440px] w-full mx-auto">
            
            <h2 className="text-[#0B424F] text-lg font-medium font-['Mona_Sans']">
              Siap menerima setoran botol warga hari ini?
            </h2>
            
            {/* Top Cards Section */}
            <div className="flex flex-col lg:flex-row gap-5 w-full">
              
              {/* Saldo Card */}
              <section className="w-full lg:w-[497px] min-h-[220px] bg-white rounded-[15px] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between gap-5 shrink-0">
                <div className="flex flex-col gap-5">
                  <h3 className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                    Saldo PANTRA Kamu
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#36959B] text-xs font-bold font-['Poppins']">
                        Saldo
                      </span>
                      <strong className="text-[#0B424F] text-2xl md:text-3xl font-bold font-['Poppins']">
                        {balance}
                      </strong>
                    </div>

                    <div className="inline-flex px-3.5 py-2 bg-[#E6F5F4] rounded-[5px] w-fit border border-[#BAE5E2]">
                      <span className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                        Tersedia untuk ditarik
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => setWithdrawStep("nominal")}
                    className="w-[142px] h-[48px] bg-[#52C3BF] hover:bg-[#36959B] text-white text-sm font-semibold font-['Poppins'] rounded-[10px] transition-colors shadow-sm"
                  >
                    Tarik Saldo
                  </button>
                  {withdrawMessage && (
                    <span className="text-xs text-[#36959B] font-medium font-['Poppins']">
                      {withdrawMessage}
                    </span>
                  )}
                </div>
              </section>

              {/* Scan QR Widget */}
              <section className="flex-1 min-h-[220px] bg-[#E6F5F4] rounded-[15px] p-6 shadow-sm border border-[#52C3BF] flex flex-col items-center justify-center gap-5 relative overflow-hidden group">
                <ScanLine className="absolute -right-6 -bottom-6 w-48 h-48 text-[#52C3BF] opacity-10 group-hover:scale-110 transition-transform duration-500" />
                
                <div className="z-10 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-[#52C3BF] text-[#0B424F]">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <p className="text-[#1F6A76] text-sm font-medium font-['Poppins']">
                    Proses setoran botol atau penarikan dengan cepat
                  </p>
                </div>

                <Link
                  href="/warung/scan"
                  className="z-10 px-8 py-3 bg-[#0B424F] hover:bg-[#1F6A76] text-white text-sm font-semibold font-['Poppins'] rounded-[10px] transition-colors shadow-md flex items-center gap-2"
                >
                  <ScanLine className="w-4 h-4" />
                  Scan QR Warga
                </Link>
              </section>

            </div>

            {/* Riwayat Verifikasi Terakhir Table */}
            <section className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col gap-6 font-['Mona_Sans']">
              <h2 className="text-[#0B424F] text-lg font-bold">Riwayat Verifikasi Terakhir</h2>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-stone-300 rounded text-slate-700 focus:outline-none focus:border-[#52C3BF]"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span>Entries</span>
                </div>

                <div className="w-full sm:w-60 h-10 px-3.5 bg-white rounded-lg border border-stone-300 flex items-center gap-2 focus-within:border-[#52C3BF] transition-colors">
                  <Search className="w-4 h-4 text-[#36959B]" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#0B424F] placeholder:text-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-slate-700 text-xs font-semibold">
                      <th className="py-3 px-2 text-center w-12">No</th>
                      <th className="py-3 px-3">Warga / Transaksi</th>
                      <th className="py-3 px-3">Detail Material</th>
                      <th className="py-3 px-3">Nominal (Rp)</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
                    {filteredData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-2 text-center text-slate-500 font-normal">{row.id}</td>
                        <td className="py-3.5 px-3 font-bold text-[#0B424F]">{row.warga}</td>
                        <td className="py-3.5 px-3 text-slate-600">{row.detail}</td>
                        <td
                          className={`py-3.5 px-3 font-semibold ${
                            row.isPositive ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {row.nominal}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold text-white ${
                              row.status === "Diproses"
                                ? "bg-orange-300"
                                : row.status === "Berhasil"
                                ? "bg-emerald-400"
                                : "bg-red-400"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 text-xs text-slate-600">
                <span>Showing 1 to {filteredData.length} of {filteredData.length} entries</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 bg-[#52C3BF] text-white rounded-lg text-xs font-bold flex items-center justify-center shadow-sm"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors flex items-center gap-1"
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
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => setWithdrawStep(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-3 text-center">
              <h3 className="text-[#52C3BF] text-2xl font-semibold">Masukkan Nominal</h3>

              <div className="px-4 py-2 bg-[#E8F6F5] rounded-[5px] inline-flex items-center justify-center min-w-[120px]">
                <input
                  type="text"
                  value={formatRupiah(withdrawAmount)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setWithdrawAmount(raw);
                  }}
                  className="hidden md:block w-full text-center bg-transparent text-[#52C3BF] text-sm font-semibold focus:outline-none"
                  placeholder="Rp.0,-"
                />
                <span className="block md:hidden text-[#52C3BF] text-sm font-semibold">
                  {formatRupiah(withdrawAmount)}
                </span>
              </div>
              <p className="text-[#0B424F] text-sm md:text-base font-normal">Konfirmasi penarikan saldo</p>
            </div>

            {/* Virtual Numpad Mobile */}
            <div className="block md:hidden w-full max-w-[280px]">
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpadPress(num)}
                    className="h-12 bg-[#60A5FA] hover:bg-blue-500 rounded-[10px] flex items-center justify-center text-white text-sm font-semibold transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("back")}
                  className="h-12 bg-[#60A5FA] hover:bg-blue-500 rounded-[10px] flex items-center justify-center text-white text-[11px] font-semibold transition-colors active:scale-95"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("0")}
                  className="h-12 bg-[#60A5FA] hover:bg-blue-500 rounded-[10px] flex items-center justify-center text-white text-sm font-semibold transition-colors active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("delete")}
                  className="h-12 bg-[#60A5FA] hover:bg-blue-500 rounded-[10px] flex items-center justify-center text-white text-[11px] font-semibold transition-colors active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!withdrawAmount || parseInt(withdrawAmount, 10) === 0) {
                  alert("Masukkan nominal penarikan.");
                  return;
                }
                setWithdrawStep("method");
              }}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-white font-semibold text-sm rounded-[10px] transition-colors shadow-md mt-1"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pilih Metode E-Wallet */}
      {withdrawStep === "method" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => setWithdrawStep("nominal")}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-2 text-center">
              <Wallet className="w-10 h-10 text-[#52C3BF] mb-1" />
              <h3 className="text-[#0B424F] text-xl font-semibold">Pilih Metode Penarikan</h3>
              <p className="text-[#36959B] text-xs">Nominal: {formatRupiah(withdrawAmount)}</p>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              {E_WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWallet(wallet.id)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    selectedWallet === wallet.id
                      ? "border-[#52C3BF] bg-[#E8F6F5] text-[#0B424F] font-bold"
                      : "border-slate-200 bg-white text-slate-600 font-medium"
                  }`}
                >
                  <span>{wallet.name}</span>
                  {selectedWallet === wallet.id && <CheckCircle2 className="w-5 h-5 text-[#52C3BF]" />}
                </button>
              ))}
            </div>

            <div className="w-full flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setWithdrawStep("nominal")}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-[10px] transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => setWithdrawStep("pin")}
                className="w-2/3 py-3 bg-[#52C3BF] hover:bg-[#36959B] text-white font-semibold text-sm rounded-[10px] transition-colors shadow-md"
              >
                Lanjut ke PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Masukkan PIN / Password Penarikan */}
      {withdrawStep === "pin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative border border-slate-100 font-['Poppins']">
            <button
              type="button"
              onClick={() => setWithdrawStep("method")}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-2 text-center">
              <Lock className="w-10 h-10 text-[#52C3BF] mb-1" />
              <h3 className="text-[#0B424F] text-xl font-semibold">Masukkan PIN Penarikan</h3>
              <p className="text-[#36959B] text-xs">Konfirmasi keamanan transaksi warung Anda</p>

              {/* Dot PIN Indicator */}
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
            </div>

            {/* Virtual Numpad PIN */}
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

            <div className="w-full flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setWithdrawStep("method")}
                className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-[10px] transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmitWithdraw}
                className="w-2/3 py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-white font-semibold text-sm rounded-[10px] transition-colors shadow-md"
              >
                Tarik Saldo Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. POP-UP SUKSES ================= */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-8 flex flex-col items-center text-center relative border border-slate-100 font-['Poppins']">
            <button 
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-full bg-[#E6F5F4] flex items-center justify-center mb-6 text-[#52C3BF] shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-[#52C3BF]" />
            </div>

            <h3 className="text-[#0B424F] text-2xl font-bold mb-2">
              Berhasil!
            </h3>
            <p className="text-[#1F6A76] text-sm font-normal mb-8 leading-relaxed">
              {withdrawMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-white font-bold text-sm rounded-[14px] transition-colors shadow-md"
            >
              Okaay
            </button>
          </div>
        </div>
      )}

    </div>
  );
}