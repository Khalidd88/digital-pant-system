"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

// Menu khusus untuk role Warung — samakan dengan dashboard warung
const warungMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/warung/dashboard", icon: Home },
  { label: "Scan QR Warga", href: "/warung/scan", icon: QrCode },
  { label: "Riwayat Transaksi", href: "/warung/riwayat", icon: History },
  { label: "PANTRA Assistant", href: "/warung/assistant", icon: UserPlus },
];

type ActivityType = "Setor Botol" | "Tarik Saldo";
type TransactionStatus = "Diproses" | "Berhasil" | "Gagal";

interface TransactionItem {
  id: string;
  mitra: string;
  aktivitas: ActivityType;
  detail: string;
  nominal: string;
  isPositive: boolean;
  waktu: string;
  status: TransactionStatus;
}

// TODO: ganti dengan pemanggilan API nyata, mis. GET /api/warung/riwayat?page=&limit=&q=
// Untuk saat ini di-mock supaya tampilan tabel & paginasi bisa diuji tanpa backend.
const MOCK_TRANSACTIONS: TransactionItem[] = [
  {
    id: "01",
    mitra: "Warung Bu Tejo",
    aktivitas: "Tarik Saldo",
    detail: "Tarik di Warung",
    nominal: "-Rp10.000",
    isPositive: false,
    waktu: "17/07/2026, 10:00 WIB",
    status: "Diproses",
  },
  {
    id: "02",
    mitra: "Warung Bu Tejo",
    aktivitas: "Setor Botol",
    detail: "3x Botol PET",
    nominal: "+Rp1.500",
    isPositive: true,
    waktu: "14/06/2026, 09:45 WIB",
    status: "Berhasil",
  },
  {
    id: "03",
    mitra: "Warung Bu Tejo",
    aktivitas: "Setor Botol",
    detail: "3x Botol PET",
    nominal: "+Rp1.500",
    isPositive: true,
    waktu: "14/06/2026, 09:30 WIB",
    status: "Gagal",
  },
  {
    id: "04",
    mitra: "Warung Bu Tejo",
    aktivitas: "Tarik Saldo",
    detail: "Tarik di Warung",
    nominal: "-Rp10.000",
    isPositive: false,
    waktu: "14/06/2026, 09:00 WIB",
    status: "Berhasil",
  },
];

const ACTIVITY_BADGE_STYLE: Record<ActivityType, string> = {
  "Tarik Saldo": "bg-rose-100 text-red-400",
  "Setor Botol": "bg-sky-100 text-blue-400",
};

const STATUS_BADGE_STYLE: Record<TransactionStatus, string> = {
  Diproses: "bg-orange-300 text-white",
  Berhasil: "bg-emerald-400 text-white",
  Gagal: "bg-red-400 text-white",
};

