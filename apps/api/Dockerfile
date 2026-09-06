FROM oven/bun:1-debian

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir ultralytics

COPY package.json bun.lock* package-lock.json* ./
RUN bun install

COPY . .

# Generate Prisma Client
RUN bunx prisma generate

ENV PORT=4000
ENV NODE_ENV=production
EXPOSE 4000

CMD ["bun", "run", "src/server.ts"]
