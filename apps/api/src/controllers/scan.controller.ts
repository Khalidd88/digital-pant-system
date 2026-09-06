import type { Request, Response as ExpressResponse } from "express";
import { spawn } from "bun";
import path from "path";
import fs from "fs";

// Cari path executable python secara dinamis tanpa bikin server crash
function resolvePythonBinary(): string {
  const possiblePaths = [
    process.env.PYTHON_PATH,
    '/app/venv/bin/python',
    '/app/venv/bin/python3',
    '/usr/bin/python3',
    path.join(process.cwd(), 'src/ml/venv/bin/python'),
    path.join(__dirname, '../ml/venv/bin/python'),
    'python3',
  ].filter(Boolean) as string[];

  for (const p of possiblePaths) {
    if (p === 'python3' || fs.existsSync(p)) {
      console.log(`[ML] Menggunakan Python runtime di: ${p}`);
      return p;
    }
  }

  console.warn('[ML WARNING] Python venv tidak ditemukan, menggunakan fallback runner.');
  return 'python3';
}

const PYTHON_BIN = resolvePythonBinary();

export const detectBottleQuality = async (req: Request, res: ExpressResponse): Promise<void> => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, message: "Frame kamera (base64) wajib dikirim" });
      return;
    }

    // 1. Simpan frame gambar sementara
    const tempDir = path.resolve(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `scan-${Date.now()}.jpg`);
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(tempFilePath, Buffer.from(cleanBase64, "base64"));

    // 2. Path eksekusi script predict.py
    const scriptPath = path.resolve(__dirname, "../ml/predict.py");

    if (!fs.existsSync(scriptPath)) {
      console.error("❌ predict.py tidak ditemukan di:", scriptPath);
      res.status(500).json({ success: false, message: `predict.py tidak ditemukan: ${scriptPath}` });
      return;
    }

    // 3. Eksekusi proses Python menggunakan PYTHON_BIN hasil deteksi dinamis
    const proc = spawn([PYTHON_BIN, scriptPath, tempFilePath], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    await proc.exited;

    // Bersihkan file sementara
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    if (stderr && stderr.trim()) {
      console.warn("⚠️ Python stderr:", stderr.trim());
    }

    // 4. Ekstrak baris JSON murni (mengabaikan banner/log Ultralytics)
    const lines = stdout.trim().split("\n");
    let parsedResult = null;

    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const potentialJson = lines[i].trim();
        if (potentialJson.startsWith("{") && potentialJson.endsWith("}")) {
          parsedResult = JSON.parse(potentialJson);
          break;
        }
      } catch {
        // Lewati jika bukan baris JSON
      }
    }

    if (!parsedResult) {
      console.error("❌ Output stdout tidak berisi JSON valid:\n", stdout);
      res.status(500).json({ success: false, message: "Output Python bukan format JSON", raw: stdout });
      return;
    }

    console.log("✅ Deteksi Sukses:", parsedResult);
    res.status(200).json(parsedResult);
  } catch (error: any) {
    console.error("❌ Controller Error:", error);
    res.status(500).json({ success: false, message: error.message || "Gagal memproses YOLO" });
  }
};