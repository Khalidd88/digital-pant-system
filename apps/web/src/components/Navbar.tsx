"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import vectorGreen from "@/assets/Vector.png";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  navItems?: NavItem[];
  loginHref?: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Tentang", href: "#tentang" },
  { label: "Mitra Warung", href: "#mitra" },
];

export default function Navbar({
  navItems = DEFAULT_NAV_ITEMS,
  loginHref = "/warga/login",
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col items-center pt-5 px-4 backdrop-blur-sm">
      
      {/* ================= 1. HEADER CARD UTAMA ================= */}
      <div className="flex w-full max-w-[1040px] items-center justify-between px-6 md:px-8 py-3.5 bg-[linear-gradient(180deg,rgba(22,84,99,1)_0%,rgba(11,66,79,1)_100%)] rounded-[20px] shadow-card">
        
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-3">
          <Image
            src={vectorGreen}
            alt="Pantra Logo"
            className="h-[38px] w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item, idx) => (
            <a
              key={item.label}
              href={item.href}
              className={
                idx === 0
                  ? "font-bold text-sm bg-[linear-gradient(180deg,rgba(82,195,191,1)_0%,rgba(210,240,238,1)_100%)] bg-clip-text text-transparent font-['Poppins']"
                  : "font-normal text-sm text-white hover:text-[#52C3BF] transition-colors font-['Poppins']"
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Login Button */}
        <Link
          href={loginHref}
          className="hidden md:flex items-center justify-center px-7 py-2.5 bg-[#52C3BF] text-[#F3FEFD] font-semibold text-sm rounded-[15px] hover:bg-teal-400 transition-colors font-['Poppins']"
        >
          Login
        </Link>

        {/* Mobile Hamburger / Close Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-1 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* ================= 2. MOBILE DRAWER (Sesuai Referensi Gambar) ================= */}
      {isMenuOpen && (
        <div className="md:hidden w-full max-w-[1040px] mt-3 bg-[#0B424F] text-white p-6 rounded-[24px] flex flex-col gap-6 shadow-2xl border border-[#165463]/50 animate-fadeIn">
          
          {/* Navigation Links */}
          <nav className="flex flex-col gap-5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-white hover:text-[#52C3BF] transition-colors font-['Poppins']"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Full-width Login Button */}
          <Link
            href={loginHref}
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-center py-3.5 bg-[#52C3BF] text-[#0B424F] font-bold text-base rounded-[16px] hover:bg-teal-400 transition-colors font-['Poppins'] shadow-sm mt-1"
          >
            Login
          </Link>

        </div>
      )}

    </header>
  );
}