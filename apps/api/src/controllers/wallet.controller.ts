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

    // Gunakan (prisma as any) agar TypeScript tidak mengunci compiler jika model bernama walletTransaction / walletTransactions
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
  } catch (error: unknown) {
    console.error('Wallet Withdraw Error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses penarikan saldo.',
      error: errMessage
    });
  }
};

export const topupWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, amount, channel } = req.body;

    const numericAmount = Number(amount);
    if (!qrId || isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'QR ID dan nominal top-up valid wajib diisi.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { qrId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Pengguna/Warung dengan ID tersebut tidak ditemukan.',
      });
      return;
    }

    // Tambah saldo user & catat mutasi di walletTransactions
    const updatedUser = await prisma.user.update({
      where: { qrId },
      data: {
        balance: { increment: numericAmount },
        walletTransactions: {
          create: {
            amount: numericAmount,
            channel: channel || 'DEMO_QRIS',
            description: `Top Up Saldo Kasir Warung (Simulasi Demo)`,
            destinationNumber: 'KASIR_WARUNG',
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Top up kasir sebesar Rp${numericAmount.toLocaleString('id-ID')} berhasil diverifikasi!`,
      data: {
        warungId: updatedUser.qrId,
        topupAmount: numericAmount,
        newBalance: updatedUser.balance,
        channel: channel || 'DEMO_QRIS',
      },
    });
  } catch (error: unknown) {
    console.error('Topup Error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses top up.',
      error: errMessage,
    });
  }
};