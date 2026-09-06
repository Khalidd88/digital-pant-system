"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Heart,
} from "lucide-react";

// Asset Imports dari @/assets (Termasuk aset lokal baru)
import logoDecor from "@/assets/LOGO.png";
import vectorWhite from "@/assets/Vector2.png";
import ellipse1018 from "@/assets/Ellipse 1018.png";
import ellipse1019 from "@/assets/Ellipse 1019.png";
import botolTanahImg from "@/assets/Botol Bekas di Tanah.webp";

export default function RegisterWargaPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mendaftar");
      }

      // Simpan session user yang baru dibuat ke browser
      localStorage.setItem("pantra_user", JSON.stringify(json.data));
      localStorage.setItem("pantra_user_qr", json.data.qrId);

      // Arahkan langsung ke dashboard
      router.push("/warga/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F3FEFD] flex items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden selection:bg-[#52C3BF] selection:text-[#0B424F]">
      
      {/* Background Radial Glow & Ellipse Blur Effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#8AD4D0]/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-50px] w-[450px] h-[450px] bg-[#52C3BF]/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-80px] w-[300px] pointer-events-none opacity-30 z-0">
        <Image src={ellipse1018} alt="" className="w-full h-auto" priority />
      </div>
      <div className="absolute bottom-[10%] right-[-60px] w-[350px] pointer-events-none opacity-25 z-0">
        <Image src={ellipse1019} alt="" className="w-full h-auto" priority />
      </div>

      {/* CARD MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-[900px] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(54,149,151,0.15)] flex flex-col md:flex-row overflow-hidden border border-[#36959B]/20">
        
        {/* ================= LEFT BANNER (SIDEBAR VISUAL) ================= */}
        <div className="relative w-full md:w-[450px] min-h-[380px] md:min-h-[700px] bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          
          {/* Background Image: Menggunakan Aset Lokal Botol Bekas di Tanah.webp */}
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
            <Image
              src={botolTanahImg}
              alt="Botol plastik bekas daur ulang di tanah"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Watermark Decoration: LOGO.png Roda Daur Ulang di Kanan Bawah */}
          <div className="absolute right-[-80px] bottom-[-60px] w-[320px] md:w-[420px] pointer-events-none opacity-25 z-0">
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
          <div className="relative z-10 mt-auto pt-12">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-6">
              Kelola Setoran Botol <br />dengan Mudah
            </h2>

            {/* 3 Badge Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Card 1: Instan */}
              <div className="bg-white rounded-[14px] p-3 flex flex-col justify-between h-[84px] shadow-sm">
                <div className="w-7 h-7 rounded-full bg-[#E8F6F5] flex items-center justify-center text-[#52C3BF]">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-bold text-[#52C3BF] text-xs">Instan</span>
              </div>

              {/* Card 2: Terverifikasi */}
              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[84px]">
                <div className="w-7 h-7 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs">Terverifikasi</span>
              </div>

              {/* Card 3: Transparan */}
              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[84px]">
                <div className="w-7 h-7 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-xs">Transparan</span>
              </div>

            </div>
          </div>

        </div>


        {/* ================= RIGHT FORM SECTION ================= */}
        <div className="w-full p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          
          <h1 className="text-2xl font-bold text-[#0B424F] mb-6">
            Registrasi Warga
          </h1>

          {/* Alert Message jika ada error */}
          {errorMessage && (
            <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Field 1: Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-[#0B424F]">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3.5 py-2.5 bg-[#E8F6F5] border border-[#36959B] rounded-[10px] text-sm text-[#0B424F] font-medium focus:outline-none focus:ring-2 focus:ring-[#52C3BF]"
                required
              />
            </div>

            {/* Field 2: Email */}
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
                className="w-full px-3.5 py-2.5 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF] transition-all"
                required
              />
            </div>

            {/* Field 3: No. Telepon */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-[#0B424F]">
                No. Telepon
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F5F5] rounded-[10px] shrink-0 border border-transparent">
                  <div className="w-4 h-3 bg-white border border-gray-200 flex flex-col overflow-hidden rounded-[1px]">
                    <div className="h-1/2 bg-red-600 w-full" />
                    <div className="h-1/2 bg-white w-full" />
                  </div>
                  <span className="text-sm font-semibold text-[#0B424F]">+62</span>
                </div>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08XX XXXX XXXX"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF] transition-all"
                  required
                />
              </div>
            </div>

            {/* Field 4: Password */}
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
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF] transition-all"
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

            {/* Field 5: Konfirmasi Password */}
            <div className="flex flex-col gap-1.5">
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
                  placeholder="*************"
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] focus:outline-none focus:bg-white focus:border-[#52C3BF] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#36959B] hover:text-[#0B424F] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#52C3BF] hover:bg-teal-400 text-white font-bold text-sm rounded-[10px] transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Mendaftarkan Akun..." : "Register"}
            </button>

          </form>

          {/* Footer Text: Login Redirect */}
          <div className="text-center mt-5 text-xs text-[#0B424F]">
            Sudah punya akun?{" "}
            <Link
              href="/warga/login"
              className="font-bold hover:underline text-[#0B424F]"
            >
              Login disinii
            </Link>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            className="w-full py-2.5 mt-4 bg-[#F5F5F5] hover:bg-gray-200 rounded-[10px] flex items-center justify-center gap-2.5 transition-colors"
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