"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Zap,
  Activity,
  Target,
  Bot,
  Coins,
  Recycle,
  Store,
  Users,
  Clock,
  CheckCircle2,
  Smartphone,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Smile,
  ShieldCheck,
  Calculator,
  Globe,
} from "lucide-react";

// Asset Imports
import frame1000003067 from "@/assets/Frame 1000003067.png";
import logoDecor from "@/assets/LOGO.png";
import rectangle30531 from "@/assets/Rectangle 30531.png";
import vectorGreen from "@/assets/Vector.png";
import handphoneFloating from "@/assets/handphone floating@2x 1.png";
import vectorWhite from "@/assets/Vector2.png";
import ellipse1018 from "@/assets/Ellipse 1018.png";
import ellipse1019 from "@/assets/Ellipse 1019.png";
import ellipse1020 from "@/assets/Ellipse 1020.png";
import ellipse1021 from "@/assets/Ellipse 1021.png";
import ellipse1022 from "@/assets/Ellipse 1022.png";

const NAVIGATION_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Tentang", href: "#tentang" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Mitra Warung", href: "/warung/login" },
];

const AI_FEATURES = [
  {
    title: "100% Atomic",
    description: "Transaksi Cepat",
    icon: Zap,
    cardClass: "flex w-full sm:w-[170px] h-[60px] items-center gap-2.5 p-2.5 bg-[#E2FFE1] rounded-[10px]",
    iconBg: "bg-[#0BAD33] text-white",
    textColor: "text-[#0BAD33]",
  },
  {
    title: "<100ms",
    description: "Latensi Edge AI",
    icon: Activity,
    cardClass: "flex w-full sm:w-[170px] h-[60px] items-center gap-2.5 p-2.5 bg-[#DDF1FB] rounded-[10px]",
    iconBg: "bg-[#6AACF8] text-white",
    textColor: "text-[#6AACF8]",
  },
  {
    title: "High Precision",
    description: "Akurasi Material",
    icon: Target,
    cardClass: "flex w-full sm:w-[170px] h-[60px] items-center gap-2.5 p-2.5 bg-[#DDF1FB] rounded-[10px]",
    iconBg: "bg-[#6AACF8] text-white",
    textColor: "text-[#6AACF8]",
  },
  {
    title: "AI Bot",
    description: "Dibantu AI Chat",
    icon: Bot,
    cardClass: "flex w-full sm:w-[170px] h-[60px] items-center gap-2.5 p-2.5 bg-[#E2FFE1] rounded-[10px]",
    iconBg: "bg-[#0BAD33] text-white",
    textColor: "text-[#0BAD33]",
  },
];

const IMPACT_STATS = [
  {
    value: "Rp5 Milliar",
    label: "Total Saldo Dibagikan",
    icon: Coins,
  },
  {
    value: "519.450",
    label: "Total Botol Terkumpul",
    icon: Recycle,
  },
  {
    value: "180+",
    label: "Warung Mitra Aktif",
    icon: Store,
  },
  {
    value: "29.823",
    label: "Pengguna Aktif",
    icon: Users,
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Warga",
    description: "Bawa botol ke Warung Mitra",
    icon: Users,
  },
  {
    step: "02",
    title: "QR Scan",
    description: "Tunjukkan QR ID PANTRA kamu",
    icon: Smartphone,
  },
  {
    step: "03",
    title: "Pindai AI",
    description: "Warung memindai botol dengan Edge AI",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Saldo",
    description: "Saldo Warga dan Komisi Warung otomatis bertambah",
    icon: Coins,
  },
  {
    step: "05",
    title: "Diterima",
    description: "Saldo sampai di tangan warga dan warung",
    icon: Smile,
  },
];

