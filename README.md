# 🌿 PANTRA — Digital Pant System
> **Zero-Hardware, AI-Driven Decentralized Deposit-Refund System (DRS) for Urban Circular Economy**  
> *Karya Tim **CigarTim** — Web Development Competition ITechno Cup 2026*

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Bun Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat&logo=bun)](https://bun.sh/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/Types-Strict%20TypeScript-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

---

## 📌 1. Latar Belakang & Tujuan
Tingkat daur ulang sampah botol plastik di wilayah perkotaan Indonesia masih terhambat oleh minimnya insentif langsung bagi masyarakat dan mahalnya infrastruktur konvensional. Mesin *Reverse Vending Machine* (RVM) fisik membutuhkan biaya pengadaan puluhan hingga ratusan juta rupiah per unit serta perawatan berkala yang rumit.

**PANTRA (Digital Pant System)** hadir sebagai solusi *Zero-Hardware DRS* yang mendesentralisasi titik penukaran botol ke warung kelontong lokal (UMKM):
1. **Pemberdayaan Warung:** Menjadikan warung lokal sebagai titik kumpul botol (*collection hub*) terdekat di pemukiman warga.
2. **Edge AI Scanner:** Memanfaatkan webcam laptop atau kamera smartphone pemilik warung untuk memvalidasi kelayakan botol tanpa mesin RVM fisik.
3. **Insentif Saldo Instan:** Memberikan saldo deposit digital langsung per botol ke e-wallet warga untuk dibelanjakan kembali di warung mitra.

---

## 🎯 2. Dampak Terhadap Target SDGs
* **🟢 SDG 8 (Pekerjaan Layak & Pertumbuhan Ekonomi):** Menciptakan perputaran ekonomi sirkular tingkat mikro melalui komisi warung mitra dan insentif tunai harian bagi warga.
* **🟢 SDG 11 (Kota & Komunitas Berkelanjutan):** Menekan timbulan sampah plastik sekali pakai langsung dari pemukiman warga sebelum masuk ke TPA perkotaan.

---

## ⚡ 3. Fitur Utama
* 🔍 **Dual AI Agents:**
  * **Edge Computer Vision:** Deteksi dan klasifikasi jenis material botol (PLASTIC_PET / CAN) otomatis via kamera browser.
  * **Context-Aware PANTRA Assistant:** Asisten interaktif berbasis LLM yang terintegrasi langsung dengan database profil dan riwayat saldo pengguna.
* 🛡️ **Atomic Financial Transactions:** Penambahan saldo deposit dan pencatatan riwayat setoran dijamin aman dan konsisten tanpa risiko *race condition*.
* 🏪 **Dual-Role Experience:** Antarmuka responsif terpisah untuk **Warga** (kartu identitas QR, dashboard tabungan) dan **Warung** (scanner verifikasi setoran).
* 📊 **Live Impact Analytics:** Agregasi data publik secara real-time yang mencatat metrik total botol terkumpul, total dana tersalurkan, dan mitra aktif.

---

## 🛠️ 4. Teknologi yang Digunakan
Sistem dibangun di atas arsitektur **Monorepo Workspace (Bun Workspaces)** untuk efisiensi kolaborasi dan konsistensi kontrak data:

```text
digital-pant-system/
├── apps/
│   ├── web/               # Next.js 15 App Router, Tailwind CSS, TypeScript (Frontend Client)
│   ├── api/               # Express.js, Prisma Client, Bun Runtime (RESTful API Engine)
│   ├── ml/                # Machine Learning & Computer Vision (Model Training & Weights)
│   └── ai/                # Generative AI Agents & Knowledge Engine
└── packages/
    └── shared-types/      # Single Source of Truth TypeScript interfaces & API contracts
```

* **Frontend:** Next.js 15, React, Tailwind CSS, TypeScript
* **Backend:** Express.js, Bun Runtime, TypeScript
* **Database & ORM:** Supabase (PostgreSQL), Prisma ORM
* **Shared Types:** Paket lokal `@digital-pant/shared-types`

---

## 🔌 5. Kontrak API Utama (API Endpoints)
* `GET /api/user/:qrId` — Mengambil data profil, role, dan saldo user terkini.
* `POST /api/scan/verify` — Memvalidasi transaksi setoran botol dan menambah saldo secara *atomic*.
* `POST /api/assistant/chat` — Endpoint asisten virtual berbasis AI dengan injeksi data saldo pengguna.
* `GET /api/analytics/impact` — Mengambil agregat statistik total botol, dana tersalurkan, dan warung aktif.

---

## ⚙️ 6. Cara Instalasi (Set-up Aplikasi)

### Prasyarat Sistem
* [Bun](https://bun.sh/) (v1.1+) atau Node.js (v20+)
* Akun PostgreSQL / Supabase aktif
* Git

### Langkah Instalasi
1. Kloning repositori dan install dependensi:
```bash
git clone [https://github.com/Khalidd88/digital-pant-system.git](https://github.com/Khalidd88/digital-pant-system.git)
cd digital-pant-system
bun install
```

2. Konfigurasi Environment Variable (`apps/api/.env`):
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

3. Sinkronisasi skema database dan jalankan seeder:
```bash
cd apps/api
bunx prisma db push
bun run prisma/seed.ts
cd ../..
```

---

## 🚀 7. Cara Penggunaan (Menjalankan Aplikasi)
Jalankan seluruh modul aplikasi monorepo dari root directory:

```bash
bun run dev
```

* **Frontend Web:** Buka di browser `http://localhost:3000`
* **Backend API Health Check:** Akses `http://localhost:4000/`

---

## 🧪 8. Akun Demo Pengujian (Testing Credentials)
Untuk menguji alur aplikasi secara langsung, gunakan data akun yang sudah tersedia:

| Role | Nama Pengguna | QR Identifier | Saldo Awal | Fungsi Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| **Warga** | Budi Santoso | `USR-8921` | Rp12.500 | Dashboard tabungan & simulasi setoran |
| **Warung** | Warung Bu Tejo | `WRG-0001` | - | Verifikator penerimaan botol warga |

---

## 👥 9. Tim Pengembang (CigarTim)
* **Khalid** — Team Lead & Backend Architect (API Engine, Database Schema, Monorepo Setup)
* **Rapli** — Frontend & UI/UX Engineer (Next.js 15, Responsive Design, Component Layout)
* **Rehan** — AI & Machine Learning Engineer (Computer Vision Classifier, Assistant Agent)
