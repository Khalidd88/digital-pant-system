"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { QRCodeSVG } from "qrcode.react";
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
  Clock,
  QrCode
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

export default function WargaDashboardPage() {
  // Mode Tampilan Card Kanan: "ID_QR" (Default) | "WITHDRAW_QRIS" (Setelah Tarik Saldo)
  const [viewMode, setViewMode] = useState<"ID_QR" | "WITHDRAW_QRIS">("ID_QR");

  // State Pop-up Modal & Data Tarik Saldo
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [confirmedAmount, setConfirmedAmount] = useState<string>("0");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  
  // State Mobile Drawer & Notifikasi
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  const balance = "Rp. 12.000,00";
  const userId = "USR-8921";
  const transactionId = "WD-994821";

  // Format Angka ke Rupiah
  const formatRupiah = (val: string) => {
    if (!val) return "Rp.0,-";
    const num = parseInt(val, 10);
    if (isNaN(num)) return "Rp.0,-";
    return `Rp.${num.toLocaleString("id-ID")},-`;
  };

  // Handler Numpad Virtual (Mobile Modal)
  const handleNumpadPress = (value: string) => {
    if (value === "back") {
      setShowWithdrawModal(false);
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

  // Handler Konfirmasi Tarik Saldo (Memicu Laman QRIS Penarikan)
  const handleConfirmWithdrawal = () => {
    if (!withdrawAmount || parseInt(withdrawAmount, 10) === 0) {
      alert("Masukkan nominal penarikan saldo terlebih dahulu.");
      return;
    }
    setConfirmedAmount(withdrawAmount);
    setShowWithdrawModal(false);
    setViewMode("WITHDRAW_QRIS"); // Beralih ke Laman QRIS Penarikan Saldo
    setWithdrawAmount("");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      
      {/* ================= DESKTOP & MOBILE CONTAINER ================= */}
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* ================= 1. SIDEBAR NAVIGATION (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warga" />
        </div>

        {/* ================= 2. HEADER & NAVBAR DRAWER (Mobile Only) ================= */}
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

          {/* Mobile Notification Alert */}
          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-sm rounded-xl shadow-lg border border-slate-100 font-['Poppins']">
              Tidak ada notifikasi baru.
            </div>
          )}

          {/* Mobile Drawer Navigation */}
          {isMobileMenuOpen && (
            <div className="mt-3 bg-[#0B424F] text-white p-6 rounded-[24px] flex flex-col gap-6 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <span className="text-sm font-medium font-['Mona_Sans']">
                  Eleanor Whisper
                </span>
              </div>

              <nav className="flex flex-col gap-3">
                <Link
                  href="/warga/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#52C3BF] text-white rounded-[16px] text-sm font-semibold font-['Poppins'] shadow-sm"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/warga/riwayat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins'] transition-colors"
                >
                  <History className="w-5 h-5" />
                  <span>Riwayat Aktivitas</span>
                </Link>

                <Link
                  href="/warga/assistant"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins'] transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>PANTRA Assistant</span>
                </Link>

                <Link
                  href="/warga/login"
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
                Selamat Pagi Eleanor<span className="tracking-[0.04px]">!</span>
              </h1>
              <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                Sudah berapa botol nih?
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
                  Eleanor Whisper
                </span>
              </div>
            </div>
          </header>

          {/* Dashboard Body */}
          <main className="p-4 md:p-8 flex flex-col lg:flex-row gap-5 max-w-[1440px] w-full mx-auto" aria-label="Dashboard PANTRA">
            
            {/* CARD KIRI: Saldo PANTRA Kamu */}
            <section className="w-full lg:w-[497px] min-h-[257px] bg-white rounded-[15px] p-5 shadow-sm flex flex-col justify-between gap-5 shrink-0" aria-labelledby="balance-heading">
              <div className="flex flex-col gap-5">
                <h2 id="balance-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                  Saldo PANTRA Kamu
                </h2>
                
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[#36959B] text-xs font-bold font-['Poppins']">
                      Saldo
                    </span>
                    <strong className="text-[#0B424F] text-2xl md:text-3xl font-bold font-['Poppins']">
                      {balance}
                    </strong>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="md:hidden text-[#36959B] text-sm font-semibold font-['Poppins']">
                      Barang yang akan didonasikan
                    </span>
                    <div className="inline-flex px-3.5 py-2 bg-[#D2F0EE] rounded-[5px] w-fit">
                      <span className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                        Tersedia untuk ditarik
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-[142px] h-[50px] px-7 py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-[#E6F5F4] text-sm font-semibold font-['Poppins'] rounded-[10px] transition-colors shadow-sm"
                >
                  Tarik Saldo
                </button>
              </div>
            </section>

            {/* CARD KANAN Mode 1: QR ID Pengguna (Default) */}
            {viewMode === "ID_QR" && (
              <section className="flex-1 min-h-[645px] bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5 animate-fadeIn" aria-labelledby="qr-heading">
                <div className="flex flex-col gap-4">
                  <h2 id="qr-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                    QR ID
                  </h2>
                  <div className="flex flex-col gap-4">
                    <p className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                      Tunjukkan QR code ini ke Warung Mitra untuk mulai setor botol
                    </p>
                    <div className="w-full h-px bg-slate-200" />
                  </div>
                </div>

                <div 
                  onClick={() => setShowPopup(true)}
                  className="w-full min-h-[516px] p-4 bg-[#E6F5F4] rounded-[15px] border border-[#52C3BF] flex flex-col justify-between items-center gap-6 cursor-pointer hover:border-[#36959B] transition-all"
                  title="Klik untuk mensimulasikan pemindaian QR"
                >
                  <div className="w-full max-w-[531px] h-[49px] px-3.5 bg-[#FFF8E1] rounded-[10px] border border-[#FF8D28] flex items-center justify-center">
                    <span className="text-[#E3A810] text-base font-bold font-['Poppins']">
                      ID: {userId}
                    </span>
                  </div>

                  <div className="w-[280px] h-[280px] md:w-[304px] md:h-[304px] relative flex items-center justify-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <QRCodeSVG 
                      value={userId} 
                      size={260}
                      level="H"
                      includeMargin={false}
                      fgColor="#0B424F"
                    />
                  </div>

                  <p className="text-[#1F6A76] text-base font-medium font-['Poppins'] text-center">
                    Diverifikasi Otomasi &amp; Terintegrasi
                  </p>
                </div>
              </section>
            )}

            {/* CARD KANAN Mode 2: QRIS Penarikan Saldo (Setelah Tarik Saldo) */}
            {viewMode === "WITHDRAW_QRIS" && (
              <section className="flex-1 min-h-[645px] bg-white rounded-[15px] p-5 shadow-sm flex flex-col gap-5 animate-fadeIn" aria-labelledby="qris-heading">
                
                {/* Header Card dengan Tombol Kembali */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewMode("ID_QR")}
                        className="p-2 bg-[#E6F5F4] hover:bg-[#D2F0EE] rounded-lg text-[#0B424F] transition-colors"
                        title="Kembali ke QR ID"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 id="qris-heading" className="text-[#0B424F] text-lg font-semibold font-['Poppins']">
                        QRIS Penarikan Saldo
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FFF8E1] border border-[#FF8D28] rounded-full text-xs font-semibold text-[#E3A810] font-['Poppins']">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Berlaku 15 Menit</span>
                    </div>
                  </div>

                  <p className="text-[#36959B] text-sm font-semibold font-['Poppins']">
                    Pindai QRIS ini di e-wallet/mobile banking Anda untuk mencairkan saldo
                  </p>
                  <div className="w-full h-px bg-slate-200" />
                </div>

                {/* Box Kontainer Utama QRIS Penarikan */}
                <div className="w-full min-h-[516px] p-5 bg-[#E6F5F4] rounded-[15px] border border-[#52C3BF] flex flex-col justify-between items-center gap-5">
                  
                  {/* Info Rincian Transaksi */}
                  <div className="w-full max-w-[531px] bg-white p-4 rounded-[12px] border border-[#BAE5E2] flex flex-col gap-2 font-['Poppins'] shadow-sm">
                    <div className="flex justify-between items-center text-xs text-[#36959B]">
                      <span>ID Transaksi: <strong>{transactionId}</strong></span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">Siap Dicairkan</span>
                    </div>
                    <div className="flex justify-between items-end pt-1 border-t border-slate-100">
                      <span className="text-xs text-[#1F6A76] font-medium">Nominal Penarikan:</span>
                      <span className="text-xl font-bold text-[#0B424F]">{formatRupiah(confirmedAmount)}</span>
                    </div>
                  </div>

                  {/* Tampilan QRIS Canvas Dinamis */}
                  <div 
                    onClick={() => setShowPopup(true)}
                    className="w-[260px] h-[260px] md:w-[280px] md:h-[280px] relative flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-md border-2 border-[#52C3BF] cursor-pointer hover:scale-[1.02] transition-transform"
                    title="Klik untuk mensimulasikan penarikan selesai"
                  >
                    <div className="mb-2 text-xs font-bold tracking-widest text-[#0B424F] font-['Poppins']">
                      QRIS PANTRA
                    </div>
                    <QRCodeSVG 
                      value={`QRIS-PANTRA-WITHDRAW-${confirmedAmount}-${transactionId}`} 
                      size={200}
                      level="H"
                      includeMargin={false}
                      fgColor="#0B424F"
                    />
                    <span className="mt-2 text-[10px] text-[#36959B] font-medium font-['Poppins']">
                      NMID: ID102938492019
                    </span>
                  </div>

                  {/* Instruksi Tambahan & Action */}
                  <div className="flex flex-col items-center gap-3 w-full font-['Poppins']">
                    <p className="text-[#1F6A76] text-xs md:text-sm font-medium text-center">
                      Simpan atau tunjukkan QRIS ini untuk pemindaian instan oleh sistem mitra
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMode("ID_QR")}
                      className="px-6 py-2 bg-[#0B424F] hover:bg-[#1F6A76] text-white text-xs font-semibold rounded-[8px] transition-colors shadow-sm"
                    >
                      Selesai / Kembali ke QR ID
                    </button>
                  </div>

                </div>
              </section>
            )}

          </main>
        </div>

      </div>

      {/* ================= 4. MODAL POP-UP TARIK SALDO ================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-[384px] md:w-[420px] bg-white rounded-[20px] p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative border border-slate-100 font-['Poppins']">
            
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full flex flex-col items-center gap-3 text-center">
              <h3 className="text-[#52C3BF] text-2xl font-semibold">
                Masukkan Nominal
              </h3>

              <div className="px-4 py-2 bg-[#E8F6F5] rounded-[5px] inline-flex items-center justify-center min-w-[120px]">
                {/* Desktop: Direct Keyboard Input */}
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

                {/* Mobile: Numpad Display */}
                <span className="block md:hidden text-[#52C3BF] text-sm font-semibold">
                  {formatRupiah(withdrawAmount)}
                </span>
              </div>

              <p className="text-[#0B424F] text-sm md:text-base font-normal">
                Konfirmasi penarikan saldo
              </p>
            </div>

            {/* Virtual Numpad Grid (Mobile View) */}
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
              onClick={handleConfirmWithdrawal}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-[#36959B] text-white font-semibold text-sm rounded-[10px] transition-colors shadow-md mt-1"
            >
              Tarik saldo
            </button>

          </div>
        </div>
      )}

      {/* ================= 5. POP-UP SUKSES SCAN / TRANSAKSI ================= */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-8 flex flex-col items-center text-center relative border border-slate-100 font-['Poppins']">
            <button 
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Tutup pop-up"
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
              Terimakasih telah menggunakan layanan kami
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