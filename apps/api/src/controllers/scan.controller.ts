import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const verifyBottleScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, material, depositValue } = req.body;
    if (!qrId || !material || depositValue === undefined) {
      res.status(400).json({ success: false, message: 'Payload tidak lengkap' });
      return;
    }

    const parsedDeposit = Number(depositValue);
    if (isNaN(parsedDeposit) || parsedDeposit <= 0) {
      res.status(400).json({ success: false, message: 'depositValue harus angka positif' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { qrId } });
      if (!user) throw new Error(`USER_NOT_FOUND:${qrId}`);

      const updatedUser = await tx.user.update({
        where: { qrId },
        data: { balance: { increment: parsedDeposit } },
      });

      const scanRecord = await tx.scanLog.create({
        data: {
          userId: user.id,
          material: String(material).trim(),
          depositValue: parsedDeposit,
        },
      });

      return { updatedUser, scanRecord };
    });

    res.status(201).json({
      success: true,
      message: 'Botol berhasil diverifikasi dan saldo telah ditambahkan.',
      data: {
        qrId: result.updatedUser.qrId,
        userName: result.updatedUser.name,
        newBalance: result.updatedUser.balance,
        creditedAmount: parsedDeposit,
        material: result.scanRecord.material,
        scanId: result.scanRecord.id,
        timestamp: result.scanRecord.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('USER_NOT_FOUND:')) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Gagal memproses verifikasi botol',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
