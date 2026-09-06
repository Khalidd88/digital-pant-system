"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  History, 
  UserPlus, 
  LogOut, 
  QrCode, 
  Wallet, 
  LucideIcon 
} from "lucide-react";
import vectorLogo from "@/assets/Vector.png";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role?: "warga" | "warung";
  customItems?: MenuItem[];
}

export default function Sidebar({ role = "warga", customItems }: SidebarProps) {
  const pathname = usePathname();

  // Menu default khusus Warga
  const wargaMenuItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: `/warga/dashboard`,
      icon: Home,
    },
    {
      label: "Riwayat Aktivitas",
      href: `/warga/riwayat`,
      icon: History,
    },
    {
      label: "PANTRA Assistant",
      href: `/warga/assistant`,
      icon: UserPlus,
    },
  ];

  // Menu default khusus Mitra Warung (Lengkap dengan Dompet Kasir & Riwayat)
  const warungMenuItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: `/warung/dashboard`,
      icon: Home,
    },
    {
      label: "Scan QR Warga",
      href: `/warung/scan`,
      icon: QrCode,
    },
    {
      label: "Kelola Kas & Settlement",
      href: `/warung/dompet`,
      icon: Wallet,
    },
    {
      label: "Riwayat Transaksi",
      href: `/warung/riwayat`,
      icon: History,
    },
    {
      label: "PANTRA Assistant",
      href: `/warung/assistant`,
      icon: UserPlus,
    },
  ];

  // Tentukan susunan menu berdasarkan role atau customItems
  const menuItems = customItems || (role === "warung" ? warungMenuItems : wargaMenuItems);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-[#0B424F] p-6 flex flex-col justify-between shrink-0 border-r border-[#1F6A76]/30">
      <div className="flex flex-col gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-1 py-1">
          <Link href="/">
            <Image
              src={vectorLogo}
              alt="PANTRA Logo"
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-[16px] text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#52C3BF] text-white shadow-sm border-none font-bold"
                    : "bg-[#235D6B] text-white hover:bg-[#1F6A76] border-2 border-[#52C3BF]"
                }`}
              >
                <Icon className="w-4 h-4 text-white shrink-0" />
                <span className="font-['Poppins'] tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section: Logout */}
      <div className="flex flex-col gap-4">
        <div className="h-[1px] w-full bg-[#1F6A76]" />
        
        <Link
          href={`/${role}/login`}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 bg-[#235D6B] hover:bg-red-950/40 border-2 border-[#52C3BF] rounded-[16px] text-white font-semibold text-xs transition-all"
        >
          <LogOut className="w-4 h-4 text-white shrink-0" />
          <span className="font-['Poppins'] tracking-wide">Log Out</span>
        </Link>
      </div>
    </aside>
  );
}