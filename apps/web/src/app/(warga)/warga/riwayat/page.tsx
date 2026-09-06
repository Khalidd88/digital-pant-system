"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

interface ActivityItem {
  id: string;
  mitra: string;
  aktivitas: "Setor Botol" | "Tarik Saldo";
  detail: string;
  nominal: string;
  isPositive: boolean;
  tanggal: string;
  status: "Diproses" | "Berhasil" | "Gagal";
}

const mockData: ActivityItem[] = [
  {
    id: "01",
    mitra: "Warung Bu Tejo",
    aktivitas: "Tarik Saldo",
    detail: "Tarik di Warung",
    nominal: "-Rp10.000",
    isPositive: false,
    tanggal: "17/07/2026, 10:00 WIB",
    status: "Diproses",
  },
  {
    id: "02",
    mitra: "Warung Bu Tejo",
    aktivitas: "Setor Botol",
    detail: "3x Botol PET",
    nominal: "+Rp1.500",
    isPositive: true,
    tanggal: "14/06/2026, 09:45 WIB",
    status: "Berhasil",
  },
  {
    id: "03",
    mitra: "Warung Bu Tejo",
    aktivitas: "Setor Botol",
    detail: "3x Botol PET",
    nominal: "+Rp1.500",
    isPositive: true,
    tanggal: "14/06/2026, 09:30 WIB",
    status: "Gagal",
  },
  {
    id: "04",
    mitra: "Warung Bu Tejo",
    aktivitas: "Tarik Saldo",
    detail: "Tarik di Warung",
    nominal: "-Rp10.000",
    isPositive: false,
    tanggal: "14/06/2026, 09:00 WIB",
    status: "Berhasil",
  },
];

export default function RiwayatAktivitasPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");

  const filteredData = mockData.filter(
    (item) =>
      item.mitra.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aktivitas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warga" />
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
                <span className="text-sm font-medium font-['Mona_Sans']">Eleanor Whisper</span>
              </div>

              <nav className="flex flex-col gap-3">
                <Link
                  href="/warga/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins']"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/warga/riwayat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#52C3BF] text-white rounded-[16px] text-sm font-semibold font-['Poppins'] shadow-sm"
                >
                  <History className="w-5 h-5" />
                  <span>Riwayat Aktivitas</span>
                </Link>

                <Link
                  href="/warga/assistant"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3.5 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[16px] text-sm font-semibold font-['Poppins']"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>PANTRA Assistant</span>
                </Link>

                <Link
                  href="/auth/warga/login"
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
                Selamat Pagi Eleanor 👋
              </h1>
              <p className="text-[#36959B] text-sm font-normal font-['Mona_Sans']">
                Kamu mau berdonasi kemana nih hari inii?
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
                <span className="text-base font-medium font-['Mona_Sans'] hidden sm:inline">Eleanor Whisper</span>
              </div>
            </div>
          </header>

          {/* Main Body Table Card */}
          <main className="p-4 md:p-8 flex flex-col gap-5 max-w-[1440px] w-full mx-auto">
            <div className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col gap-6 font-['Mona_Sans']">
              
              <h2 className="text-[#0B424F] text-lg font-semibold">Riwayat Aktivitas</h2>

              {/* Table Toolbar */}
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

                {/* Search Bar */}
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

              {/* Data Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-slate-700 text-xs font-semibold">
                      <th className="py-3 px-2 text-center w-12">No</th>
                      <th className="py-3 px-3">Mitra / Transaksi</th>
                      <th className="py-3 px-3 text-center">Aktivitas</th>
                      <th className="py-3 px-3">Detail Material</th>
                      <th className="py-3 px-3">Nominal (Rp)</th>
                      <th className="py-3 px-3 text-center">Tanggal &amp; Waktu</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
                    {filteredData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-2 text-center text-slate-500 font-normal">{row.id}</td>
                        <td className="py-3.5 px-3 font-bold text-[#0B424F]">{row.mitra}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              row.aktivitas === "Tarik Saldo"
                                ? "bg-rose-100 text-rose-500"
                                : "bg-sky-100 text-sky-500"
                            }`}
                          >
                            {row.aktivitas}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{row.detail}</td>
                        <td
                          className={`py-3.5 px-3 font-semibold ${
                            row.isPositive ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {row.nominal}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-500">{row.tanggal}</td>
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

              {/* Pagination */}
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

            </div>
          </main>
        </div>

      </div>
    </div>
  );
}