WORKDIR /app
RUN python3 -m venv /app/venv

# Masukkan venv ke PATH dan set ENV
ENV PATH="/app/venv/bin:$PATH"
ENV PYTHON_PATH="/app/venv/bin/python"

# Buat symlink darurat agar path lama tetap valid jika masih terpanggil
RUN mkdir -p /app/src/ml/venv/bin && ln -sf /app/venv/bin/python /app/src/ml/venv/bin/python