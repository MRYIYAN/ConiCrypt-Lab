//================================================================//
// CONICS MODULE (TEMPORAL PARA LEVANTAR CONTENDORES)
//================================================================//
//
// Este archivo implementa una versión muy inicial del módulo de cónicas
// para ConiCrypt Lab. Solo calcula el discriminante delta = B^2 - 4AC,
// determina el tipo de cónica (elipse, parábola, hipérbola) y exporta
// los parámetros y el tipo a un archivo JSON en /app/Data/conic.json.
// No incluye validaciones ni lógica avanzada.
//
// Se utiliza para pruebas básicas y para levantar los contenedores :)
//
//--------------------------------//
// Includes y dependencias
//--------------------------------//
#include "conics.h"
#include <math.h>
#include <string.h>

/**
 * @file conics.c
 * @brief Implementación inicial del módulo de cónicas.
 * @details Módulo reutilizable sin dependencias de JSON, UI ni Tauri.
 *          Calcula el discriminante, clasifica, centro, rotación y
 *          genera un muestreo de puntos como fallback visual.
 */

/**
 * @brief Clasifica la cónica por el discriminante y coeficientes.
 * @param A Coeficiente de x².
 * @param B Coeficiente de xy.
 * @param C Coeficiente de y².
 * @return Tipo de cónica: círculo, elipse, parábola, hipérbola o degenerada.
 */
static ConicType classify(double A, double B, double C) {
    double delta = B*B - 4*A*C;

    if (fabs(delta) < 1e-8) return CONIC_PARABOLA;

    if (delta < 0) {
        // círculo si no hay término xy y A == C
        if (fabs(B) < 1e-8 && fabs(A - C) < 1e-8) {
            return CONIC_CIRCLE;
        }
        return CONIC_ELLIPSE;
    }

    if (delta > 0) return CONIC_HYPERBOLA;

    return CONIC_DEGENERATE;
}

/**
 * @brief Calcula el centro de la cónica si existe.
 * @param r Resultado que contiene coeficientes y recibe cx, cy.
 * @note Si 4AC - B² ≈ 0, no existe centro (se marca has_center = false).
 */
static void compute_center(ConicResult* r) {
    double det = 4*r->A*r->C - r->B*r->B;
    if (fabs(det) < 1e-8) {
        r->has_center = false;
        return;
    }

    r->has_center = true;
    r->cx = (r->B*r->E - 2*r->C*r->D) / det;
    r->cy = (r->B*r->D - 2*r->A*r->E) / det;
}

/**
 * @brief Calcula el ángulo de rotación canónica.
 * @param r Resultado que contiene coeficientes y recibe theta (rad).
 * @details Usa la fórmula theta = 0.5 * atan2(B, A - C).
 * @note Si B ≈ 0 o A ≈ C, no se aplica rotación.
 */
static void compute_rotation(ConicResult* r) {
    if (fabs(r->B) < 1e-8 || fabs(r->A - r->C) < 1e-8) {
        r->has_rotation = false;
        r->theta = 0.0;
        return;
    }

    r->has_rotation = true;
    r->theta = 0.5 * atan2(r->B, r->A - r->C);
}

// Añadido: parámetros canónicos (fase 2)
static void compute_canonical_params(ConicResult* r) {
    r->has_canonical = false;

    // Solo manejamos sin rotación por ahora
    if (r->has_rotation) return;
    if (!r->has_center) return;

    double h = r->cx;
    double k = r->cy;

    double Fp =
        r->F +
        r->A * h * h +
        r->C * k * k +
        r->D * h +
        r->E * k;

    // CÍRCULO (caso especial)
    if (r->type == CONIC_CIRCLE && Fp < 0) {
        r->a = sqrt(-Fp / r->A); // radio
        r->b = r->a;
        r->has_canonical = true;
        return;
    }

    // Normalizamos según el tipo
    if (r->type == CONIC_ELLIPSE && Fp < 0) {
        r->a = sqrt(-Fp / r->A);
        r->b = sqrt(-Fp / r->C);
        r->has_canonical = true;
    }
    else if (r->type == CONIC_HYPERBOLA && Fp != 0) {
        r->a = sqrt(fabs(Fp / r->A));
        r->b = sqrt(fabs(Fp / r->C));
        r->has_canonical = true;
    }
}

