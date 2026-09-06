FROM oven/bun:1-debian

# 1. Install dependensi sistem Python & kebutuhan OpenCV YOLO
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Siapkan Python Virtual Environment & Library ML (CPU)
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
ENV PYTHON_PATH="/app/venv/bin/python"

RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir ultralytics

# 3. Install dependensi Bun
COPY package.json bun.lock* package-lock.json* ./
RUN bun install

# 4. Copy seluruh source code backend
COPY . .

# 5. Generate Prisma Client
RUN bunx prisma generate

# 6. Buat symlink darurat setelah COPY agar tidak tertimpa folder lokal
RUN mkdir -p /app/src/ml/venv/bin && ln -sf /app/venv/bin/python /app/src/ml/venv/bin/python

# 7. Expose port & jalankan server
EXPOSE 4000
CMD ["bun", "run", "src/server.ts"]