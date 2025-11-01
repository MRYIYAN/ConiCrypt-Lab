# ConiCrypt-Lab

ConiCrypt Lab: A monorepo desktop application connecting conic sections and quadratic forms with Elliptic Curve Cryptography (ECC). Built with Tauri+React+Three.js for visualization and a C core for calculations.

## Architecture

This is a monorepo with three main components:

### `/core` - C Core Engine
- **Purpose**: High-performance computation engine for conics and ECC operations
- **Structure**:
  - `src/main.c` - Entry point with CLI interface
  - `src/conics.c/h` - Conic section classification and analysis
  - `src/ecc.c/h` - Elliptic curve cryptography operations
  - `src/utils.c/h` - JSON I/O utilities
  - `Makefile` - Build system
- **Modes**: 
  - `--conic`: Process conic section operations
  - `--ecc`: Process ECC operations
- **Interface**: JSON stdin → JSON stdout

### `/app` - Tauri + React Desktop Application
- **Frontend**: React + TypeScript + Vite + @react-three/fiber
  - `src/pages/` - ConicsPage and ECCPage
  - `src/components/visualization/` - 3D visualization components
  - `src/lib/socket.ts` - WebSocket client
- **Backend**: Rust + Tauri
  - `src-tauri/src/main.rs` - Application entry point
  - `src-tauri/src/lib.rs` - WebSocket server (port 9090)
  - `src-tauri/src/process.rs` - C core process spawning
- **Communication**: Real-time via WebSocket to C core

### `/scripts` - Build & Run Scripts
- `run_all.sh` - Builds C core and runs Tauri app

## Getting Started

### Prerequisites
- Node.js (v20+)
- npm (v10+)
- Rust (v1.77+)
- gcc/make
- Tauri dependencies (see [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

### Quick Start

```bash
# Run everything with one command
./scripts/run_all.sh
```

This will:
1. Build the C core (`core/bin/conicrypt`)
2. Install npm dependencies (if needed)
3. Start the Tauri desktop application with WebSocket server

### Manual Build

#### Build C Core
```bash
cd core
make
# Test it
echo '{"A":1,"B":0,"C":1,"D":0,"E":0,"F":-1}' | ./bin/conicrypt --conic
```

#### Run Tauri App
```bash
cd app
npm install
npm run tauri:dev
```

## Features

### Conic Sections Mode
- Input coefficients for: Ax² + Bxy + Cy² + Dx + Ey + F = 0
- Classification: Circle, Ellipse, Parabola, or Hyperbola
- Discriminant calculation (Δ = B² - 4AC)
- Real-time 3D visualization with @react-three/fiber

### ECC Mode
- Elliptic curve: y² = x³ + ax + b
- Operations:
  - Point Addition
  - Point Doubling
  - Scalar Multiplication
- Interactive 3D curve and point visualization

## Project Structure

```
ConiCrypt-Lab/
├── core/
│   ├── src/
│   │   ├── main.c
│   │   ├── conics.c/h
│   │   ├── ecc.c/h
│   │   └── utils.c/h
│   ├── bin/          (generated)
│   └── Makefile
├── app/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── ConicsPage.tsx
│   │   │   └── ECCPage.tsx
│   │   ├── components/visualization/
│   │   │   ├── SceneCanvas.tsx
│   │   │   ├── ConicView.tsx
│   │   │   └── ECCView.tsx
│   │   └── lib/
│   │       └── socket.ts
│   ├── src-tauri/
│   │   └── src/
│   │       ├── main.rs
│   │       ├── lib.rs
│   │       └── process.rs
│   └── package.json
└── scripts/
    └── run_all.sh

```

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, @react-three/fiber, Three.js
- **Backend**: Rust, Tauri 2.0, tokio, tokio-tungstenite
- **Core Engine**: C (C99), JSON I/O
- **Communication**: WebSocket (ws://localhost:9090)
- **Build Tools**: npm, cargo, make, bash

## License

See LICENSE file for details.

