import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const verifyBottleScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, userQrId, material, depositValue, bottleCount } = req.body;
    const targetQrId = qrId || userQrId;

    if (!targetQrId || !material) {
      res.status(400).json({
        success: false,
        message: 'Payload tidak lengkap: qrId dan material wajib diisi'
      });
      return;
    }

    // 1. Hitung jumlah botol (default 1 jika tidak dikirim)
    const count = Math.max(1, parseInt(String(bottleCount || 1), 10));

    // 2. Standarisasi tarif botol (Rp500 / botol untuk PET)
    const matUpper = String(material).trim().toUpperCase();
    const ratePerBottle =
      depositValue !== undefined
        ? Number(depositValue)
        : (matUpper.includes('PET') || matUpper.includes('PLASTIC') ? 500 : 500);

    const totalDeposit = ratePerBottle * count;

    // 3. Cari user warga
    const user = await prisma.user.findUnique({
      where: { qrId: targetQrId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User dengan QR ID ${targetQrId} tidak ditemukan`
      });
      return;
    }

    // 4. Eksekusi atomic transaction: Simpan scan log + tambah saldo warga
    const [scanLog, updatedUser] = await prisma.$transaction([
      prisma.scanLog.create({
        data: {
          userId: user.id,
          material: matUpper,
          depositValue: totalDeposit
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: totalDeposit
          }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: `Verifikasi ${count} botol berhasil, saldo bertambah Rp${totalDeposit.toLocaleString('id-ID')}!`,
      data: {
        scanId: scanLog.id,
        user: {
          name: updatedUser.name,
          qrId: updatedUser.qrId,
          previousBalance: user.balance,
          newBalance: updatedUser.balance,
          addedBalance: totalDeposit
        },
        bottleCount: count,
        ratePerBottle: ratePerBottle,
        material: scanLog.material,
        timestamp: scanLog.createdAt
      }
    });
  } catch (error: any) {
    console.error('Scan verify error details:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses transaksi scan',
      error: error?.message || String(error)
    });
  }
};

export const verifyScan = verifyBottleScan;