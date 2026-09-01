# 🌿 Digital Pant System (PANTRA)
> **AI-Powered Decentralized Deposit-Refund System (DRS) for Urban Circular Economy**  
> *Developed by **CigarTim** (Khalid, Rehan, Rapli) — Entry for ITechno Cup 2026*

---

## 📌 Problem & Innovation
Mesin *Reverse Vending Machine* (RVM) konvensional berbiaya mahal. **Digital Pant System** hadir dengan pendekatan **Zero-Hardware**:
1. **AI In-Browser:** Kamera laptop/HP Warung UMKM memvalidasi botol via model AI.
2. **Warung Hub:** Titik pengumpulan sampah plastik & kaleng berbasis komunitas.
3. **Waste-to-Cash:** Insentif saldo instan per botol bagi warga.

---

## 🎯 Dampak SDG
* **🟢 SDG 8 (Decent Work & Economic Growth):** Tambahan komisi bagi Warung UMKM & pendapatan mikro warga.
* **🟢 SDG 11 (Sustainable Cities & Communities):** Pengurangan sampah plastik perkotaan langsung dari sumbernya.

---

## 👥 Tim Pengembang (CigarTim)
* **Khalid:** Lead Developer & Backend Integration (Express, PostgreSQL, Prisma).
* **Rapli:** UI/UX & Frontend Engineer (Next.js 15, Tailwind CSS, shadcn/ui).
* **Rehan:** AI & Computer Vision Engineer (In-Browser Bottle Scanner).

---

## 🔌 API Contract Reference
* `GET /api/user/:qrId` — Ambil data profil, role, dan saldo user.
* `POST /api/scan/verify` — Validasi setoran botol dan kredit saldo user.
* `GET /api/analytics/impact` — Agregasi metrik publik (*bottles, disbursed, partners*).
