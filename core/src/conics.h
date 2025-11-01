#ifndef CONICS_H
#define CONICS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Structure for conic coefficients: Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0
typedef struct {
    double A, B, C, D, E, F;
} ConicCoefficients;

// Classify conic section based on discriminant
const char* classify_conic(ConicCoefficients *coeffs);

// Calculate discriminant (B^2 - 4AC)
double calculate_discriminant(ConicCoefficients *coeffs);

// Process conic command from JSON
void process_conic_command(const char *input);

// Generate points for visualization
void generate_conic_points(ConicCoefficients *coeffs, char *output_buffer, size_t buffer_size);

#endif
