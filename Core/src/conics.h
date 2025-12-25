//================================================================//
//              CONICS MODULE HEADER (VERSIÓN 1.0)                //
//================================================================//
//
// API para el módulo de cónicas de ConiCrypt Lab.
// - No depende de JSON, UI ni Tauri.
// - Reutilizable (ECC, CLI, tests).
//

#ifndef CONICS_H
#define CONICS_H

#include <stdbool.h>

#define MAX_POINTS 512

typedef enum {
    CONIC_CIRCLE,   
    CONIC_ELLIPSE,
    CONIC_HYPERBOLA,
    CONIC_PARABOLA,
    CONIC_DEGENERATE
} ConicType;

typedef struct {
    double x;
    double y;
} Point2D;

typedef struct {
    // Clasificación
    ConicType type;
    double delta;

    // Coeficientes originales
    double A, B, C, D, E, F;

    // Centro
    bool has_center;
    double cx;
    double cy;

    // Rotación
    bool has_rotation;
    double theta; // radianes

    // Parámetros canónicos
    bool has_canonical;
    double a;
    double b;

    // Muestreo (fallback para render)
    Point2D points[MAX_POINTS];
    int point_count;

} ConicResult;

/**
 * Analiza una cónica general:
 * Ax² + Bxy + Cy² + Dx + Ey + F = 0
 */
ConicResult analyze_conic(
    double A, double B, double C,
    double D, double E, double F
);

#endif