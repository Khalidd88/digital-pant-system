"use client";

import { useState, useEffect } from "react";
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

export default function LoginWarungPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "warung.butejo@pantra.id",
    password: "",
  });

  // Muat email tersimpan jika remember me aktif sebelumnya
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("pantra_saved_warung_email");
      if (savedEmail) {
        setFormData((prev) => ({ ...prev, email: savedEmail }));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/warung/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Email atau password warung salah.");
      }

      // Simpan session mitra warung ke localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("pantra_user_role", "WARUNG");
        localStorage.setItem("pantra_warung_id", json.data.warungId || "WRG-0001");
        localStorage.setItem("pantra_warung_name", json.data.name || "Warung Bu Tejo");
        localStorage.setItem("pantra_warung_user", JSON.stringify(json.data));

        if (rememberMe) {
          localStorage.setItem("pantra_saved_warung_email", formData.email);
        } else {
          localStorage.removeItem("pantra_saved_warung_email");
        }
      }

      // Redirect ke dashboard warung
      router.push("/warung/dashboard");
    } catch (err: any) {
      console.error("Warung Login Error:", err);
      setErrorMessage(err.message || "Koneksi ke server gagal. Pastikan backend aktif di port 4000.");
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
        
        {/* LEFT BANNER */}
        <div className="relative w-full md:w-[500px] min-h-[360px] md:min-h-[560px] bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
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

        {/* RIGHT FORM */}
        <div className="w-full p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl font-bold text-[#0B424F]">
              Login Mitra Warung
            </h1>
            <p className="text-xs text-[#36959B]">
              Masuk untuk memvalidasi setoran botol dan verifikasi QR warga
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#0B424F]">
                Email Mitra Warung
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="warung.butejo@pantra.id"
                className="w-full px-3.5 py-3 bg-[#E8F6F5] border border-[#36959B] rounded-[10px] text-sm text-[#0B424F] font-medium focus:outline-none focus:ring-2 focus:ring-[#52C3BF]"
                required
              />
            </div>

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

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#36959B] text-[#52C3BF] focus:ring-[#52C3BF]"
                />
                <span className="text-xs font-semibold text-[#0B424F]">Ingat saya</span>
              </label>
              <Link
                href="/warung/register"
                className="text-xs font-semibold text-[#36959B] hover:underline"
              >
                Daftar Mitra Baru?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#52C3BF] hover:bg-teal-400 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[15px] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun Mitra...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard Warung</span>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-[#0B424F]">
            Bukan mitra warung?{" "}
            <Link
              href="/warga/login"
              className="font-bold hover:underline text-[#36959B]"
            >
              Login sebagai Warga di sini
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}