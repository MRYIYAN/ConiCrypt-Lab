# ConiCrypt Lab

ConiCrypt Lab is a desktop application that connects conic sections and quadratic forms with elliptic curve cryptography (ECC). Built with a high-performance C computation engine, Rust backend (Tauri), and React + Three.js frontend.

## Features

- **Conic Sections Analysis**: Calculate discriminant (Δ), classify conic types (ellipse, parabola, hyperbola, circle), and visualize curves in real-time
- **ECC Simulation**: Perform elliptic curve point operations over finite fields with scalar multiplication
- **Real-time Computation**: C-based engine connected via WebSocket for instant results
- **3D Visualization**: Interactive Three.js graphics for exploring mathematical structures

## Architecture

```
conicrypt-lab/
├── core/                   # C computation engine
│   ├── src/               # C source files
│   ├── bin/               # Compiled binary
│   └── Makefile           # Build configuration
├── data/                  # Sample JSON data
├── scripts/               # Build and utility scripts
└── app/                   # Desktop application
    ├── src/               # React frontend
    └── src-tauri/         # Rust backend (WebSocket server)
```

## Prerequisites

- **C Compiler**: GCC or Clang
- **Node.js**: v18 or higher
- **Rust**: 1.70 or higher
- **npm**: 8 or higher

## Building

### 1. Build C Core

```bash
cd core
make
```

This creates the `core/bin/conicrypt` executable.

### 2. Install Dependencies

```bash
cd app
npm install
```

### 3. Run Development Server

```bash
cd app
npm run tauri:dev
```

Or use the convenience script:

```bash
./scripts/run_all.sh
```

## Usage

### Conic Sections

1. Navigate to "Conic Sections" in the sidebar
2. Enter coefficients A, B, C, D, E, F for the equation: Ax² + Bxy + Cy² + Dx + Ey + F = 0
3. Set the number of sample points (10-10000)
4. Click "Graficar" to visualize the curve

The app displays:
- Discriminant (Δ = B² - 4AC)
- Conic type classification
- 3D visualization of the curve

### ECC Simulation

1. Navigate to "ECC Simulation" in the sidebar
2. Enter curve parameters:
   - p: prime modulus
   - a, b: curve parameters for y² = x³ + ax + b (mod p)
   - Px, Py: base point coordinates
   - k: scalar multiplier
3. Optionally enable "List all points on curve"
4. Click "Simulate" to compute k×P

The app displays:
- Result point Q = k×P
- All points on the curve (if enabled)
- 3D visualization with highlighted base and result points

## Testing C Core

Test the conic analyzer:

```bash
./core/bin/conicrypt --conic < data/sample_conic.json
```

Test the ECC simulator:

```bash
./core/bin/conicrypt --ecc < data/sample_ecc.json
```

## Clean Build

```bash
./scripts/clean.sh
```

## Technical Details

- **C Core**: Implements discriminant calculation, conic classification, point sampling, and ECC operations (addition, doubling, scalar multiplication)
- **Rust Backend**: Spawns C binary processes, manages WebSocket connections, handles JSON I/O
- **React Frontend**: Component-based UI with Zustand state management
- **Three.js**: Hardware-accelerated 3D rendering for mathematical visualization

## License

MIT

