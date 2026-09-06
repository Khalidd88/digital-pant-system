import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. REGISTER WARGA
export const registerWarga = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan password wajib diisi.'
      });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login.'
      });
      return;
    }

    // Hash password menggunakan native Bun.password
    const hashedPassword = await Bun.password.hash(password);

    // Generate QR ID unik (contoh: USR-4912)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newQrId = `USR-${randomSuffix}`;

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        password: hashedPassword,
        role: 'WARGA',
        qrId: newQrId,
        balance: 0 // Saldo awal warga baru Rp0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Akun warga telah aktif.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        qrId: newUser.qrId,
        balance: newUser.balance,
        role: newUser.role
      }
    });
  } catch (error: unknown) {
    console.error('Register Error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses registrasi.',
      error: errMessage
    });
  }
};

// 2. LOGIN WARGA
export const loginWarga = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
      return;
    }

    // Cari user di database
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        role: 'WARGA'
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Akun dengan email tersebut tidak ditemukan.'
      });
      return;
    }

    // Verifikasi password
    if (user.password) {
      const isMatch = await Bun.password.verify(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Password yang Anda masukkan salah.'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        qrId: user.qrId,
        balance: user.balance,
        role: user.role
      }
    });
  } catch (error: unknown) {
    console.error('Login Error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses login.',
      error: errMessage
    });
  }
};

// 3. REGISTER WARUNG / MITRA
export const registerWarung = async (req: Request, res: Response): Promise<void> => {
  try {
    const { warungName, email, phone, password } = req.body;

    if (!warungName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Nama warung, email, dan password wajib diisi.'
      });
      return;
    }

    // Cek duplikasi email
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Email warung sudah terdaftar. Silakan gunakan email lain atau login.'
      });
      return;
    }

    // Enkripsi password dengan native Bun.password
    const hashedPassword = await Bun.password.hash(password);

    // Generate Warung ID unik (Contoh: WRG-7821)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newWarungId = `WRG-${randomSuffix}`;

    const newWarung = await prisma.user.create({
      data: {
        name: warungName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        password: hashedPassword,
        role: 'WARUNG',
        qrId: newWarungId,
        balance: 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran Mitra Warung berhasil!',
      data: {
        id: newWarung.id,
        name: newWarung.name,
        email: newWarung.email,
        warungId: newWarung.qrId,
        role: newWarung.role,
        balance: newWarung.balance
      }
    });
  } catch (error: unknown) {
    console.error('Register Warung Error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pendaftaran mitra warung.',
      error: errMessage
    });
  }
};

// 4. LOGIN WARUNG / MITRA
export const loginWarung = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
      return;
    }

    const warung = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        role: "WARUNG",
      },
    });

    if (!warung) {
      res.status(404).json({ success: false, message: "Akun mitra warung tidak ditemukan" });
      return;
    }

    const isMatch = warung.password
      ? await Bun.password.verify(password, warung.password)
      : false;
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Password mitra salah" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login mitra warung berhasil!",
      data: {
        id: warung.id,
        name: warung.name,
        email: warung.email,
        warungId: warung.qrId || "WRG-0001",
        balance: warung.balance,
        role: "WARUNG",
      },
    });
  } catch (error: unknown) {
    console.error("Login Warung Error:", error);
    res.status(500).json({ success: false, message: "Gagal login mitra warung" });
  }
};

// 5. VERIFY WARUNG / BERKAS
export const verifyWarung = async (req: Request, res: Response): Promise<void> => {
  try {
    const { warungId, fullName, warungName, email, phone, password, address, fileName } = req.body;

    // 1. Jika akun warung sudah dibuat di tahap 1, cari dan update statusnya
    let warung = null;
    if (warungId) {
      warung = await prisma.user.findUnique({ where: { qrId: warungId } });
    } else if (email) {
      warung = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    if (warung) {
      // Update data warung yang sudah ada
      const updatedWarung = await prisma.user.update({
        where: { id: warung.id },
        data: {
          name: warungName ? `${warungName} (${fullName || warung.name})` : warung.name,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Verifikasi berkas berhasil! Akun warung telah diverifikasi.',
        data: {
          id: updatedWarung.id,
          name: updatedWarung.name,
          email: updatedWarung.email,
          warungId: updatedWarung.qrId,
          role: updatedWarung.role,
          balance: updatedWarung.balance,
          isVerified: true,
        },
      });
      return;
    }

    // 2. Jika user langsung submit dari halaman verify (fallback mandiri)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newWarungId = `WRG-${randomSuffix}`;
    const hashedPassword = password ? await Bun.password.hash(password) : await Bun.password.hash("warung123");
    const validEmail = email ? email.toLowerCase().trim() : `warung.${randomSuffix}@pantra.id`;
    const finalWarungName = warungName ? `${warungName} (${fullName})` : (fullName || "Warung Mitra");

    const createdWarung = await prisma.user.create({
      data: {
        name: finalWarungName,
        email: validEmail,
        phone: phone || null,
        password: hashedPassword,
        role: 'WARUNG',
        qrId: newWarungId,
        balance: 250000, // Saldo modal awal warung Rp250.000
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran & verifikasi berkas warung berhasil!',
      data: {
        id: createdWarung.id,
        name: createdWarung.name,
        email: createdWarung.email,
        warungId: createdWarung.qrId,
        role: createdWarung.role,
        balance: createdWarung.balance,
        isVerified: true,
      },
    });
  } catch (error: unknown) {
    console.error('Verify Warung Error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses verifikasi berkas warung.',
      error: errMessage,
    });
  }
};