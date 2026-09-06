import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const handleAssistantChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrId, message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Field "message" wajib diisi dalam bentuk string.'
      });
      return;
    }

    // 1. Ambil data asli user dari database Supabase
    let userData = null;
    let userContextString = 'Pengguna adalah tamu umum (belum login).';

    if (qrId) {
      userData = await prisma.user.findUnique({
        where: { qrId },
        include: {
          scanLogs: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      });

      if (userData) {
        userContextString = `Nama: ${userData.name}, Role: ${userData.role}, QR ID: ${userData.qrId}, Saldo: Rp${userData.balance.toLocaleString('id-ID')}`;
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 2. Smart Mock Mode (jika API key belum ada)
    if (!geminiApiKey || geminiApiKey.includes('your-gemini')) {
      let replyMock = 'Halo! Saya PANTRA Assistant. Ada yang bisa dibantu seputar daur ulang botol?';
      const msgLower = message.toLowerCase();

      if (msgLower.includes('saldo') || msgLower.includes('uang') || msgLower.includes('tabungan')) {
        replyMock = userData
          ? `Halo ${userData.name}! Saldo PANTRA kamu saat ini adalah Rp${userData.balance.toLocaleString('id-ID')}. Bisa dibelanjakan di Warung Bu Tejo atau ditarik ke e-wallet.`
          : 'Kamu belum menghubungkan akun warga (QR ID tidak terdeteksi).';
      }

      res.status(200).json({
        success: true,
        data: { reply: replyMock, userContext: userContextString, engine: 'smart-mock-agent' }
      });
      return;
    }

    // Ganti ke gemini-3.6-flash sesuai rekomendasi resmi Google:
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;

    const promptText = `Kamu adalah "PANTRA Assistant", AI ramah dari Digital Pant System (PANTRA) Indonesia.
PANTRA adalah sistem insentif pengembalian botol plastik bekas di warung kelontong lokal untuk ekonomi sirkular dan UMKM.

Konteks Pengguna Saat Ini:
${userContextString}

Aturan Menjawab:
1. Jawab dengan ramah, akrab, dan padat (maksimal 2-3 kalimat).
2. Jika ditanya siapa kamu dan apakah kenal dia: perkenalkan dirimu sebagai asisten PANTRA dan sapa dia dengan nama pengguna sesuai data konteks di atas.
3. Sebutkan saldo dan kegunaannya jika relevan.

Pertanyaan Pengguna: "${message}"`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const result = (await apiResponse.json()) as any;

    if (result.error) {
      console.error('Gemini API Error Detail:', JSON.stringify(result.error, null, 2));
    }

    // Ekstraksi teks yang aman untuk format respons Gemini 2.5
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p: any) => p.text && !p.thought) || parts.find((p: any) => p.text);
    const generatedText = textPart?.text;

    const replyText =
      generatedText ||
      (userData
        ? `Halo ${userData.name}! Saya asisten PANTRA. Saldo PANTRA kamu saat ini Rp${userData.balance.toLocaleString('id-ID')}. Ada yang bisa saya bantu?`
        : 'Halo! Saya PANTRA Assistant. Ada yang bisa dibantu?');

    res.status(200).json({
      success: true,
      data: {
        reply: replyText.trim(),
        userContext: userContextString,
        engine: 'gemini-3.6-flash'
      }
    });
  } catch (error: any) {
    console.error('Assistant Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pesan asisten.',
      error: error?.message || String(error)
    });
  }
};