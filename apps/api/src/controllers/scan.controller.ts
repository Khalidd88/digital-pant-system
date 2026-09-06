import type { Request, Response as ExpressResponse } from "express";
import { spawn } from "bun";
import path from "path";
import fs from "fs";

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

    // 2. Path eksekusi Python venv dan predict.py
    const pythonBin = path.resolve(__dirname, "../ml/venv/bin/python");
    const scriptPath = path.resolve(__dirname, "../ml/predict.py");

    if (!fs.existsSync(pythonBin)) {
      console.error("❌ Python venv tidak ditemukan di:", pythonBin);
      res.status(500).json({ success: false, message: `Python venv tidak ditemukan: ${pythonBin}` });
      return;
    }

    if (!fs.existsSync(scriptPath)) {
      console.error("❌ predict.py tidak ditemukan di:", scriptPath);
      res.status(500).json({ success: false, message: `predict.py tidak ditemukan: ${scriptPath}` });
      return;
    }

    // 3. Eksekusi proses Python
    const proc = spawn([pythonBin, scriptPath, tempFilePath], {
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