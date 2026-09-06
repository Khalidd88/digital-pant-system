import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const handleWithdraw = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, amount, channel, destinationNumber } = req.body;

    // 1. Validasi input
    if (!qrId || !amount || !channel) {
      res.status(400).json({
        success: false,
        message: 'Field "qrId", "amount", dan "channel" wajib diisi.'
      });
      return;
    }

    const withdrawAmount = parseInt(String(amount), 10);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Nominal "amount" harus berupa angka positif.'
      });
      return;
    }

    // 2. Ambil user warga
    const user = await prisma.user.findUnique({
      where: { qrId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `Warga dengan QR ID ${qrId} tidak ditemukan.`
      });
      return;
    }

    // 3. Validasi kecukupan saldo
    if (user.balance < withdrawAmount) {
      res.status(400).json({
        success: false,
        message: `Saldo tidak mencukupi. Saldo saat ini: Rp${user.balance.toLocaleString('id-ID')}, nominal penarikan: Rp${withdrawAmount.toLocaleString('id-ID')}.`
      });
      return;
    }

    const cleanChannel = String(channel).trim().toUpperCase();
    const desc =
      cleanChannel === 'WARUNG'
        ? 'Belanja sembako di Warung Bu Tejo'
        : `Tarik tunai ke ${cleanChannel} (${destinationNumber || 'Akun Utama'})`;

   // Gunakan (prisma as any) agar TypeScript tidak mengunci compiler
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { qrId },
        data: {
          balance: {
            decrement: withdrawAmount
          }
        }
      }),
      (prisma as any).walletTransaction.create({
        data: {
          userId: user.id,
          amount: withdrawAmount,
          channel: cleanChannel,
          destinationNumber: destinationNumber ? String(destinationNumber) : null,
          description: desc
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: `Berhasil! ${desc} sebesar Rp${withdrawAmount.toLocaleString('id-ID')} sukses diproses.`,
      data: {
        transactionId: transaction.id,
        qrId: updatedUser.qrId,
        userName: updatedUser.name,
        amountDeducted: withdrawAmount,
        channel: transaction.channel,
        remainingBalance: updatedUser.balance,
        createdAt: transaction.createdAt
      }
    });
  } catch (error: any) {
    console.error('Wallet Withdraw Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses penarikan saldo.',
      error: error?.message || String(error)
    });
  }
};