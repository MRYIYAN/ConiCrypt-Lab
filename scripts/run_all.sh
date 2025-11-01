#!/bin/bash

# ConiCrypt Lab - Build and Run Script
# This script builds the C core and runs the Tauri application

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "================================================"
echo "ConiCrypt Lab - Build and Run"
echo "================================================"

# Build C core
echo ""
echo "Step 1: Building C core..."
cd "$ROOT_DIR/core"
make clean
make
echo "✓ C core built successfully"

# Build and run Tauri app
echo ""
echo "Step 2: Starting Tauri application..."
cd "$ROOT_DIR/app"

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo ""
echo "Starting application..."
echo "- WebSocket server will run on ws://localhost:9090"
echo "- Frontend will be available in the Tauri window"
echo ""

npm run tauri dev
