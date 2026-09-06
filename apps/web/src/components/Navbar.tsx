"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Home, 
  Glasses, 
  Tv, 
  Globe, 
  Calendar, 
  Send, 
  Search, 
  Menu, 
  X 
} from "lucide-react";
import logoGarasi from "@/assets/logo-garasi.png"; // Ganti dengan path logo Anda

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Genre", href: "#genre", icon: Glasses },
  { label: "TV Series", href: "#tv-series", icon: Tv },
  { label: "Negara", href: "#negara", icon: Globe },
  { label: "Tahun", href: "#tahun", icon: Calendar },
  { label: "Join Telegram", href: "#telegram", icon: Send },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect atau handle logika pencarian di sini
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col items-center pt-3 px-3 md:px-6">
      
      {/* Container Utama (Pill Style Glassmorphism) */}
      <div className="flex w-full max-w-[1280px] items-center justify-between px-4 md:px-6 py-2.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transition-all">
        
        {/* 1. Logo Brand */}
        <Link href="/" className="flex items-center shrink-0 mr-2 md:mr-6">
          <Image
            src={logoGarasi}
            alt="GarasiFilm21 Logo"
            className="h-7 md:h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* 2. Desktop & Tablet Nav Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm text-gray-200">
          {DEFAULT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 font-medium hover:text-white transition-colors py-1 px-1.5"
              >
                <Icon className="w-4 h-4 text-gray-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Search Bar (Desktop & iPad/Tablet Wide) */}
        <div className="hidden sm:flex items-center">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 md:w-48 lg:w-56 bg-zinc-900/90 border border-zinc-700/80 rounded-md py-1.5 pl-3 pr-9 text-xs md:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 text-gray-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 4. Hamburger Toggle (Mobile Only) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-gray-300 hover:text-white p-1.5 focus:outline-none ml-auto sm:ml-2"
          aria-label="Toggle Navigation Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ================= MOBILE & TABLET DRAWER ================= */}
      {isMenuOpen && (
        <div className="lg:hidden w-full max-w-[1280px] mt-2 bg-zinc-950/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col gap-4 text-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="relative flex items-center w-full sm:hidden">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 text-gray-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {DEFAULT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-zinc-800/80 transition-colors text-sm font-medium text-gray-200"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>
      )}

    </header>
  );
}