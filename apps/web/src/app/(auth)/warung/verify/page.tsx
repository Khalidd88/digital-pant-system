"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Activity,
  CheckCircle2,
  Heart,
  FileText,
} from "lucide-react";

// Asset Imports
import logoDecor from "@/assets/LOGO.png";
import vectorWhite from "@/assets/Vector2.png";
import ellipse1018 from "@/assets/Ellipse 1018.png";
import ellipse1019 from "@/assets/Ellipse 1019.png";
import pengumpulanBotolImg from "@/assets/pengumpulan botol.jpg";

const DOCS_DOWNLOAD_URL =
  "https://docs.google.com/document/d/18yU8fCGAkxncCFk2ZmjaUSbBzha36vIV/edit?usp=sharing&ouid=117657960671750314297&rtpof=true&sd=true";

export default function VerifyWarungPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    address:
      "Kampus Desa Ciberry, JL. Haji Bening, RT.01 / RW.09, Kel. Samanada, Kec. Bandaranama",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit Verifikasi Warung:", { ...formData, file: selectedFile });
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
        <div className="relative w-full md:w-[500px] min-h-[380px] md:min-h-[765px] bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          
          {/* Background Image */}
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
          <div className="relative z-10 mt-auto pt-12">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-6">
              Kelola Setoran Botol <br />dengan Mudah
            </h2>

            {/* 3 Badge Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Card 1: Data real-time */}
              <div className="bg-white rounded-[14px] p-3 flex flex-col justify-between h-[88px] shadow-sm">
                <div className="w-7 h-7 rounded-full bg-[#E8F6F5] flex items-center justify-center text-[#52C3BF]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-[#52C3BF] text-[11px] leading-tight">Data real-time</span>
              </div>

              {/* Card 2: Terverifikasi */}
              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[88px]">
                <div className="w-7 h-7 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">Terverifikasi</span>
              </div>

              {/* Card 3: Transparan */}
              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[88px]">
                <div className="w-7 h-7 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">Transparan</span>
              </div>

            </div>
          </div>

        </div>


        {/* ================= RIGHT FORM SECTION ================= */}
        <div className="w-full p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          
          <h1 className="text-2xl font-bold text-[#0B424F] mb-6">
            Verifikasi Data
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
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
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#E8F6F5] border border-[#36959B] rounded-[10px] text-sm text-[#0B424F] font-medium focus:outline-none focus:ring-2 focus:ring-[#52C3BF]"
                required
              />
            </div>

            {/* Field 2: Alamat Warung */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-xs font-semibold text-[#0B424F]">
                Alamat Warung
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F5F5F5] border border-transparent rounded-[10px] text-sm text-[#0B424F] leading-relaxed focus:outline-none focus:bg-white focus:border-[#52C3BF] transition-all resize-none"
                required
              />
            </div>

            {/* Field 3: Berkas Bukti (Upload / Drag & Drop Area) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#0B424F]">
                  Berkas Bukti
                </label>
                
                {/* Tombol Unduh Berkas yang mengarah ke Google Docs */}
                <a
                  href={DOCS_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#52C3BF] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Unduh Berkas
                </a>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full h-32 p-4 bg-[#E8F6F5] border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                  isDragging ? "border-[#52C3BF] bg-[#d3f4f1]" : "border-[#36959B]"
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <div className="px-4 py-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8] text-[#36959B] text-xs font-bold rounded-[5px] flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </div>

                <p className="text-xs text-[#71717A] font-normal leading-tight max-w-[220px]">
                  {selectedFile ? (
                    <span className="font-semibold text-[#0B424F]">{selectedFile.name}</span>
                  ) : (
                    "Choose a file or drag & drop it here"
                  )}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-[#52C3BF] hover:bg-teal-400 text-white font-bold text-sm rounded-[10px] transition-colors shadow-sm"
            >
              Registrasi
            </button>

          </form>

          {/* Footer Text: Login Redirect */}
          <div className="text-center mt-5 text-xs text-[#0B424F]">
            Sudah punya akun?{" "}
            <Link
              href="/warung/login"
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