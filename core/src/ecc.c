#include "ecc.h"
#include "utils.h"
#include <stdlib.h>
#include <stdio.h>

// Modular inverse using Extended Euclidean Algorithm
int64_t inv_mod(int64_t a, int64_t m) {
    int64_t m0 = m, x0 = 0, x1 = 1;
    
    if (m == 1) return 0;
    
    a = ((a % m) + m) % m;
    
    while (a > 1) {
        int64_t q = a / m;
        int64_t t = m;
        
        m = a % m;
        a = t;
        t = x0;
        
        x0 = x1 - q * x0;
        x1 = t;
    }
    
    if (x1 < 0) x1 += m0;
    
    return x1;
}

// Check if point is on the curve: y² = x³ + ax + b (mod p)
bool ecc_point_on_curve(ECCurve curve, ECPoint P) {
    if (P.is_infinity) return true;
    
    int64_t left = (P.y * P.y) % curve.p;
    int64_t right = (P.x * P.x % curve.p * P.x % curve.p + 
                     curve.a * P.x % curve.p + curve.b) % curve.p;
    
    left = (left + curve.p) % curve.p;
    right = (right + curve.p) % curve.p;
    
    return left == right;
}

// Point doubling: 2P
ECPoint ecc_double(ECCurve curve, ECPoint P) {
    ECPoint result;
    
    if (P.is_infinity) {
        result.is_infinity = true;
        return result;
    }
    
    // If y = 0, result is point at infinity
    if (P.y == 0) {
        result.is_infinity = true;
        return result;
    }
    
    // Calculate slope: s = (3x² + a) / (2y)
    int64_t numerator = (3 * P.x % curve.p * P.x % curve.p + curve.a) % curve.p;
    numerator = (numerator + curve.p) % curve.p;
    
    int64_t denominator = (2 * P.y) % curve.p;
    int64_t inv = inv_mod(denominator, curve.p);
    int64_t s = (numerator * inv) % curve.p;
    s = (s + curve.p) % curve.p;
    
    // x₃ = s² - 2x₁
    int64_t x3 = (s * s - 2 * P.x) % curve.p;
    x3 = (x3 + curve.p) % curve.p;
    
    // y₃ = s(x₁ - x₃) - y₁
    int64_t y3 = (s * (P.x - x3) - P.y) % curve.p;
    y3 = (y3 + curve.p) % curve.p;
    
    result.x = x3;
    result.y = y3;
    result.is_infinity = false;
    
    return result;
}

// Point addition: P + Q
ECPoint ecc_add(ECCurve curve, ECPoint P, ECPoint Q) {
    ECPoint result;
    
    if (P.is_infinity) return Q;
    if (Q.is_infinity) return P;
    
    // If P = Q, use point doubling
    if (P.x == Q.x && P.y == Q.y) {
        return ecc_double(curve, P);
    }
    
    // If P = -Q, result is point at infinity
    if (P.x == Q.x) {
        result.is_infinity = true;
        return result;
    }
    
    // Calculate slope: s = (y₂ - y₁) / (x₂ - x₁)
    int64_t numerator = (Q.y - P.y) % curve.p;
    numerator = (numerator + curve.p) % curve.p;
    
    int64_t denominator = (Q.x - P.x) % curve.p;
    denominator = (denominator + curve.p) % curve.p;
    
    int64_t inv = inv_mod(denominator, curve.p);
    int64_t s = (numerator * inv) % curve.p;
    s = (s + curve.p) % curve.p;
    
    // x₃ = s² - x₁ - x₂
    int64_t x3 = (s * s - P.x - Q.x) % curve.p;
    x3 = (x3 + curve.p) % curve.p;
    
    // y₃ = s(x₁ - x₃) - y₁
    int64_t y3 = (s * (P.x - x3) - P.y) % curve.p;
    y3 = (y3 + curve.p) % curve.p;
    
    result.x = x3;
    result.y = y3;
    result.is_infinity = false;
    
    return result;
}

// Scalar multiplication: k*P using double-and-add
ECPoint ecc_scalar_mul(ECCurve curve, ECPoint P, int64_t k) {
    ECPoint result;
    result.is_infinity = true;
    
    if (k == 0) return result;
    
    if (k < 0) {
        // Negate the point
        P.y = (curve.p - P.y) % curve.p;
        k = -k;
    }
    
    ECPoint addend = P;
    
    while (k > 0) {
        if (k & 1) {
            result = ecc_add(curve, result, addend);
        }
        addend = ecc_double(curve, addend);
        k >>= 1;
    }
    
    return result;
}

// List all points on the curve
ECPoint* ecc_list_points(ECCurve curve, int *count) {
    ECPoint *points = malloc(curve.p * curve.p * sizeof(ECPoint));
    *count = 0;
    
    for (int64_t x = 0; x < curve.p; x++) {
        int64_t rhs = (x * x % curve.p * x % curve.p + 
                       curve.a * x % curve.p + curve.b) % curve.p;
        rhs = (rhs + curve.p) % curve.p;
        
        for (int64_t y = 0; y < curve.p; y++) {
            int64_t y_squared = (y * y) % curve.p;
            if (y_squared == rhs) {
                points[*count].x = x;
                points[*count].y = y;
                points[*count].is_infinity = false;
                (*count)++;
            }
        }
    }
    
    return points;
}

// Process ECC simulation
ECCResult simulate_ecc(ECCParams params) {
    ECCResult result;
    result.valid = false;
    result.points = NULL;
    result.num_points = 0;
    result.error = NULL;
    
    // Validate that p is prime
    if (!is_prime_simple(params.p)) {
        result.error = "p is not prime";
        return result;
    }
    
    // Setup curve
    ECCurve curve;
    curve.p = params.p;
    curve.a = params.a;
    curve.b = params.b;
    
    // Setup point P
    ECPoint P;
    P.x = params.Px;
    P.y = params.Py;
    P.is_infinity = false;
    
    // Verify P is on the curve
    if (!ecc_point_on_curve(curve, P)) {
        result.error = "Point P is not on the curve";
        return result;
    }
    
    // Calculate Q = k*P
    result.Q = ecc_scalar_mul(curve, P, params.k);
    result.valid = true;
    
    // List all points if requested
    if (params.listPoints) {
        result.points = ecc_list_points(curve, &result.num_points);
    }
    
    return result;
}

void free_ecc_result(ECCResult *result) {
    if (result && result->points) {
        free(result->points);
        result->points = NULL;
    }
}
