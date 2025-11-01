#!/bin/bash
set -e

echo "=== ConiCrypt Lab Clean Script ==="

# Clean C core
if [ -d "core" ]; then
    echo "Cleaning C core..."
    cd core
    make clean
    cd ..
fi

# Clean Node modules (optional)
if [ -d "app/node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf app/node_modules
fi

# Clean Rust target directory
if [ -d "app/src-tauri/target" ]; then
    echo "Cleaning Rust build artifacts..."
    rm -rf app/src-tauri/target
fi

# Clean Vite dist
if [ -d "app/dist" ]; then
    echo "Cleaning Vite dist..."
    rm -rf app/dist
fi

echo "Clean complete!"
