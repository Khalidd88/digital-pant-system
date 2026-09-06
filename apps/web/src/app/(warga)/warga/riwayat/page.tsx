"use client";

import { useState, useEffect, useMemo } from "react";
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
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
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
  rawDate: number;
  status: "Diproses" | "Berhasil" | "Gagal";
}

export default function RiwayatAktivitasPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // User State
  const [userName, setUserName] = useState("Warga PANTRA");
  const [qrId, setQrId] = useState("");
  
  // Data State dari Database
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper format tanggal Indonesia
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
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

  // 1. Ambil data User & Riwayat Transaksi dari Supabase Backend
  const fetchActivityHistory = async (targetQr: string) => {
    if (!targetQr) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/user/${targetQr}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && json.data) {
        const rawUser = json.data;
        const combined: ActivityItem[] = [];

        // Mapping Riwayat Setoran Botol (scanLogs)
        if (Array.isArray(rawUser.scanLogs)) {
          rawUser.scanLogs.forEach((scan: any) => {
            combined.push({
              id: scan.id.slice(0, 8).toUpperCase(),
              mitra: scan.warung?.name || "Warung Bu Tejo",
              aktivitas: "Setor Botol",
              detail: `${scan.bottleCount || 1}x Botol ${scan.material || "PET"}`,
              nominal: `+Rp${(scan.depositAmount || 0).toLocaleString("id-ID")}`,
              isPositive: true,
              tanggal: formatDate(scan.createdAt),
              rawDate: new Date(scan.createdAt).getTime(),
              status: scan.status === "FAILED" ? "Gagal" : "Berhasil"
            });
          });
        }

        // Mapping Riwayat Dompet / Tarik Saldo (walletTransactions)
        if (Array.isArray(rawUser.walletTransactions)) {
          rawUser.walletTransactions.forEach((tx: any) => {
            const isWarung = tx.channel === "WARUNG";
            combined.push({
              id: tx.id.slice(0, 8).toUpperCase(),
              mitra: isWarung ? "Warung Bu Tejo" : `Tarik Saldo (${tx.channel})`,
              aktivitas: "Tarik Saldo",
              detail: tx.description || (isWarung ? "Belanja Sembako" : `Transfer ke ${tx.destinationNumber || tx.channel}`),
              nominal: `-Rp${(tx.amount || 0).toLocaleString("id-ID")}`,
              isPositive: false,
              tanggal: formatDate(tx.createdAt),
              rawDate: new Date(tx.createdAt).getTime(),
              status: "Berhasil"
            });
          });
        }

        // Urutkan dari transaksi paling baru ke terlama
        combined.sort((a, b) => b.rawDate - a.rawDate);
        setActivities(combined);
      }
    } catch (err) {
      console.error("Gagal menarik data riwayat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQr = localStorage.getItem("pantra_user_qr") || "USR-8921";
      const savedUserStr = localStorage.getItem("pantra_user");
      let activeName = "Warga PANTRA";

      if (savedUserStr) {
        try {
          const userObj = JSON.parse(savedUserStr);
          if (userObj.name) activeName = userObj.name;
        } catch (e) {}
      }

      setUserName(activeName);
      setQrId(savedQr);
      fetchActivityHistory(savedQr);
    }
  }, []);

  // Filter Data berdasarkan search input
  const filteredData = useMemo(() => {
    return activities.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.mitra.toLowerCase().includes(query) ||
        item.detail.toLowerCase().includes(query) ||
        item.aktivitas.toLowerCase().includes(query) ||
        item.nominal.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  }, [activities, searchQuery]);

  // Client-side Pagination Logic
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, startIndex, entriesPerPage]);

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* ================= 1. SIDEBAR (Desktop & iPad Landscape) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warga" />
        </div>

        {/* ================= 2. HEADER MOBILE & IPAD PORTRAIT ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 sm:px-5 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={vectorLogo}
                alt="PANTRA Logo"
                className="h-7 sm:h-8 w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fetchActivityHistory(qrId)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <button 
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors relative"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-xs sm:text-sm rounded-xl shadow-lg border border-slate-100">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-2.5 bg-[#0B424F] text-white p-5 sm:p-6 rounded-[22px] flex flex-col gap-4 shadow-2xl border border-[#235D6B] animate-fadeIn">
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{userName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{qrId}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-2.5">
                <Link
                  href="/warga/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[14px] text-sm font-medium"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/warga/riwayat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 bg-[#52C3BF] text-white rounded-[14px] text-sm font-semibold shadow-sm"
                >
                  <History className="w-4 h-4" />
                  <span>Riwayat Aktivitas</span>
                </Link>

                <Link
                  href="/warga/assistant"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 bg-[#235D6B] hover:bg-[#1F6A76] text-white border border-[#52C3BF] rounded-[14px] text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>PANTRA Assistant</span>
                </Link>

                <Link
                  href="/warga/login"
                  onClick={() => {
                    if (typeof window !== "undefined") localStorage.clear();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3.5 px-4 py-3 bg-[#235D6B] hover:bg-red-950/40 text-white border border-[#52C3BF] rounded-[14px] text-sm font-medium mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* ================= 3. MAIN CONTENT AREA ================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Topbar Header (Desktop Only) */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-6 lg:px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-lg lg:text-xl font-semibold font-['Mona_Sans']">
                Riwayat Aktivitas &amp; Transaksi
              </h1>
              <p className="text-[#36959B] text-xs lg:text-sm font-normal font-['Mona_Sans']">
                Pantau seluruh rekam jejak pengembalian botol dan mutasi saldo dompetmu
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => fetchActivityHistory(qrId)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh data dari database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden xl:inline">Perbarui</span>
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
                  <span className="text-xs lg:text-sm font-semibold leading-tight">{userName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{qrId || "No QR"}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Table Container */}
          <main className="p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-4 max-w-[1440px] w-full mx-auto">
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col gap-5 font-['Mona_Sans']">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-[#0B424F] text-base sm:text-lg font-semibold">Semua Transaksi Realtime</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Tersinkronisasi otomatis dengan PostgreSQL Supabase</p>
                </div>

                {/* Search Bar */}
                <div className="w-full sm:w-64 h-10 px-3 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center gap-2 focus-within:border-[#52C3BF] focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-[#36959B] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari transaksi, warung, nominal..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-transparent text-xs text-[#0B424F] placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Table Toolbar */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span>Tampilkan</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:border-[#52C3BF]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entri per halaman</span>
                </div>

                <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                  Total {totalEntries} Aktivitas Terdaftar
                </span>
              </div>

              {/* Responsive Data Table */}
              <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-100 text-slate-600 text-xs font-semibold">
                      <th className="py-3 px-3 text-center w-14">Ref</th>
                      <th className="py-3 px-3">Mitra / Transaksi</th>
                      <th className="py-3 px-3 text-center">Aktivitas</th>
                      <th className="py-3 px-3">Keterangan</th>
                      <th className="py-3 px-3">Nominal (Rp)</th>
                      <th className="py-3 px-3 text-center">Waktu Transaksi</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#52C3BF]" />
                            <span className="text-xs font-medium">Memuat riwayat transaksi dari database...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-sm font-semibold text-slate-600">Belum ada riwayat aktivitas</span>
                            <span className="text-xs">Setor botol PET pertamamu di Warung mitra untuk mendapatkan saldo!</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row) => (
                        <tr key={row.id} className="hover:bg-[#F3FEFD]/50 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px] font-medium">
                            #{row.id}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#0B424F]">
                            {row.mitra}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                row.aktivitas === "Tarik Saldo"
                                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                                  : "bg-teal-50 text-teal-700 border border-teal-200"
                              }`}
                            >
                              {row.aktivitas === "Tarik Saldo" ? (
                                <ArrowUpRight className="w-3 h-3 text-rose-500" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3 text-teal-600" />
                              )}
                              {row.aktivitas}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {row.detail}
                          </td>
                          <td
                            className={`py-3 px-3 font-bold ${
                              row.isPositive ? "text-teal-600" : "text-rose-500"
                            }`}
                          >
                            {row.nominal}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-400 font-medium whitespace-nowrap">
                            {row.tanggal}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${
                                row.status === "Diproses"
                                  ? "bg-amber-100 text-amber-700"
                                  : row.status === "Berhasil"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
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

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
                <span>
                  Menampilkan {totalEntries > 0 ? startIndex + 1 : 0} hingga {Math.min(startIndex + entriesPerPage, totalEntries)} dari {totalEntries} entri
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  <span className="px-3 py-1.5 bg-[#52C3BF] text-white rounded-lg text-xs font-bold shadow-sm">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages || loading}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Berikutnya</span>
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