declare const process: any;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface UserProfile {
  id: string;
  name: string;
  role: 'WARGA' | 'WARUNG';
  qrId: string;
  balance: number;
  createdAt: string;
  scanLogs?: any[];
  walletTransactions?: any[];
}

// 1. Ambil Profil & Saldo Warga
export async function getUserProfile(qrId: string = 'USR-8921'): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/api/user/${qrId}`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal mengambil data user');
  return json.data;
}

// 2. Chat dengan Gemini 3.6 Flash Assistant
export async function askAssistant(qrId: string, message: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrId, message }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'AI gagal merespons');
  return json.data.reply;
}

// 3. Tarik Saldo / Belanja di Warung
export async function withdrawWallet(payload: {
  qrId: string;
  amount: number;
  channel: 'WARUNG' | 'DANA' | 'GOPAY';
  destinationNumber?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal memproses penarikan');
  return json;
}

// 4. Verifikasi Scan Botol (Untuk Rehan & Warung)
export async function verifyScanBottle(payload: {
  userQrId: string;
  material: string;
  bottleCount: number;
  warungId?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/scan/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal memverifikasi botol');
  return json;
}