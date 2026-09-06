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
} from "lucide-react";

// Asset Imports
import logoDecor from "@/assets/LOGO.png";
import vectorWhite from "@/assets/Vector2.png";
import ellipse1018 from "@/assets/Ellipse 1018.png";
import ellipse1019 from "@/assets/Ellipse 1019.png";
import pengumpulanBotolImg from "@/assets/pengumpulan botol.jpg";

export default function LoginWarungPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "example@gmail.com",
    password: "",
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
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://pantra-production.up.railway.app/api/auth/warung/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Email atau password warung salah.");
      }

      const warung = result.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("pantra_warung_id", warung.warungId || "WRG-0001");
      storage.setItem("pantra_warung_name", warung.name || "Warung Mitra");
      storage.setItem("pantra_warung_user", JSON.stringify(warung));
      storage.setItem("pantra_role", "WARUNG");

      router.push("/warung/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal terhubung ke server.");
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
      <main className="relative z-10 w-full max-w-[900px] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(11,66,79,0.3)] flex flex-col md:flex-row overflow-hidden border border-[#52C3BF]/30">
        
        {/* ================= LEFT BANNER (SIDEBAR VISUAL) ================= */}
        <div className="relative w-full md:w-[500px] min-h-[360px] md:min-h-[560px] bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          
          {/* Background Image: pengumpulan botol.jpg */}
          <div className="absolute inset-0 z-0 opacity-35 mix-blend-overlay">
            <Image
              src={pengumpulanBotolImg}
              alt="Pengumpulan botol di mitra warung"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Watermark Decoration: LOGO.png */}
          <div className="absolute right-[-80px] bottom-[-60px] w-[320px] md:w-[420px] pointer-events-none opacity-20 z-0">
            <Image
              src={logoDecor}
              alt=""
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Soft Radial Glow Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: "radial-gradient(80% 80% at 20% 20%, rgba(82, 195, 191, 0.4) 0%, rgba(11, 66, 79, 0) 100%)",
            }}
          />

          {/* Top Section: Pantra Brand Logo */}
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

          {/* Bottom Section: Headline & 3 Badge Feature Cards */}
          <div className="relative z-10 mt-auto pt-10">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-6">
              Kelola Setoran Botol <br />dengan Mudah
            </h2>

            {/* 3 Badge Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Card 1: Data real-time */}
              <div className="bg-white rounded-[14px] p-3 flex flex-col justify-between h-[80px] shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#E8F6F5] flex items-center justify-center text-[#52C3BF]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[#52C3BF] text-[11px] leading-tight">Data real-time</span>
              </div>

              {/* Card 2: Terverifikasi */}
              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[80px]">
                <div className="w-6 h-6 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">Terverifikasi</span>
              </div>

              {/* Card 3: Transparan */}
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
          
          <h1 className="text-2xl font-bold text-[#0B424F] mb-6">
            Login Mitra Warung
          </h1>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 text-xs font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Field 1: Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#0B424F]">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-3 bg-[#E8F6F5] border border-[#36959B] rounded-[10px] text-sm text-[#0B424F] font-medium focus:outline-none focus:ring-2 focus:ring-[#52C3BF]"
                required
              />
            </div>

            {/* Field 2: Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-[#0B424F]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="*************"
                  className="w-full px-3.5 py-3 pr-10 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36959B] hover:text-[#0B424F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Lupa Sandi */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#36959B] text-[#52C3BF] focus:ring-[#52C3BF]"
                />
                <span className="text-xs font-semibold text-[#0B424F]">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[#36959B] hover:underline"
              >
                Lupa Sandi?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#52C3BF] hover:bg-teal-400 disabled:opacity-70 text-white font-bold text-sm rounded-[15px] transition-colors shadow-sm"
            >
              {loading ? "Memeriksa akun..." : "Login"}
            </button>

          </form>

          {/* Footer Text: Register Redirect */}
          <div className="text-center mt-6 text-xs text-[#0B424F]">
            Belum punya akun?{" "}
            <Link
              href="/warung/register"
              className="font-bold hover:underline text-[#0B424F]"
            >
              Daftar dulu yuu
            </Link>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            className="w-full py-3 mt-4 bg-[#F5F5F5] hover:bg-gray-200 rounded-[10px] flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs text-[#0B424F] font-normal">
              Login with <strong className="font-bold">Google</strong>
            </span>
          </button>

        </div>

      </main>

    </div>
  );
}