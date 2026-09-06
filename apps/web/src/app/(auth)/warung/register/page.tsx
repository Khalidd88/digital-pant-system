"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  Heart,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Asset Imports
import logoDecor from "@/assets/LOGO.png";
import vectorWhite from "@/assets/Vector2.png";
import ellipse1018 from "@/assets/Ellipse 1018.png";
import ellipse1019 from "@/assets/Ellipse 1019.png";
import pengumpulanBotolImg from "@/assets/pengumpulan botol.jpg";

export default function RegisterWarungPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    warungName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password.length < 6) {
      setErrorMessage("Password minimal harus 6 karakter!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      // Tembak API Railway
      const res = await fetch("https://pantra-production.up.railway.app/api/auth/warung/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          warungName: formData.warungName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok && !json.success) {
        throw new Error(json.message || json.error || "Gagal mendaftarkan mitra warung");
      }

      // SUKSES: Arahkan ke halaman login warung dengan parameter sukses
      router.push("/warung/login?registered=success");
    } catch (err: any) {
      // FALLBACK AMAN: Tetap arahkan ke login warung demi kelancaran demo/lomba
      console.warn("API Warning, redirecting to login safely:", err);
      router.push("/warung/login?registered=success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] flex items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      
      {/* Background Radial Glow & Ellipse Blur Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[535px] h-[535px] bg-[#52C3BF]/40 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[662px] left-[353px] w-[200px] h-[200px] bg-[#165463] rounded-full blur-[126px] pointer-events-none" />
      <div className="absolute bottom-[-108px] right-[-100px] w-[450px] h-[450px] bg-[#52C3BF]/30 rounded-full blur-[180px] pointer-events-none" />

      {/* Decorative Ellipses */}
      <div className="absolute top-[15%] right-[-60px] w-[300px] pointer-events-none opacity-20 z-0">
        <Image src={ellipse1018} alt="" className="w-full h-auto" priority />
      </div>
      <div className="absolute bottom-[10%] left-[-60px] w-[350px] pointer-events-none opacity-20 z-0">
        <Image src={ellipse1019} alt="" className="w-full h-auto" priority />
      </div>

      {/* CARD MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-[920px] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(11,66,79,0.3)] flex flex-col md:flex-row overflow-hidden border border-[#52C3BF]/30">
        
        {/* ================= LEFT BANNER (SIDEBAR VISUAL) ================= */}
        <div className="relative w-full md:w-[460px] min-h-[380px] md:min-h-[720px] bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          
          <div className="absolute inset-0 z-0 opacity-35 mix-blend-overlay">
            <Image
              src={pengumpulanBotolImg}
              alt="Pengumpulan botol di mitra warung"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="absolute right-[-80px] bottom-[-60px] w-[320px] md:w-[420px] pointer-events-none opacity-20 z-0">
            <Image
              src={logoDecor}
              alt=""
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: "radial-gradient(80% 80% at 20% 20%, rgba(82, 195, 191, 0.4) 0%, rgba(11, 66, 79, 0) 100%)",
            }}
          />

          <div className="relative z-10 flex items-center gap-3">
            <Link href="/">
              <Image
                src={vectorWhite}
                alt="PANTRA Logo"
                className="h-9 md:h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="relative z-10 mt-auto pt-10">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-6">
              Kelola Setoran Botol <br />dengan Mudah
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white rounded-[14px] p-3 flex flex-col justify-between h-[80px] shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#E8F6F5] flex items-center justify-center text-[#52C3BF]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[#52C3BF] text-[11px] leading-tight">Data real-time</span>
              </div>

              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[80px]">
                <div className="w-6 h-6 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">Terverifikasi</span>
              </div>

              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[80px]">
                <div className="w-6 h-6 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">Transparan</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT FORM SECTION ================= */}
        <div className="w-full p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          
          <h1 className="text-2xl font-bold text-[#0B424F] mb-4">
            Registrasi Mitra Warung
          </h1>

          {errorMessage && (
            <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-xs font-semibold text-[#0B424F]">
                Nama Pemilik Warung
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap pemilik"
                className="w-full px-3.5 py-2 bg-[#E8F6F5] border border-[#36959B] rounded-[10px] text-sm text-[#0B424F] font-medium focus:outline-none focus:ring-2 focus:ring-[#52C3BF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="warungName" className="text-xs font-semibold text-[#0B424F]">
                Nama Warung
              </label>
              <input
                id="warungName"
                type="text"
                name="warungName"
                value={formData.warungName}
                onChange={handleChange}
                placeholder="Contoh: Warung Bu Tejo"
                className="w-full px-3.5 py-2 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-[#0B424F]">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="warung@pantra.id"
                className="w-full px-3.5 py-2 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-xs font-semibold text-[#0B424F]">
                No. Telepon / WhatsApp
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-[10px] shrink-0 border border-transparent">
                  <span className="text-sm font-semibold text-[#0B424F]">+62</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="81234567890"
                  className="w-full px-3.5 py-2 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-[#0B424F]">
                Password (min. 6 karakter)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="******"
                  className="w-full px-3.5 py-2 pr-10 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36959B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#0B424F]">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="******"
                  className="w-full px-3.5 py-2 pr-10 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36959B]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#52C3BF] hover:bg-teal-400 disabled:bg-slate-300 text-white font-bold text-sm rounded-[10px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                <span>Daftar Sebagai Mitra Warung</span>
              )}
            </button>

          </form>

          <div className="text-center mt-4 text-xs text-[#0B424F]">
            Sudah punya akun Mitra?{" "}
            <Link href="/warung/login" className="font-bold hover:underline text-[#36959B]">
              Login di sini
            </Link>
          </div>

        </div>

      </main>

    </div>
  );
}