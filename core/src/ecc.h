#ifndef ECC_H
#define ECC_H

#include <stdint.h>
#include <stdbool.h>

typedef struct {
    int64_t x;
    int64_t y;
    bool is_infinity;
} ECPoint;

typedef struct {
    int64_t p;  // prime modulus
    int64_t a;  // curve parameter
    int64_t b;  // curve parameter
} ECCurve;

typedef struct {
    int64_t p, a, b;
    int64_t Px, Py;  // base point
    int64_t k;       // scalar multiplier
    bool listPoints;
} ECCParams;

typedef struct {
    bool valid;
    ECPoint Q;       // result Q = k*P
    ECPoint *points; // all points on curve (if listPoints)
    int num_points;
    const char *error;
} ECCResult;

// Modular arithmetic
int64_t inv_mod(int64_t a, int64_t m);

// Point operations
ECPoint ecc_add(ECCurve curve, ECPoint P, ECPoint Q);
ECPoint ecc_double(ECCurve curve, ECPoint P);
ECPoint ecc_scalar_mul(ECCurve curve, ECPoint P, int64_t k);

// Verify point on curve
bool ecc_point_on_curve(ECCurve curve, ECPoint P);

// List all points on curve
ECPoint* ecc_list_points(ECCurve curve, int *count);

// Process ECC simulation
ECCResult simulate_ecc(ECCParams params);

// Free result memory
void free_ecc_result(ECCResult *result);

#endif // ECC_H
