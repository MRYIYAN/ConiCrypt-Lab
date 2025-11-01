#ifndef CONICS_H
#define CONICS_H

#include <stdint.h>

typedef struct {
    double x;
    double y;
} Point;

typedef struct {
    double A, B, C, D, E, F;
    int samples;
} ConicParams;

typedef struct {
    double delta;
    const char *type;
    Point *points;
    int num_points;
} ConicResult;

// Calculate discriminant
double calculate_delta(double A, double B, double C);

// Classify conic type
const char* classify_conic(double A, double B, double C, double delta);

// Sample points on the conic
ConicResult analyze_conic(ConicParams params);

// Free result memory
void free_conic_result(ConicResult *result);

#endif // CONICS_H
