# 🌿 PANTRA — Digital Pant System
> **Zero-Hardware, AI-Driven Decentralized Deposit-Refund System (DRS) for Urban Circular Economy**  
> *Karya Tim **CigarTim** — Web Development Competition ITechno Cup 2026*

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-indigo?style=flat-square&logo=prisma)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 📌 1. Latar Belakang & Masalah

Indonesia menghasilkan jutaan ton sampah plastik tiap tahun. Sebagian besar botol PET dan kaleng bernilai ekonomis tetap berakhir di TPA karena **tidak adanya insentif langsung yang praktis bagi warga** untuk memilah dan menyetorkannya kembali.

Solusi konvensional global berupa *Reverse Vending Machine* (RVM) fisik memang efektif, tetapi menghadapi kendala implementasi masif di Indonesia akibat tingginya biaya modal dan pemeliharaan:

| Parameter | 🏭 RVM Fisik Konvensional | 🌿 PANTRA (Zero-Hardware) |
| :--- | :--- | :--- |
| **Biaya per Titik Kumpul** | Puluhan hingga ratusan juta rupiah/unit | **Rp0** — Cukup pakai kamera laptop/HP warung |
| **Waktu Deploy Titik Baru** | Minggu hingga bulan (pengadaan & instalasi) | **Hitungan menit** — Warung tinggal login web |
| **Maintenance** | Teknisi berkala, rawan macet mekanis | Update software OTA, tanpa komponen fisik |
| **Sebaran Lokasi** | Terbatas di mall atau ritel modern besar | **Sepadat warung kelontong** di tiap RT/RW |
| **Skalabilitas** | Linear terhadap modal pengadaan hardware | **Eksponensial** — Cukup onboarding mitra warung baru |

**PANTRA** mendesentralisasi titik penukaran botol ke warung kelontong lokal (UMKM), memanfaatkan **Edge Computer Vision** di peramban untuk memvalidasi botol lewat kamera yang sudah dimiliki pemilik warung — tanpa perlu mesin fisik sama sekali.

---

## 🎯 2. Dampak Terhadap Target SDGs

* **🟢 SDG 8 — Pekerjaan Layak & Pertumbuhan Ekonomi**  
  Menciptakan perputaran ekonomi sirkular tingkat mikro: warung mitra mendapatkan komisi instan dari tiap botol yang diverifikasi, sementara warga memperoleh insentif saldo tabungan secara langsung.
* **🟢 SDG 11 — Kota & Komunitas Berkelanjutan**  
  Menekan timbulan sampah plastik sekali pakai langsung dari sumbernya (tingkat rumah tangga) sebelum terakumulasi ke TPA perkotaan.

---

## 💡 3. Kenapa PANTRA Berbeda

1. **Zero-Hardware, Zero-CAPEX:** Tidak ada mesin RVM fisik yang perlu dibeli, dipasang, atau dirawat oleh mitra manapun.
2. **Memanfaatkan Infrastruktur Eksisting:** Warung kelontong sudah tersebar padat di tiap pemukiman; PANTRA memberdayakan jaringan tersebut tanpa membangun dari nol.
3. **Dual AI Agents:** Sistem menggabungkan **Computer Vision** untuk verifikasi material fisik secara real-time dan **LLM Assistant** yang *context-aware* terhadap data saldo serta riwayat setoran pengguna.
4. **Atomic Financial Transaction by Design:** Setiap penambahan saldo deposit dan komisi warung dijamin konsisten lewat transaksi atomik di level database, mencegah *race condition* dan *double-spending* saat banyak warung bertransaksi bersamaan.

---

## ⚡ 4. Fitur Utama

* 🔍 **Dual AI Agents**
  * **Edge Computer Vision:** Deteksi & klasifikasi jenis material botol (`PLASTIC_PET` / `CAN`) otomatis lewat kamera browser secara real-time tanpa upload file manual.
  * **Context-Aware PANTRA Assistant:** Asisten virtual interaktif berbasis LLM (Gemini API) yang terhubung langsung dengan database profil dan riwayat transaksi untuk menjawab pertanyaan personal pengguna.