// DATA GAMBAR WEB UNTUK SCROLL MULTIPLE CARDS
const COLLECTION_PROGRAMS = [
  {
    tag: "KRISIS LINGKUNGAN",
    title: "Pencemaran Laut & Pesisir",
    description: "Jutaan ton sampah botol plastik mencemari lautan dan mengancam ekosistem pesisir Indonesia.",
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "DARURAT SAMPAH",
    title: "Penumpukan Sampah Tanah",
    description: "Sampah botol plastik tak terurai menumpuk di pemukiman dan lahan terbuka warga.",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "AKSI BERSAMA",
    title: "Pengumpulan Botol Warga",
    description: "Gerakan bersama masyarakat mengumpulkan botol plastik bekas untuk didaur ulang secara tertib.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "EKOSISTEM WARUNG",
    title: "Mitra Warung PANTRA",
    description: "Pemberdayaan warung kelontong lokal sebagai hub pemindaian dan penukaran saldo instan.",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "JARINGAN SIRKULAR",
    title: "Pusat Pengolahan Bersama",
    description: "Distribusi hasil daur ulang yang terintegrasi secara cepat, efisien, dan berdampak nyata.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "INOVASI HIJAU",
    title: "Daur Ulang Terintegrasi",
    description: "Mengolah kembali botol plastik menjadi bahan baku sekunder industri daur ulang modern.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
  },
  {
    tag: "EKONOMI BERKELANJUTAN",
    title: "Insentif Nyata Warga",
    description: "Meningkatkan daya beli warga lokal melalui program daur ulang berbasis insentif langsung.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
  },
];

type UserRole = "mitra-warung" | "warga";

