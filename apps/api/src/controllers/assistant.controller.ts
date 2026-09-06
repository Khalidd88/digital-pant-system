import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const handleAssistantChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Field "message" wajib diisi string.'
      });
      return;
    }

    // 1. Ambil data asli user dari database Supabase
    let userName = 'Warga PANTRA';
    let userBalance = 15000;
    let userContextString = 'Pengguna adalah tamu umum (belum login).';

    if (qrId) {
      try {
        const userData = await prisma.user.findUnique({
          where: { qrId },
          include: {
            scanLogs: { orderBy: { createdAt: 'desc' }, take: 3 }
          }
        });

        if (userData) {
          userName = userData.name;
          userBalance = userData.balance || 0;
          userContextString = `Nama: ${userData.name}, Role: WARGA, QR ID: ${userData.qrId}, Saldo: Rp${Number(userBalance).toLocaleString('id-ID')}`;
        } else {
          // Fallback data warga jika akun belum di-seed di Supabase
          userContextString = `Nama: ${userName}, Role: WARGA, QR ID: ${qrId || 'USR-8821'}, Saldo: Rp${Number(userBalance).toLocaleString('id-ID')}, Total Botol: 12 botol PET`;
        }
      } catch (dbErr) {
        userContextString = `Nama: ${userName}, QR ID: ${qrId}, Saldo: Rp${Number(userBalance).toLocaleString('id-ID')}`;
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      res.status(500).json({ success: false, message: 'GEMINI_API_KEY tidak ditemukan di .env' });
      return;
    }

    // 2. Gunakan endpoint resmi gemini-2.5-flash sesuai instruksi API Google
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;

    const promptText = `Kamu adalah "PANTRA Assistant", AI resmi Digital Pant System (PANTRA) Indonesia.
Sistem PANTRA adalah platform penukaran botol plastik bekas di warung kelontong lokal untuk ekonomi sirkular.

DATA USER AKTIF:
${userContextString}

INSTRUKSI:
1. Sapa user dengan namanya (${userName}) jika dia bertanya apakah kamu kenal dia.
2. Jawab ramah, akrab, dan maksimal 2-3 kalimat berbahasa Indonesia.
3. Botol yang diterima HANYA botol plastik PET (air mineral/jus bening). Botol kaca, kaleng, dan kardus DITOLAK.
4. Saldo bisa dicairkan atau digunakan belanja sembako di Mitra Warung PANTRA.

Pertanyaan User: "${message}"`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const result = (await apiResponse.json()) as any;

    if (result.error) {
      console.error('[GEMINI API ERROR]', result.error);
      res.status(502).json({
        success: false,
        message: `Gemini Error: ${result.error.message}`
      });
      return;
    }

    const parts = result?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p: any) => p.text && !p.thought) || parts.find((p: any) => p.text);
    const replyText = textPart?.text || `Halo ${userName}! Saldo PANTRA kamu saat ini Rp${Number(userBalance).toLocaleString('id-ID')}.`;

    res.status(200).json({
      success: true,
      data: {
        reply: replyText.trim(),
        userContext: userContextString
      },
      reply: replyText.trim()
    });
  } catch (error: any) {
    console.error('Assistant Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error pada AI Assistant',
      error: error?.message || String(error)
    });
  }
};