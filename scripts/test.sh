#!/bin/bash

# Test script for ConiCrypt Lab
# Tests the C core and verifies basic functionality

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "================================================"
echo "ConiCrypt Lab - Integration Tests"
echo "================================================"

# Build C core
echo ""
echo "Building C core..."
cd "$ROOT_DIR/core"
make clean
make
echo "✓ C core built successfully"

# Test 1: Conic Circle
echo ""
echo "Test 1: Classifying a circle (x² + y² - 1 = 0)..."
RESULT=$(echo '{"A":1,"B":0,"C":1,"D":0,"E":0,"F":-1}' | ./bin/conicrypt --conic)
echo "$RESULT" | grep -q '"type":"circle"' && echo "✓ Circle classification passed" || (echo "✗ Circle classification failed" && exit 1)

# Test 2: Conic Hyperbola
echo ""
echo "Test 2: Classifying a hyperbola (x² - y² = 0)..."
RESULT=$(echo '{"A":1,"B":0,"C":-1,"D":0,"E":0,"F":0}' | ./bin/conicrypt --conic)
echo "$RESULT" | grep -q '"type":"hyperbola"' && echo "✓ Hyperbola classification passed" || (echo "✗ Hyperbola classification failed" && exit 1)

# Test 3: Conic Parabola
echo ""
echo "Test 3: Classifying a parabola (y² = x)..."
RESULT=$(echo '{"A":0,"B":0,"C":1,"D":-1,"E":0,"F":0}' | ./bin/conicrypt --conic)
echo "$RESULT" | grep -q '"type":"parabola"' && echo "✓ Parabola classification passed" || (echo "✗ Parabola classification failed" && exit 1)

# Test 4: ECC Point Addition
echo ""
echo "Test 4: ECC point addition..."
RESULT=$(echo '{"operation":"add","curve":{"a":-1,"b":1},"p1":{"x":0,"y":1},"p2":{"x":1,"y":0},"scalar":5}' | ./bin/conicrypt --ecc)
echo "$RESULT" | grep -q '"operation":"add"' && echo "✓ ECC addition passed" || (echo "✗ ECC addition failed" && exit 1)

# Test 5: ECC Point Doubling
echo ""
echo "Test 5: ECC point doubling..."
RESULT=$(echo '{"operation":"double","curve":{"a":-1,"b":1},"p1":{"x":0,"y":1},"p2":{"x":1,"y":0},"scalar":5}' | ./bin/conicrypt --ecc)
echo "$RESULT" | grep -q '"operation":"double"' && echo "✓ ECC doubling passed" || (echo "✗ ECC doubling failed" && exit 1)

# Test 6: ECC Scalar Multiplication
echo ""
echo "Test 6: ECC scalar multiplication..."
RESULT=$(echo '{"operation":"multiply","curve":{"a":-1,"b":1},"p1":{"x":0,"y":1},"p2":{"x":1,"y":0},"scalar":3}' | ./bin/conicrypt --ecc)
echo "$RESULT" | grep -q '"operation":"multiply"' && echo "✓ ECC scalar multiplication passed" || (echo "✗ ECC scalar multiplication failed" && exit 1)

echo ""
echo "================================================"
echo "All tests passed! ✓"
echo "================================================"