export default function LandingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State Kalkulator
  const [bottleCount, setBottleCount] = useState<number>(30);
  const estimatedIncome = bottleCount * 500;
  const co2Reduced = (bottleCount * 0.08).toFixed(1);

  // AUTO SCROLL INTERVAL
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pantra:role-selected", {
          detail: { role },
        })
      );
    }
    if (role === "mitra-warung") {
      router.push("/warung/login");
    } else {
      router.push("/warga/login");
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 310;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F3FEFD] text-[#264653] font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      
      {/* Background Ornaments */}
      <div className="absolute top-[200px] left-[-80px] w-[350px] md:w-[500px] pointer-events-none opacity-40 z-0">
        <Image src={ellipse1018} alt="" className="w-full h-auto" priority />
      </div>
      <div className="absolute top-[900px] right-[-100px] w-[400px] md:w-[550px] pointer-events-none opacity-35 z-0">
        <Image src={ellipse1019} alt="" className="w-full h-auto" priority />
      </div>
      <div className="absolute top-[1700px] left-[-120px] w-[380px] md:w-[520px] pointer-events-none opacity-40 z-0">
        <Image src={ellipse1020} alt="" className="w-full h-auto" priority />
      </div>
      <div className="absolute top-[2500px] right-[-80px] w-[350px] md:w-[480px] pointer-events-none opacity-30 z-0">
        <Image src={ellipse1021} alt="" className="w-full h-auto" priority />
      </div>
      <div className="absolute top-[3200px] left-[-50px] w-[320px] md:w-[450px] pointer-events-none opacity-35 z-0">
        <Image src={ellipse1022} alt="" className="w-full h-auto" priority />
      </div>

      <div className="absolute top-[480px] left-[10%] w-[320px] h-[320px] bg-[#8AD4D0] rounded-full blur-[110px] pointer-events-none opacity-50" />
      <div className="absolute top-[1350px] right-[8%] w-[380px] h-[380px] bg-[#52C3BF] rounded-full blur-[140px] pointer-events-none opacity-40" />
      <div className="absolute top-[2200px] left-[15%] w-[350px] h-[350px] bg-[#8AD4D0] rounded-full blur-[120px] pointer-events-none opacity-45" />

      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 w-full flex justify-center pt-5 px-4 backdrop-blur-sm">
        <div className="flex w-full max-w-[1040px] items-center justify-between px-8 py-3.5 bg-[linear-gradient(180deg,rgba(22,84,99,1)_0%,rgba(11,66,79,1)_100%)] rounded-[20px] shadow-card">
          <Link href="#home" className="flex items-center gap-3">
            <Image src={vectorGreen} alt="Pantra Logo" className="h-[38px] w-auto object-contain" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {NAVIGATION_ITEMS.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                className={
                  idx === 0
                    ? "font-bold text-sm bg-[linear-gradient(180deg,rgba(82,195,191,1)_0%,rgba(210,240,238,1)_100%)] bg-clip-text text-transparent"
                    : "font-normal text-sm text-white hover:text-[#52C3BF] transition-colors"
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href="/warga/login"
            className="hidden md:flex items-center justify-center px-7 py-2.5 bg-[#52C3BF] text-[#F3FEFD] font-semibold text-sm rounded-[15px] hover:bg-teal-400 transition-colors"
          >
            Login Warga
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden sticky top-20 z-40 bg-[#0B424F] text-white px-6 py-4 mx-4 mt-2 rounded-[15px] flex flex-col gap-3 shadow-lg border border-[#52C3BF]">
          {NAVIGATION_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-sm py-1.5 hover:text-[#52C3BF]"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/warga/login"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 text-center py-2 bg-[#52C3BF] text-[#0B424F] font-bold text-sm rounded-[10px]"
          >
            Login Warga
          </Link>
        </div>
      )}

      {/* 2. Hero Content Section */}
      <section id="home" className="relative z-10 flex flex-col items-center text-center pt-12 md:pt-16 pb-6 px-4 max-w-[680px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E8F6F5] border border-[#36959B] rounded-full text-xs font-bold text-[#36959B] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Daur Ulang Berbasis Edge AI #1 di Indonesia</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-[34px] font-bold text-[#264653] leading-[38px] sm:leading-[46px] mb-4">
          Ubah Botol Plastik Jadi <span className="text-[#36959B]">Saldo Instan</span> dalam 5 Detik di Warung Terdekat
        </h1>
        <p className="text-xs sm:text-base text-[#264653] max-w-[540px] mb-8 leading-6">
          Sistem Deposit-Refund tanpa ribet. Setor botolmu, verifikasi otomatis dengan AI, dan cairkan insentif digital seketika.
        </p>

        <Link
          href="/warga/login"
          className="inline-flex items-center justify-between w-56 p-3.5 bg-[#E8F6F5] text-[#36959B] border border-[#36959B] font-semibold text-sm rounded-[15px] shadow-button-card hover:bg-teal-100 transition-all"
        >
          <span>Mulai Setor Botol</span>
          <ArrowRight className="w-5 h-5 text-[#36959B]" />
        </Link>
      </section>

      {/* 3. Hero Preview Mockup */}
      <section id="platform" className="relative z-10 max-w-[1024px] mx-auto px-4 mt-8 mb-20">
        <div className="absolute right-[-60px] md:right-[-100px] top-[-30px] md:top-[-50px] w-[300px] md:w-[480px] pointer-events-none opacity-40 z-0">
          <Image src={logoDecor} alt="" className="w-full h-auto object-contain" priority />
        </div>

        <div className="relative z-10 w-full max-w-[920px] mx-auto">
          <div className="hidden md:block w-full relative">
            <Image
              src={rectangle30531}
              alt="PANTRA Dashboard Monitor Preview"
              className="w-full h-auto object-contain rounded-[20px]"
              priority
            />
          </div>

          <div className="md:hidden w-full max-w-[300px] mx-auto relative py-4">
            <Image
              src={handphoneFloating}
              alt="PANTRA Mobile Preview"
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-0 left-0 w-full h-[160px] md:h-[240px] bg-[linear-gradient(180deg,rgba(243,254,253,0)_0%,rgba(243,254,253,1)_100%)] pointer-events-none z-15" />

          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-[728px] px-2 flex flex-wrap items-center justify-center md:justify-between gap-3">
            <div className="flex w-[219px] items-center justify-around gap-3 p-3.5 bg-white rounded-[15px] border-[1.4px] border-[#36959B] shadow-card">
              <Clock className="w-8 h-8 text-[#36959B] shrink-0" />
              <div className="flex flex-col items-start gap-0.5 w-[125px]">
                <h3 className="font-bold text-[#36959B] text-base leading-normal">Insentif Instan</h3>
                <p className="text-xs text-[#264653] leading-normal font-medium">Saldo masuk detik itu juga</p>
              </div>
            </div>

            <div className="flex w-[242px] items-center justify-around gap-3 p-3.5 bg-white rounded-[15px] border-[1.4px] border-[#36959B] shadow-card">
              <CheckCircle2 className="w-6 h-6 text-[#0BAD33] shrink-0" />
              <div className="flex flex-col items-start gap-0.5 w-[155px]">
                <h3 className="font-bold text-[#36959B] text-base leading-normal">Validasi oleh AI</h3>
                <p className="text-xs text-[#264653] leading-normal font-medium">Verifikasi terotomasi</p>
              </div>
            </div>

            <div className="flex w-[219px] items-center justify-around gap-3 p-3.5 bg-white rounded-[15px] border-[1.4px] border-[#36959B] shadow-card">
              <Smartphone className="w-7 h-7 text-[#36959B] shrink-0" />
              <div className="flex flex-col items-start gap-0.5 w-[125px]">
                <h3 className="font-bold text-[#36959B] text-base leading-normal">Cukup pakai HP</h3>
                <p className="text-xs text-[#264653] leading-normal font-medium">Kamera HP mitra warung</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Statistics */}
      <section id="dampak" className="relative z-10 py-12 px-4 max-w-[1024px] mx-auto text-center mt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#264653] mb-10">
          Mengapa <span className="text-[#43999b]">Pantra?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPACT_STATS.map((stat) => {
            const IconComp = stat.icon;
            return (
              <div
                key={stat.label}
                className="inline-flex items-center gap-[22px] p-3.5 bg-white rounded-[20px] shadow-card"
              >
                <div className="flex flex-col w-[60px] h-[60px] items-center justify-center gap-2.5 p-2.5 bg-[#E8F6F5] rounded-[10px] border border-[#36959B] shrink-0">
                  <IconComp className="w-7 h-7 text-[#36959B]" />
                </div>
                <div className="text-left flex flex-col w-[125px]">
                  <dd className="font-bold text-[#36959B] text-2xl leading-normal">
                    {stat.value}
                  </dd>
                  <dt className="text-xs text-[#264653] font-medium leading-normal">{stat.label}</dt>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Kalkulator Estimasi Pendapatan Warga */}
      <section className="relative z-10 py-8 px-4 max-w-[780px] mx-auto">
        <div className="bg-[linear-gradient(180deg,rgba(22,84,99,1)_0%,rgba(11,66,79,1)_100%)] text-white rounded-[20px] p-6 sm:p-8 shadow-card border border-[#52C3BF]/30">
          <div className="flex items-center justify-center gap-2 text-[#52C3BF] text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4" />
            <span>Kalkulator Potensi Insentif</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-center text-white mb-6">
            Hitung Berapa Saldo yang Bisa Kamu Dapatkan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-emerald-100 flex justify-between">
                <span>Setor Botol / Minggu:</span>
                <span className="font-bold text-[#52C3BF] text-sm">{bottleCount} Botol</span>
              </label>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={bottleCount}
                onChange={(e) => setBottleCount(Number(e.target.value))}
                className="w-full h-2 bg-[#1a6475] rounded-lg appearance-none cursor-pointer accent-[#52C3BF]"
              />
              <p className="text-[10px] text-emerald-100/70 italic">
                *Tukarkan kapan saja di Warung Mitra terdekat.
              </p>
            </div>

            <div className="flex justify-around bg-white/10 p-4 rounded-[15px] border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-200">Estimasi Saldo/Bulan</span>
                <span className="text-lg font-bold text-[#52C3BF]">
                  Rp {(estimatedIncome * 4).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-4">
                <span className="text-[10px] text-emerald-200">Emisi CO₂ Dicegah</span>
                <span className="text-lg font-bold text-white">
                  {(Number(co2Reduced) * 4).toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Verification Section */}
      <section id="fitur" className="relative z-10 py-12 px-4 max-w-[1024px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-[330px]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-[44px]">
              <span className="text-[#264653]">Verifikasi Pintar </span>
              <span className="text-[#36959b]">Berbasis Dual AI</span>
            </h2>
            <p className="text-sm text-[#264653] mb-8 leading-6">
              Kombinasi Computer Vision real-time dan Assistant LLM untuk ekosistem daur ulang yang transparan.
            </p>

            <ul className="flex flex-wrap gap-2.5 w-full">
              {AI_FEATURES.map((feature) => {
                const IconComp = feature.icon;
                return (
                  <li key={feature.title} className={feature.cardClass}>
                    <div className={`w-9 h-9 flex items-center justify-center rounded-[10px] ${feature.iconBg} shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${feature.textColor}`}>{feature.title}</span>
                      <span className="text-xs text-[#11424F]">{feature.description}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="w-full lg:w-[614px] h-[340px] relative rounded-[20px] overflow-hidden shadow-card">
            <Image
              src={frame1000003067}
              alt="Ilustrasi proses verifikasi AI"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. Role Selection Section */}
      <section id="role-selection" className="relative z-10 py-12 px-4 max-w-[746px] mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-[44px]">
          <span className="text-[#264653]">Masuk ke </span>
          <span className="text-[#43999b]">Pantra?</span>
        </h2>
        <p className="text-sm text-[#264653] mb-8">Pilih peran Anda untuk melanjutkan</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {/* Mitra Warung Card */}
          <article className="flex flex-col items-start justify-center gap-6 px-3.5 py-5 rounded-[14px] shadow-[inset_0px_4px_4px_#ffffff9c] bg-[linear-gradient(180deg,rgba(186,229,226,1)_0%,rgba(82,195,191,1)_100%)]">
            <div className="flex items-start gap-6 w-full">
              <div className="p-2.5 bg-[#F3FEFD] rounded-[15px] shrink-0">
                <Store className="w-[60px] h-[60px] text-[#36959B]" />
              </div>
              <div className="flex flex-col gap-2.5 flex-1">
                <h3 className="font-bold text-[#264653] text-lg">Mitra Warung</h3>
                <p className="text-sm text-[#264653]">Bantu verifikasi botol dan dapatkan komisi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRoleSelection("mitra-warung")}
              className="flex items-center justify-between px-5 py-3 w-full bg-[#F3FEFD] rounded-[15px] cursor-pointer hover:bg-white transition-colors"
            >
              <span className="font-semibold text-[#36959B] text-sm">Masuk Mitra Warung</span>
              <ArrowRight className="w-5 h-5 text-[#36959B]" />
            </button>
          </article>

          {/* Warga Card */}
          <article className="flex flex-col items-start justify-center gap-6 px-3.5 py-5 rounded-[14px] shadow-[inset_0px_4px_4px_#ffffff9c] bg-[linear-gradient(180deg,rgba(22,84,99,1)_0%,rgba(11,66,79,1)_100%)]">
            <div className="flex items-start gap-6 w-full">
              <div className="p-2.5 bg-[#3a7a89] rounded-[15px] shrink-0">
                <Users className="w-[60px] h-[60px] text-white" />
              </div>
              <div className="flex flex-col gap-2.5 flex-1 text-white">
                <h3 className="font-bold text-lg">Warga</h3>
                <p className="text-sm text-[#E8F6F5]">Setor botol bekasmu ke warung dan cairkan saldo instan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRoleSelection("warga")}
              className="flex items-center justify-between px-5 py-3 w-full bg-[#52C3BF] rounded-[15px] cursor-pointer hover:bg-teal-400 transition-colors"
            >
              <span className="font-semibold text-white text-sm">Masuk Portal Warga</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </article>
        </div>
      </section>

      {/* 7. Workflow Steps */}
      <section id="cara-kerja" className="relative z-10 py-12 px-4 max-w-[1024px] mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12 leading-[44px]">
          <span className="text-[#264653]">Bagaimana</span>
          <span className="text-[#36959b]"> Cara kerjanya?</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 items-start">
          {WORKFLOW_STEPS.map((step) => {
            const IconComp = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center gap-4">
                <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] bg-white rounded-[24px] shadow-[0_12px_28px_rgba(54,149,151,0.18)] flex items-center justify-center transition-transform hover:-translate-y-1">
                  <IconComp className="w-12 h-12 text-[#52C3BF]" />
                </div>
                <div className="flex flex-col items-center gap-1 max-w-[160px]">
                  <h3 className="font-bold text-[#264653] text-base">{step.title}</h3>
                  <p className="text-xs text-[#264653] text-center leading-relaxed font-normal opacity-90">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Collection Program Slider Section (Pakai Tag <img> Biasa - Bebas Diblokir Next.js) */}
      <section id="tentang" className="relative z-10 py-16 px-4 max-w-[1024px] mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-[50px]">
          
          {/* Left Narrative Panel */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F6F5] border border-[#36959B] rounded-full text-xs font-bold text-[#36959B] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dampak Sirkular Nyata</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
              <span className="text-[#264653]">Dari Sampah Lingkungan </span>
              <span className="text-[#36959b]">Menjadi Nilai Ekonomi</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#264653]/80 leading-relaxed mb-6">
              Setiap botol plastik yang dikumpulkan membantu mengurangi sampah liar di lingkungan sekaligus mengalirkan insentif digital langsung ke kantong masyarakat.
            </p>

            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Slide Berita ke Kiri"
                className="w-11 h-11 rounded-full border border-[#36959B] flex items-center justify-center text-[#36959B] hover:bg-[#36959B] hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Slide Berita ke Kanan"
                className="w-11 h-11 rounded-full border border-[#36959B] flex items-center justify-center text-[#36959B] hover:bg-[#36959B] hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Scrollable Cards Slider */}
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none w-full lg:w-[650px] scroll-smooth snap-x snap-mandatory"
          >
            {COLLECTION_PROGRAMS.map((program) => (
              <article
                key={program.title}
                className="relative overflow-hidden flex flex-col shrink-0 w-[270px] sm:w-[290px] h-[330px] items-start justify-end p-5 rounded-[24px] shadow-lg border border-[#52C3BF]/20 text-white group snap-start transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={program.image}
                  alt={program.title}
                  className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B424F] via-[#0B424F]/60 to-transparent" />
                <div className="absolute inset-0 z-10 bg-black/15 group-hover:bg-black/0 transition-colors" />

                <div className="absolute top-4 left-4 z-20">
                  <span className="px-2.5 py-1 bg-[#52C3BF]/90 backdrop-blur-md text-[#0B424F] text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm">
                    {program.tag}
                  </span>
                </div>

                <div className="relative z-20 flex flex-col w-full items-start">
                  <h3 className="font-bold text-lg leading-snug mb-1.5 text-white group-hover:text-[#52C3BF] transition-colors">
                    {program.title}
                  </h3>
                  <p className="font-normal text-xs text-emerald-50/90 leading-relaxed line-clamp-3">
                    {program.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 9. Community Impact Cards */}
      <section className="relative z-10 py-12 px-4 max-w-[536px] mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">
          <span className="text-[#0a414f]">Dampak </span>
          <span className="text-[#36959b]">Bersama</span>
        </h2>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-[20px] bg-[#E2FFE1] border border-[#0BAD33] flex items-center gap-3">
            <Coins className="w-8 h-8 text-[#0BAD33] shrink-0" />
            <div>
              <div className="font-bold text-[#36959B] text-lg">Rp5 Milliar</div>
              <div className="text-xs text-[#264653]">Saldo Dibagikan</div>
            </div>
          </div>
          <div className="p-4 rounded-[20px] bg-[#DDF1FB] border border-[#6AACF8] flex items-center gap-3">
            <Recycle className="w-8 h-8 text-[#6AACF8] shrink-0" />
            <div>
              <div className="font-bold text-[#36959B] text-lg">519.450</div>
              <div className="text-xs text-[#264653]">Botol Terkumpul</div>
            </div>
          </div>
          <div className="p-4 rounded-[20px] bg-[#FFF8E1] border border-[#E3A810] flex items-center gap-3">
            <Clock className="w-8 h-8 text-[#E3A810] shrink-0" />
            <div>
              <div className="font-bold text-[#E3A810] text-lg">Instan</div>
              <div className="text-xs text-[#264653]">Saldo Masuk</div>
            </div>
          </div>
          <div className="p-4 rounded-[20px] bg-[#FFE1E6] border border-[#F96A6A] flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#F96A6A] shrink-0" />
            <div>
              <div className="font-bold text-[#F96A6A] text-lg">SDG'11 & 8</div>
              <div className="text-xs text-[#264653]">Lingkungan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Badge UN SDGs */}
      <section className="relative z-10 py-6 px-4 max-w-[700px] mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#36959B]/30 rounded-full text-[11px] font-bold text-[#36959B] mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Mendukung Sustainable Development Goals (UN SDGs)</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-white border border-[#52C3BF]/40 text-[#264653] font-bold text-xs rounded-lg shadow-sm">
            SDG 8: Pertumbuhan Ekonomi
          </span>
          <span className="px-3 py-1 bg-white border border-[#52C3BF]/40 text-[#264653] font-bold text-xs rounded-lg shadow-sm">
            SDG 11: Kota Berkelanjutan
          </span>
          <span className="px-3 py-1 bg-white border border-[#52C3BF]/40 text-[#264653] font-bold text-xs rounded-lg shadow-sm">
            SDG 12: Konsumsi Bertanggung Jawab
          </span>
          <span className="px-3 py-1 bg-white border border-[#52C3BF]/40 text-[#264653] font-bold text-xs rounded-lg shadow-sm">
            SDG 14: Ekosistem Lautan
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#36959B]/20 bg-[#0B424F] text-white py-8 px-4 text-center mt-12">
        <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src={vectorWhite} alt="PANTRA Logo" className="h-6 w-auto" />
            <span className="font-bold text-sm tracking-wide">PANTRA Indonesia</span>
          </div>
          <p className="text-xs text-[#E8F6F5]/80">
            &copy; {new Date().getFullYear()} PANTRA - Platform Daur Ulang Berbasis Dual AI & Inklusi Ekonomi.
          </p>
        </div>
      </footer>

    </div>
  );
}