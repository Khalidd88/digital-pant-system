"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import vectorLogo from "@/assets/Vector.png";

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
  rawDate: number;
  status: TransactionStatus;
}

const ACTIVITY_BADGE_STYLE: Record<ActivityType, string> = {
  "Tarik Saldo": "bg-rose-50 text-rose-600 border border-rose-200",
  "Setor Botol": "bg-teal-50 text-teal-700 border border-teal-200",
};

const STATUS_BADGE_STYLE: Record<TransactionStatus, string> = {
  Diproses: "bg-amber-100 text-amber-700",
  Berhasil: "bg-emerald-100 text-emerald-700",
  Gagal: "bg-rose-100 text-rose-600",
};

export default function WarungRiwayatPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  // Identitas Mitra Warung
  const [warungName, setWarungName] = useState("Warung Mitra");
  const [warungId, setWarungId] = useState("WRG-0001");

  // Data State dari Supabase Backend
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper Format Waktu Indonesia
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return dateStr;
    }
  };

  // 1. Tarik Data Transaksi Riil Warung dari Backend
  const fetchWarungHistory = useCallback(async (targetWarungId: string, silent = false) => {
    if (!targetWarungId) return;
    if (!silent) setIsRefreshing(true);

    try {
      const res = await fetch(`http://localhost:4000/api/user/${targetWarungId}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && json.data) {
        const u = json.data;
        if (u.name) setWarungName(u.name);

        const list: TransactionItem[] = [];

        // 1. Mapping Setoran Botol Warga di Warung Ini
        if (Array.isArray(u.scanLogs)) {
          u.scanLogs.forEach((scan: any, idx: number) => {
            const bottleCount = scan.bottleCount || 1;
            const komisiWarung = Math.round((scan.depositAmount || bottleCount * 500) * 0.1);
            list.push({
              id: scan.id ? scan.id.slice(0, 8).toUpperCase() : `SCN-${idx + 1}`,
              mitra: scan.user?.name || scan.userQrId || "Warga Setor",
              aktivitas: "Setor Botol",
              detail: `${bottleCount}x Botol ${scan.material || "PET"} (Komisi Warung: +Rp${komisiWarung.toLocaleString("id-ID")})`,
              nominal: `+Rp${(scan.depositAmount || bottleCount * 500).toLocaleString("id-ID")}`,
              isPositive: true,
              waktu: formatDate(scan.createdAt),
              rawDate: new Date(scan.createdAt).getTime(),
              status: scan.status === "FAILED" ? "Gagal" : "Berhasil",
            });
          });
        }

        // 2. Mapping Penarikan Kas Saldo Warung
        if (Array.isArray(u.walletTransactions)) {
          u.walletTransactions.forEach((tx: any, idx: number) => {
            list.push({
              id: tx.id ? tx.id.slice(0, 8).toUpperCase() : `WD-${idx + 1}`,
              mitra: `Pencairan Kas (${tx.channel})`,
              aktivitas: "Tarik Saldo",
              detail: tx.description || `Transfer e-wallet tujuan ${tx.destinationNumber || tx.channel}`,
              nominal: `-Rp${(tx.amount || 0).toLocaleString("id-ID")}`,
              isPositive: false,
              waktu: formatDate(tx.createdAt),
              rawDate: new Date(tx.createdAt).getTime(),
              status: "Berhasil",
            });
          });
        }

        // Urutkan transaksi dari yang paling baru ke lama
        list.sort((a, b) => b.rawDate - a.rawDate);
        setTransactions(list);
      }
    } catch (err) {
      console.error("Gagal menarik data riwayat warung:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Inisialisasi Data Warung dari LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedId = localStorage.getItem("pantra_warung_id") || "WRG-0001";
    const savedName = localStorage.getItem("pantra_warung_name") || "Warung Mitra";

    setWarungId(savedId);
    setWarungName(savedName);
    fetchWarungHistory(savedId);
  }, [fetchWarungHistory]);

  // Filter Data Berdasarkan Input Pencarian
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (item) =>
        item.mitra.toLowerCase().includes(query) ||
        item.aktivitas.toLowerCase().includes(query) ||
        item.detail.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.nominal.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const totalEntries = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / Number(entriesPerPage)));
  const pagedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * Number(entriesPerPage),
      currentPage * Number(entriesPerPage)
    );
  }, [filteredData, currentPage, entriesPerPage]);

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* ================= 1. SIDEBAR (Desktop Only) ================= */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warung" customItems={warungMenuItems} />
        </div>

        {/* ================= 2. HEADER & NAVBAR DRAWER (Mobile Only) ================= */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 sm:px-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="PANTRA Logo" className="h-7 w-auto object-contain" priority />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchWarungHistory(warungId)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                title="Perbarui Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 bg-[#235D6B] hover:bg-[#36959B] border border-[#52C3BF] rounded-[10px] text-white transition-colors"
                aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
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
              <div className="flex items-center gap-3 px-3.5 py-2 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold font-['Mona_Sans']">{warungName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{warungId}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {warungMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/warung/riwayat";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#52C3BF] text-white font-bold shadow-sm"
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
                    localStorage.clear();
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
          {/* Topbar Header (Desktop Only) */}
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-[0px_5px_11px_rgba(182,194,206,0.1)] z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-bold font-['Mona_Sans']">
                Riwayat Transaksi Mitra Warung 📋
              </h1>
              <p className="text-[#36959B] text-xs font-normal font-['Mona_Sans']">
                Pantau seluruh rekam jejak setoran botol warga dan penarikan kas secara realtime
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchWarungHistory(warungId)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh manual data dari Supabase"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden xl:inline">Perbarui</span>
              </button>

              <button
                type="button"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-5 h-5 text-[#0B424F]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold leading-tight font-['Mona_Sans']">{warungName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{warungId}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Body */}
          <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] w-full mx-auto font-['Mona_Sans']">
            <section className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-[#0B424F] text-base sm:text-lg font-bold">Semua Log Aktivitas Warung</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Tersinkronisasi otomatis dengan PostgreSQL Supabase</p>
                </div>

                <div className="w-full sm:w-64 h-10 px-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center gap-2 focus-within:border-[#52C3BF] focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-[#36959B] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari warga, aktivitas, ref..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-transparent text-xs text-[#0B424F] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Kontrol: Show entries & Paginasi Info */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:border-[#52C3BF]"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span>Entries</span>
                  </div>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Total {totalEntries} Aktivitas Terdaftar
                  </span>
                </div>

                {/* Tabel Riwayat */}
                <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse min-w-[860px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-slate-100 text-slate-600 text-xs font-semibold">
                        <th className="w-12 py-3 px-3 text-center">Ref</th>
                        <th className="w-36 py-3 px-3">Warga / Transaksi</th>
                        <th className="w-28 py-3 px-3 text-center">Aktivitas</th>
                        <th className="py-3 px-3">Detail Setoran / Keterangan</th>
                        <th className="w-36 py-3 px-3">Nominal (Rp)</th>
                        <th className="w-40 py-3 px-3 text-center">Waktu Transaksi</th>
                        <th className="w-24 py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <RefreshCw className="w-6 h-6 animate-spin text-[#52C3BF]" />
                              <span className="text-xs">Menghubungkan ke database Supabase...</span>
                            </div>
                          </td>
                        </tr>
                      ) : pagedData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            Tidak ada transaksi yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        pagedData.map((row) => (
                          <tr key={row.id} className="hover:bg-[#F3FEFD]/50 transition-colors">
                            <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                              #{row.id}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#0B424F]">
                              {row.mitra}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${ACTIVITY_BADGE_STYLE[row.aktivitas]}`}
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
                            <td className="py-3 px-3 text-center text-slate-400 whitespace-nowrap">
                              {row.waktu}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE_STYLE[row.status]}`}
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

                {/* Paginasi Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 text-xs text-slate-500">
                  <span>
                    Showing {pagedData.length === 0 ? 0 : (currentPage - 1) * Number(entriesPerPage) + 1} to{" "}
                    {(currentPage - 1) * Number(entriesPerPage) + pagedData.length} of {totalEntries} entries
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            page === currentPage
                              ? "bg-[#52C3BF] text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Next</span>
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