FROM ubuntu:22.04
WORKDIR /app

# Instalación de dependencias
RUN apt-get update && apt-get install -y \
    build-essential python3 python3-pip nodejs npm curl git libgtk-3-dev libayatana-appindicator3-dev libssl-dev && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    . "$HOME/.cargo/env"

# Copiar todo el proyecto
COPY . /app

# Instalar Python
RUN pip install -r Python/requirements.txt

# Compilar núcleo C
RUN make -C Core

# Instalar dependencias de React/Tauri
WORKDIR /app/App
RUN npm install

# Volver al directorio raíz
WORKDIR /app

CMD ["/bin/bash", "Scripts/run_all.sh"]
