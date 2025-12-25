FROM ubuntu:22.04
WORKDIR /app

# ====== CAPA 1 (MUY ESTABLE) ======
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    nodejs \
    npm \
    curl \
    git \
    pkg-config \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    libssl-dev \
    libwebkit2gtk-4.0-dev \
    libjavascriptcoregtk-4.0-dev \
 && rm -rf /var/lib/apt/lists/*

# Rust (estable)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# ====== CAPA 2 (LOCKFILES) ======
COPY App/package.json App/package-lock.json /app/App/
WORKDIR /app/App
RUN npm ci

# ====== CAPA 3 (PYTHON DEPS) ======
WORKDIR /app
COPY Python/requirements.txt Python/requirements.txt
RUN pip install -r Python/requirements.txt

# ====== CAPA 4 (CORE C) ======
COPY Core/ /app/Core/
RUN make -C Core

# ====== CAPA 5 (CÓDIGO VOLÁTIL) ======
COPY . /app

# ====== RUNTIME ======
CMD ["/bin/bash", "Scripts/run_all.sh"]
