import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getUserByQrId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId } = req.params;
    if (!qrId) {
      res.status(400).json({ success: false, message: 'qrId wajib disertakan' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { qrId: String(qrId) },
      select: { id: true, name: true, role: true, qrId: true, balance: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: `User dengan qrId '${qrId}' tidak ditemukan` });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getImpactAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalBottles, depositAggregation, activePartners] = await Promise.all([
      prisma.scanLog.count(),
      prisma.scanLog.aggregate({ _sum: { depositValue: true } }),
      prisma.user.count({ where: { role: 'WARUNG' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBottles,
        totalDisbursed: depositAggregation._sum.depositValue ?? 0,
        activePartners,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil analitik dampak',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
