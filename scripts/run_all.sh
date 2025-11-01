#!/bin/bash
set -e

echo "=== ConiCrypt Lab Build Script ==="

# Build C core
echo "Building C core..."
cd core
make clean
make
cd ..

echo "Core binary built successfully at: core/bin/conicrypt"

# Install Node dependencies if needed
if [ ! -d "app/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    cd app
    npm install
    cd ..
fi

# Run Tauri in dev mode
echo "Starting Tauri development server..."
cd app
npm run tauri:dev