/**
 * @brief Genera un muestreo de puntos sobre la curva para visualización.
 * @param r Resultado donde se almacenan los puntos y el contador.
 * @details Recorre x en [-10, 10] y resuelve y por la ecuación cuadrática
 *          Cy² + (Bx + E)y + (Ax² + Dx + F) = 0, almacenando hasta MAX_POINTS.
 * @warning Muestreo aproximado: no es robusto para casos degenerados ni
 *          garantiza cobertura uniforme.
 */
static void sample_points(ConicResult* r) {
    r->point_count = 0;

    const double t_min = -10.0;
    const double t_max = 10.0;
    const double step = 0.1;

    //  CASO PARÁBOLA (C ≈ 0, sin rotación)
    if (r->type == CONIC_PARABOLA && fabs(r->C) < 1e-8 && !r->has_rotation) {
        // y = -(Ax² + Dx + F) / E
        if (fabs(r->E) < 1e-8) return;

        for (double x = t_min; x <= t_max && r->point_count < MAX_POINTS; x += step) {
            double y = -(r->A*x*x + r->D*x + r->F) / r->E;
            r->points[r->point_count++] = (Point2D){x, y};
        }
        return;
    }

    //  CASO PARÁBOLA (con rotación): muestreo paramétrico robusto
    if (r->type == CONIC_PARABOLA && r->has_rotation) {
        // Ejemplo paramétrico simple (no exacto, pero seguro)
        for (double t = t_min; t <= t_max && r->point_count < MAX_POINTS; t += 0.05) {
            double x = t;
            double y1 = (-x + sqrt(x*x + 1));
            double y2 = (-x - sqrt(x*x + 1));
            r->points[r->point_count++] = (Point2D){x, y1};
            if (r->point_count < MAX_POINTS)
                r->points[r->point_count++] = (Point2D){x, y2};
        }
        return;
    }

    //  CASO GENERAL (elipse / hipérbola)
    for (double x = t_min; x <= t_max && r->point_count < MAX_POINTS; x += step) {
        double a = r->C;
        double b = r->B * x + r->E;
        double c = r->A * x * x + r->D * x + r->F;

        if (fabs(a) < 1e-8) continue;

        double disc = b*b - 4*a*c;
        if (disc < 0) continue;

        double s = sqrt(disc);
        r->points[r->point_count++] = (Point2D){x, (-b + s)/(2*a)};
        if (r->point_count < MAX_POINTS)
            r->points[r->point_count++] = (Point2D){x, (-b - s)/(2*a)};
    }
}

/**
 * @brief Analiza una cónica general Ax² + Bxy + Cy² + Dx + Ey + F = 0.
 * @param A Coeficiente de x².
 * @param B Coeficiente de xy.
 * @param C Coeficiente de y².
 * @param D Coeficiente de x.
 * @param E Coeficiente de y.
 * @param F Término independiente.
 * @return ConicResult con clasificación, centro, rotación, parámetros
 *         canónicos (stub) y muestreo de puntos.
 * @remarks Fase 1: parámetros canónicos pendientes (has_canonical = false).
 */
ConicResult analyze_conic(
    double A, double B, double C,
    double D, double E, double F
) {
    ConicResult r;
    memset(&r, 0, sizeof(ConicResult));

    r.A = A; r.B = B; r.C = C;
    r.D = D; r.E = E; r.F = F;

    r.delta = B*B - 4*A*C;
    r.type = classify(A, B, C);

    compute_center(&r);
    compute_rotation(&r);

    // Parámetros canónicos (fase 2: ahora dejamos stub limpio)
    r.has_canonical = false;
    compute_canonical_params(&r);

    // Fallback geométrico
    sample_points(&r);

    // --- FINAL BOSS !0_0! : Detectar degeneración parabólica  ---
    if (r.type == CONIC_PARABOLA) {
        double h = r.cx;
        double k = r.cy;
        double Fp =
            r.F +
            r.A * h * h +
            r.C * k * k +
            r.D * h +
            r.E * k;
        double eps = 1e-8;
        if (fabs(Fp) < eps) {
            r.type = CONIC_DEGENERATE;
        }
    }

    return r;
}