* 🛡️ **Atomic Financial Transactions:** Mutasi saldo warga dan pencatatan komisi warung dieksekusi secara atomik dan konsisten (ACID compliant).
* 🏪 **Dual-Role Experience:** Antarmuka terpisah dan terisolasi untuk **Warga** (kartu identitas QR, dashboard tabungan) dan **Mitra Warung** (scanner verifikasi setoran botol).
* 📊 **Live Impact Analytics:** Agregasi statistik publik real-time: total botol terkumpul, total dana tersalurkan, dan jumlah mitra warung aktif.

---

## 🎥 5. Demo & Pratinjau UI

| Dashboard Warga | Scanner Verifikasi Warung | Impact Analytics |
| :---: | :---: | :---: |
| ![Dashboard Warga](https://via.placeholder.com/400x240?text=Dashboard+Warga) | ![Scanner Warung](https://via.placeholder.com/400x240?text=Scanner+Warung) | ![Impact Analytics](https://via.placeholder.com/400x240?text=Impact+Analytics) |

* 🔗 **Live Demo Web:** [pantra-inky.vercel.app](https://pantra-inky.vercel.app) *(Link live deployment)*
* 🔗 **Video Walkthrough:** [Tautan YouTube](https://youtube.com) *(Demo alur pengujian)*

### Akun Demo

Gunakan kredensial berikut untuk mencoba aplikasi pada deployment Vercel:

| Peran | Email | Password |
| :--- | :--- | :--- |
| Warung Mitra | `handuk@example.com` | `12345678` |
| Warga | `sans@example.com` | `12345678` |

### Membuat Akun Baru

Pengguna juga dapat membuat akun baru melalui halaman registrasi pada aplikasi:

* **Warga:** pilih **Daftar Warga Baru** pada halaman login warga.
* **Warung Mitra:** pilih **Daftar dulu** pada halaman login mitra warung, lalu lengkapi proses verifikasi dokumen jika diminta.

Akun baru akan tersimpan pada database dan dapat digunakan untuk login setelah proses registrasi berhasil.

---

## 🏗️ 6. Arsitektur Sistem

### Diagram Alur Transaksi

```mermaid
sequenceDiagram
    autonumber
    actor Warga
    participant WebApp as Web App (Next.js 15)
    actor Warung
    participant CV as Edge AI (Computer Vision)
    participant API as API Engine (Express + Bun)
    participant DB as Supabase (PostgreSQL)

    Warga->>WebApp: Tunjukkan QR Identifier akun
    Warung->>WebApp: Scan QR warga & buka kamera verifikasi botol
    WebApp->>CV: Kirim frame botol untuk klasifikasi material
    CV-->>WebApp: Hasil deteksi (PLASTIC_PET / CAN / INVALID)

    alt Botol Valid
        WebApp->>API: POST /api/scan/verify
        API->>DB: Atomic Transaction: tambah saldo warga + komisi warung
        DB-->>API: Konfirmasi transaksi sukses
        API-->>WebApp: Saldo terupdate & data transaksi valid
        WebApp-->>Warga: Notifikasi saldo berhasil bertambah
    else Botol Tidak Valid
        WebApp-->>Warung: Tolak setoran, minta scan ulang
    end
```

### Struktur Monorepo (Bun Workspaces)

```text
digital-pant-system/
├── apps/
│   ├── web/               # Next.js 15 App Router, Tailwind CSS, TypeScript (Frontend Client)
│   ├── api/               # Express.js, Prisma Client, Bun Runtime (RESTful API Engine)
│   ├── ml/                # Machine Learning & Computer Vision (Model Weights & Inference)
│   └── ai/                # Generative AI Agents & Gemini Knowledge Engine
└── packages/
    └── shared-types/      # Single Source of Truth TypeScript interfaces & API contracts
```

### Tech Stack
* **Frontend:** Next.js 15, React 19, Tailwind CSS, TypeScript
* **Backend:** Express.js, Bun Runtime, TypeScript
* **Database & ORM:** Supabase (PostgreSQL), Prisma ORM
* **AI & Vision:** Edge Computer Vision (TensorFlow.js / ONNX Runtime Web), Google Gemini API
* **Shared Types:** Paket monorepo `@digital-pant/shared-types`

---

## 🔌 7. Kontrak API Utama

### 1. Ambil Profil & Saldo Pengguna
`GET /api/user/:qrId`

```json
{
  "qrId": "USR-8921",
  "name": "Budi Santoso",
  "role": "WARGA",
  "balance": 12500,
  "totalBottlesDeposited": 34
}
```

### 2. Verifikasi Transaksi Setoran (Atomic)
`POST /api/scan/verify`

**Request Body:**
```json
{
  "qrId": "USR-8921",
  "warungId": "WRG-0001",
  "detectedType": "PLASTIC_PET",
  "confidence": 0.94
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "newBalance": 13000,
  "creditedAmount": 500,
  "warungCommission": 50
}
```

### 3. Context-Aware AI Assistant
`POST /api/assistant/chat`

**Request Body:**
```json
{
  "userId": "USR-8921",
  "message": "Udah berapa botol yang gue setor bulan ini?"
}
```

### 4. Metrik Dampak Publik
`GET /api/analytics/impact`

**Response (200 OK):**
```json
{
  "totalBottlesCollected": 18420,
  "totalFundsDistributed": 9210000,
  "activePartners": 27
}
```

---

## 💰 8. Model Bisnis & Keberlanjutan

* **Kemitraan CSR & Sponsor:** Didanai brand FMCG dan pemerintah daerah yang memiliki target kepatuhan *Extended Producer Responsibility* (EPR).
* **Komisi Transaksi Warung:** Bagi hasil dari tiap botol yang divalidasi, memposisikan warung sebagai mitra aktif yang diuntungkan.
* **Data Agregat Sirkular:** Analisis data tren pengumpulan sampah perkotaan yang disajikan secara anonim untuk riset dan perencanaan tata kota.

---

## 🗺️ 9. Roadmap Pengembangan

- [ ] Integrasi payment gateway riil (QRIS) untuk pencairan saldo ke e-wallet.
- [ ] Ekspansi klasifikasi ke kategori sampah lain (kaca, karton, logam campuran).
- [ ] Leaderboard & sistem gamifikasi antar-warung kelontong.
- [ ] Dashboard pemantauan dampak spasial untuk dinas lingkungan hidup.
- [ ] Offline-first mode untuk warung dengan keterbatasan jaringan internet.

---

## ⚙️ 10. Cara Instalasi (Set-up Aplikasi)

### Prasyarat Sistem
* [Bun](https://bun.sh/) (v1.1+) atau Node.js (v20+)
* Akun PostgreSQL / [Supabase](https://supabase.com/) aktif
* Git

### Langkah Instalasi

1. **Clone repositori dan install seluruh dependensi:**
   ```bash
   git clone [https://github.com/Khalidd88/digital-pant-system.git](https://github.com/Khalidd88/digital-pant-system.git)
   cd digital-pant-system
   bun install
   ```

2. **Konfigurasi Environment Variable (`apps/api/.env`):**
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Isi konfigurasi koneksi database Supabase pada `apps/api/.env`:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

3. **Sinkronisasi skema database dan jalankan seeder:**
   ```bash
   cd apps/api
   bunx prisma db push
   bun run prisma/seed.ts
   cd ../..
   ```

---

## 🚀 11. Cara Penggunaan (Menjalankan Aplikasi)

Jalankan seluruh modul aplikasi monorepo dari root directory:

```bash
bun run dev
```

* **Frontend Web Client:** Buka di browser `http://localhost:3000`
* **Backend API Engine:** Akses `http://localhost:4000/`

---

## 🧪 12. Akun Demo Pengujian (Testing Credentials)

Gunakan akun berikut untuk menguji seluruh alur transaksi secara langsung:

| Role Akun | Nama Pengguna | QR Identifier | Saldo Awal | Skenario Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| **Warga** | Budi Santoso | `USR-8921` | Rp12.500 | Menampilkan QR identitas & melihat riwayat saldo tabungan |
| **Mitra Warung** | Warung Bu Tejo | `WRG-0001` | - | Melakukan scan QR warga & verifikasi visual botol |

---

## 👥 13. Tim Pengembang (CigarTim)

* **Khalid** — *Team Lead & Backend Architect*  
  Merancang arsitektur API Engine, skema database, dan setup monorepo Bun Workspaces.
* **Rapli** — *Frontend & UI/UX Engineer*  
  Membangun antarmuka Next.js 15 yang responsif untuk dua role pengguna berbeda.
* **Rehan** — *AI & Machine Learning Engineer*  
  Mengembangkan Computer Vision classifier untuk verifikasi botol dan Assistant Agent berbasis LLM.

---

## 📄 Lisensi

Proyek ini dikembangkan secara khusus untuk keperluan kompetisi **Web Development Competition — ITechno Cup 2026**.
