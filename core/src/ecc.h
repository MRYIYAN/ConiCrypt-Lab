#ifndef ECC_H
#define ECC_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdbool.h>

// Point on elliptic curve
typedef struct {
    double x;
    double y;
    bool is_infinity;
} ECPoint;

// Elliptic curve: y^2 = x^3 + ax + b
typedef struct {
    double a;
    double b;
} EllipticCurve;

// Check if point is on curve
bool is_point_on_curve(ECPoint *point, EllipticCurve *curve);

// Point addition on elliptic curve
ECPoint ecc_point_add(ECPoint *p1, ECPoint *p2, EllipticCurve *curve);

// Point doubling on elliptic curve
ECPoint ecc_point_double(ECPoint *p, EllipticCurve *curve);

// Scalar multiplication
ECPoint ecc_scalar_multiply(ECPoint *p, int k, EllipticCurve *curve);

// Process ECC command from JSON
void process_ecc_command(const char *input);

#endif