export default function WarungRiwayatPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return MOCK_TRANSACTIONS.filter(
      (item) =>
        item.mitra.toLowerCase().includes(query) ||
        item.aktivitas.toLowerCase().includes(query) ||
        item.detail.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / Number(entriesPerPage)));
  const pagedData = filteredData.slice(
    (currentPage - 1) * Number(entriesPerPage),
    currentPage * Number(entriesPerPage)
  );

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
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
                <span className="text-sm font-medium font-['Mona_Sans']">Warung Bu Tejo</span>
              </div>

              <nav className="flex flex-col gap-3">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/riwayat";
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
                Selamat Pagi, Warung Bu Tejo<span className="tracking-[0.04px]">!</span>
              </h1>
              <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                Pantau semua transaksi warung kamu di sini
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
                  Warung Bu Tejo
                </span>
              </div>
            </div>
          </header>

          {/* Body */}
          <main className="p-4 md:p-8 flex flex-col gap-6 max-w-[1440px] w-full mx-auto">
            <section className="w-full bg-white rounded-2xl px-4 md:px-5 pt-4 pb-5 shadow-sm flex flex-col gap-3.5">
              <h2 className="text-[#0B424F] text-lg font-medium font-['Mona_Sans']">Riwayat Aktivitas</h2>

              <div className="flex flex-col gap-4">
                {/* Kontrol: Show entries & Pencarian */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-5">
                    <span className="text-[#0B424F] text-xs font-normal font-['Mona_Sans']">Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-16 px-2.5 py-1 rounded-sm border border-neutral-300 text-[#0B424F] text-xs font-normal font-['Mona_Sans'] focus:outline-none focus:border-[#52C3BF]"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="text-[#0B424F] text-xs font-normal font-['Mona_Sans']">Entries</span>
                  </div>

                  <div className="w-full sm:w-60 h-9 px-3.5 bg-white rounded-[5px] border border-stone-300 flex items-center gap-2 focus-within:border-[#52C3BF] transition-colors">
                    <Search className="w-3.5 h-3.5 text-[#36959B]" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent text-xs text-[#1F6A76] font-medium font-['Mona_Sans'] placeholder:text-stone-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tabel Riwayat */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[860px]">
                    <thead>
                      <tr>
                        <th className="w-9 p-2.5 text-center text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          No
                        </th>
                        <th className="w-28 p-2.5 text-left text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          Mitra / Transaksi
                        </th>
                        <th className="w-28 p-2.5 text-center text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          Aktivitas
                        </th>
                        <th className="w-56 p-2.5 text-left text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          Detail Material
                        </th>
                        <th className="w-40 p-2.5 text-left text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          Nominal (Rp)
                        </th>
                        <th className="w-48 p-2.5 text-center text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          Tanggal &amp; Waktu
                        </th>
                        <th className="w-28 p-2.5 text-center text-[#0B424F] text-xs font-semibold font-['Mona_Sans']">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.map((row) => (
                        <tr key={row.id} className="border-t border-gray-200 hover:bg-[#F5FAFA] transition-colors">
                          <td className="p-2.5 text-center text-slate-500 text-xs font-normal font-['Mona_Sans']">
                            {row.id}
                          </td>
                          <td className="p-2.5 text-[#1F6A76] text-xs font-bold font-['Mona_Sans']">
                            {row.mitra}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-block px-4 py-1 rounded-[30px] text-xs font-bold font-['Mona_Sans'] ${ACTIVITY_BADGE_STYLE[row.aktivitas]}`}
                            >
                              {row.aktivitas}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 text-xs font-normal font-['Mona_Sans']">
                            {row.detail}
                          </td>
                          <td
                            className={`p-2.5 text-xs font-normal font-['Mona_Sans'] ${
                              row.isPositive ? "text-emerald-600" : "text-slate-700"
                            }`}
                          >
                            {row.nominal}
                          </td>
                          <td className="p-2.5 text-center text-slate-600 text-xs font-normal font-['Mona_Sans']">
                            {row.waktu}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-block px-4 py-1 rounded-[30px] text-xs font-bold font-['Mona_Sans'] ${STATUS_BADGE_STYLE[row.status]}`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {pagedData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 text-xs font-medium font-['Mona_Sans']">
                            Tidak ada transaksi yang cocok dengan pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginasi */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-[#0B424F] text-xs font-normal font-['Mona_Sans']">
                    Showing {pagedData.length === 0 ? 0 : (currentPage - 1) * Number(entriesPerPage) + 1} to{" "}
                    {(currentPage - 1) * Number(entriesPerPage) + pagedData.length} of {filteredData.length} entries
                  </span>

                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 disabled:hover:bg-neutral-100 disabled:cursor-not-allowed rounded-[10px] flex items-center gap-1.5 text-[#0B424F] disabled:text-neutral-300 text-sm font-normal font-['Mona_Sans'] transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Sebelumnya
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-[5px] flex items-center justify-center text-sm font-bold font-['Mona_Sans'] transition-colors ${
                            page === currentPage
                              ? "bg-[#1F6A76] text-white"
                              : "bg-neutral-100 text-neutral-300 hover:bg-neutral-200"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 disabled:hover:bg-neutral-100 disabled:cursor-not-allowed rounded-[5px] flex items-center gap-1.5 text-[#0B424F] disabled:text-zinc-300 text-sm font-normal font-['Mona_Sans'] transition-colors"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
