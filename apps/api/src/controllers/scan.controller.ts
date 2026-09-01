import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const verifyBottleScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, userQrId, material, depositValue } = req.body;
    const targetQrId = qrId || userQrId;

    if (!targetQrId || !material) {
      res.status(400).json({
        success: false,
        message: 'Payload tidak lengkap: qrId dan material wajib diisi'
      });
      return;
    }

    const depositAmount =
      depositValue !== undefined
        ? Number(depositValue)
        : material === 'PLASTIC_PET'
        ? 500
        : 600;

    // 1. Cari user
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

    // 2. Eksekusi transaksi
    const [scanLog, updatedUser] = await prisma.$transaction([
      prisma.scanLog.create({
        data: {
          userId: user.id,
          material: String(material).trim(),
          depositValue: depositAmount
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: depositAmount
          }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Verifikasi botol berhasil, saldo bertambah!',
      data: {
        scanId: scanLog.id,
        user: {
          name: updatedUser.name,
          qrId: updatedUser.qrId,
          previousBalance: user.balance,
          newBalance: updatedUser.balance,
          addedBalance: depositAmount
        },
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