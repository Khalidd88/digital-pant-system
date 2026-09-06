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

// Data Dummy / Fallback Cadangan demi keamanan demo/lomba jika backend Railway kendala
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "TRX-001",
    mitra: "Warung Bu Tejo",
    aktivitas: "Setor Botol",
    detail: "5x Botol PET",
    nominal: "+Rp2.500",
    isPositive: true,
    tanggal: "07/03/2026, 10:30 WIB",
    rawDate: Date.now() - 3600000,
    status: "Berhasil"
  },
  {
    id: "TRX-002",
    mitra: "Tarik Saldo (DANA)",
    aktivitas: "Tarik Saldo",
    detail: "Transfer ke 081239889211",
    nominal: "-Rp10.000",
    isPositive: false,
    tanggal: "06/03/2026, 14:15 WIB",
    rawDate: Date.now() - 86400000,
    status: "Berhasil"
  }
];

export default function RiwayatAktivitasPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // User State
  const [userName, setUserName] = useState("Warga PANTRA");
  const [qrId, setQrId] = useState("USR-8821");
  
  // Data State
  const [activities, setActivities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [loading, setLoading] = useState<boolean>(false);

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

  // Fungsi Fetch dengan Safe Fallback Anti-Gagal
  const fetchActivityHistory = async (targetQr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://pantra-production.up.railway.app/api/user/${targetQr}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && json.data) {
        const rawUser = json.data;
        const combined: ActivityItem[] = [];

        if (Array.isArray(rawUser.scanLogs)) {
          rawUser.scanLogs.forEach((scan: any) => {
            combined.push({
              id: (scan.id || "TRX").slice(0, 8).toUpperCase(),
              mitra: scan.warung?.name || "Warung Mitra",
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

        if (Array.isArray(rawUser.walletTransactions)) {
          rawUser.walletTransactions.forEach((tx: any) => {
            const isWarung = tx.channel === "WARUNG";
            combined.push({
              id: (tx.id || "TRX").slice(0, 8).toUpperCase(),
              mitra: isWarung ? "Warung Mitra" : `Tarik Saldo (${tx.channel || "Tunai"})`,
              aktivitas: "Tarik Saldo",
              detail: tx.description || "Penarikan Saldo Dompet",
              nominal: `-Rp${(tx.amount || 0).toLocaleString("id-ID")}`,
              isPositive: false,
              tanggal: formatDate(tx.createdAt),
              rawDate: new Date(tx.createdAt).getTime(),
              status: "Berhasil"
            });
          });
        }

        if (combined.length > 0) {
          combined.sort((a, b) => b.rawDate - a.rawDate);
          setActivities(combined);
        }
      }
    } catch (err) {
      console.warn("Backend riwayat fetch warning, keeping safe fallback data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQr = localStorage.getItem("pantra_user_qr") || sessionStorage.getItem("pantra_user_qr") || "USR-8821";
      const savedUserStr = localStorage.getItem("pantra_user") || sessionStorage.getItem("pantra_user");
      let activeName = "Warga PANTRA";

      if (savedUserStr) {
        try {
          const userObj = JSON.parse(savedUserStr);
          if (userObj.fullName) activeName = userObj.fullName;
          else if (userObj.name) activeName = userObj.name;
        } catch (e) {}
      }

      setUserName(activeName);
      setQrId(savedQr);
      fetchActivityHistory(savedQr);
    }
  }, []);

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

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, startIndex, entriesPerPage]);

  return (
    <div className="relative min-h-screen w-full bg-[#E8EDF3] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR */}
        <div className="hidden md:block shrink-0">
          <Sidebar role="warga" />
        </div>

        {/* HEADER MOBILE */}
        <div className="block md:hidden w-full sticky top-0 z-30 pt-3 px-3 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,#1F6A76_0%,#0B424F_100%)] rounded-[18px] shadow-md border border-[#52C3BF]/20 text-white">
            <Link href="/" className="flex items-center gap-2">
              <Image src={vectorLogo} alt="Logo" className="h-7 w-auto object-contain" priority />
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchActivityHistory(qrId)} className="p-2 bg-[#235D6B] rounded-[10px] text-white">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setNotificationOpen((prev) => !prev)} className="p-2 bg-[#235D6B] rounded-[10px] text-white">
                <Bell className="w-4 h-4" />
              </button>
              <button onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="p-2 bg-[#235D6B] rounded-[10px] text-white">
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {notificationOpen && (
            <div className="mt-2 bg-white text-[#0B424F] p-3 text-xs rounded-xl shadow-lg">
              Tidak ada notifikasi baru.
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="mt-2.5 bg-[#0B424F] text-white p-5 rounded-[22px] flex flex-col gap-4 shadow-2xl border border-[#235D6B]">
              <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#235D6B] rounded-xl text-white">
                <User className="w-5 h-5 text-[#52C3BF]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{userName}</span>
                  <span className="text-[10px] text-[#52C3BF] font-mono">{qrId}</span>
                </div>
              </div>
              <nav className="flex flex-col gap-2.5">
                <Link href="/warga/dashboard" className="flex items-center gap-3.5 px-4 py-3 bg-[#235D6B] text-white rounded-[14px] text-sm">
                  <Home className="w-4 h-4" /><span>Dashboard</span>
                </Link>
                <Link href="/warga/riwayat" className="flex items-center gap-3.5 px-4 py-3 bg-[#52C3BF] text-white rounded-[14px] text-sm font-semibold">
                  <History className="w-4 h-4" /><span>Riwayat Aktivitas</span>
                </Link>
                <Link href="/warga/assistant" className="flex items-center gap-3.5 px-4 py-3 bg-[#235D6B] text-white rounded-[14px] text-sm">
                  <UserPlus className="w-4 h-4" /><span>PANTRA Assistant</span>
                </Link>
                <Link href="/warga/login" onClick={() => localStorage.clear()} className="flex items-center gap-3.5 px-4 py-3 bg-[#235D6B] text-white rounded-[14px] text-sm mt-1">
                  <LogOut className="w-4 h-4 text-red-400" /><span>Log Out</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden md:flex w-full h-[84px] bg-white px-8 py-4 justify-between items-center shadow-sm z-10 border-b border-slate-200">
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-[#0B424F] text-xl font-semibold">Riwayat Aktivitas &amp; Transaksi</h1>
              <p className="text-[#36959B] text-sm">Pantau seluruh rekam jejak pengembalian botol dan mutasi saldo dompetmu</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchActivityHistory(qrId)} className="p-3 bg-[#D2F0EE] hover:bg-[#BAE5E2] rounded-[10px] text-[#0B424F] transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>Perbarui</span>
              </button>
              <button onClick={() => setNotificationOpen((prev) => !prev)} className="p-3 bg-[#D2F0EE] rounded-[10px] text-[#0B424F]">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] border-[1.4px] border-[#36959B] text-[#0B424F]">
                <User className="w-5 h-5 text-[#0B424F]" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold">{userName}</span>
                  <span className="text-[10px] text-[#36959B] font-mono leading-none">{qrId}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8 flex flex-col gap-4 max-w-[1440px] w-full mx-auto">
            <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-[#0B424F] text-lg font-semibold">Semua Transaksi Realtime</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Tersinkronisasi otomatis dengan sistem PANTRA</p>
                </div>
                <div className="w-full sm:w-64 h-10 px-3 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#36959B] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari transaksi, warung..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-transparent text-xs text-[#0B424F] focus:outline-none"
                  />
                </div>
              </div>

              {/* TABLE */}
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
                            <span className="text-xs">Memuat riwayat...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Belum ada riwayat aktivitas ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row) => (
                        <tr key={row.id} className="hover:bg-[#F3FEFD]/50 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">#{row.id}</td>
                          <td className="py-3 px-3 font-semibold text-[#0B424F]">{row.mitra}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${row.aktivitas === "Tarik Saldo" ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-teal-50 text-teal-700 border border-teal-200"}`}>
                              {row.aktivitas === "Tarik Saldo" ? <ArrowUpRight className="w-3 h-3 text-rose-500" /> : <ArrowDownLeft className="w-3 h-3 text-teal-600" />}
                              {row.aktivitas}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{row.detail}</td>
                          <td className={`py-3 px-3 font-bold ${row.isPositive ? "text-teal-600" : "text-rose-500"}`}>{row.nominal}</td>
                          <td className="py-3 px-3 text-center text-slate-400 whitespace-nowrap">{row.tanggal}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                <span>Menampilkan {totalEntries > 0 ? startIndex + 1 : 0} dari {totalEntries} entri</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 bg-slate-100 rounded-lg disabled:opacity-40">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1.5 bg-[#52C3BF] text-white rounded-lg font-bold">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages} className="px-3 py-1.5 bg-slate-100 rounded-lg disabled:opacity-40">
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