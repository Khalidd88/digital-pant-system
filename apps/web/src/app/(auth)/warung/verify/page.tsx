"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload,
  Activity,
  CheckCircle2,
  Heart,
  FileText,
  AlertCircle,
  RefreshCw,
  FileCheck
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
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    address:
      "Kampus Desa Ciberry, JL. Haji Bening, RT.01 / RW.09, Kel. Samanada, Kec. Bandaranama",
  });

  // State data registrasi tahap 1
  const [tempRegData, setTempRegData] = useState<any>(null);

  // Ambil data draft dari tahap 1 jika ada
  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("pantra_temp_warung_reg");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setTempRegData(parsed);
          if (parsed.fullName) {
            setFormData((prev) => ({ ...prev, fullName: parsed.fullName }));
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage("");
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
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Nama penanggung jawab warung wajib diisi.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Mohon lampirkan berkas bukti dokumen kemitraan warung.");
      return;
    }

    setLoading(true);
    try {
      // Gabungkan data registrasi tahap 1 dan berkas verifikasi
      const payload = {
        fullName: formData.fullName,
        warungName: tempRegData?.warungName || "Warung Mitra",
        email: tempRegData?.email || "",
        phone: tempRegData?.phone || "",
        password: tempRegData?.password || "",
        address: formData.address,
        fileName: selectedFile.name,
      };

      const res = await fetch("http://localhost:4000/api/auth/warung/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses verifikasi warung.");
      }

      // Simpan session mitra warung yang sudah diverifikasi
      if (typeof window !== "undefined") {
        localStorage.setItem("pantra_user_role", "WARUNG");
        localStorage.setItem("pantra_warung_id", json.data.warungId);
        localStorage.setItem("pantra_warung_name", json.data.name);
        localStorage.setItem("pantra_warung_user", JSON.stringify(json.data));
        localStorage.removeItem("pantra_temp_warung_reg"); // Bersihkan draft
      }

      // Arahkan langsung ke dashboard warung
      router.push("/warung/dashboard");
    } catch (err: any) {
      console.error("Verify Warung Error:", err);
      setErrorMessage(err.message || "Terjadi gangguan koneksi ke server backend.");
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
        <div className="relative w-full md:w-[500px] min-h-[380px] md:min-h-[765px] bg-[linear-gradient(180deg,#165463_0%,#0B424F_100%)] p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          
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

          <div className="relative z-10 mt-auto pt-12">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-6">
              Kelola Setoran Botol <br />dengan Mudah
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white rounded-[14px] p-3 flex flex-col justify-between h-[88px] shadow-sm">
                <div className="w-7 h-7 rounded-full bg-[#E8F6F5] flex items-center justify-center text-[#52C3BF]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-[#52C3BF] text-[11px] leading-tight">Data real-time</span>
              </div>

              <div className="bg-[#165463]/70 backdrop-blur-md border border-[#52C3BF] rounded-[14px] p-3 flex flex-col justify-between h-[88px]">
                <div className="w-7 h-7 rounded-full bg-[#52C3BF]/20 flex items-center justify-center text-[#52C3BF]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">Terverifikasi</span>
              </div>

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
          
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl font-bold text-[#0B424F]">
              Verifikasi Data Mitra
            </h1>
            <p className="text-xs text-[#36959B]">
              Tahap akhir validasi lokasi warung dan dokumen kemitraan resmi PANTRA
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Field 1: Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-[#0B424F]">
                Nama Penanggung Jawab
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nama pemilik / pengelola warung"
                className="w-full px-3.5 py-2.5 bg-[#E8F6F5] border border-[#36959B] rounded-[10px] text-sm text-[#0B424F] font-medium focus:outline-none focus:ring-2 focus:ring-[#52C3BF]"
                required
              />
            </div>

            {/* Field 2: Alamat Warung */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-xs font-semibold text-[#0B424F]">
                Alamat Fisik Warung
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
                  Berkas Bukti Dokumen
                </label>
                
                <a
                  href={DOCS_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#52C3BF] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Unduh Berkas Contoh
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
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <div className="px-4 py-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8] text-[#36959B] text-xs font-bold rounded-[5px] flex items-center gap-1.5 transition-colors">
                  {selectedFile ? <FileCheck className="w-3.5 h-3.5 text-teal-700" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{selectedFile ? "Ganti Berkas" : "Upload Dokumen"}</span>
                </div>

                <p className="text-xs text-[#71717A] font-normal leading-tight max-w-[240px] truncate">
                  {selectedFile ? (
                    <span className="font-bold text-[#0B424F]">{selectedFile.name}</span>
                  ) : (
                    "Pilih dokumen atau seret ke area ini"
                  )}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#52C3BF] hover:bg-teal-400 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-[10px] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan &amp; Memverifikasi Warung di DB...</span>
                </>
              ) : (
                <span>Selesaikan Verifikasi &amp; Masuk Dashboard</span>
              )}
            </button>

          </form>

          {/* Footer Text: Login Redirect */}
          <div className="text-center mt-5 text-xs text-[#0B424F]">
            Sudah terdaftar?{" "}
            <Link
              href="/warung/login"
              className="font-bold hover:underline text-[#0B424F]"
            >
              Login di sini
            </Link>
          </div>

        </div>

      </main>

    </div>
  );
}