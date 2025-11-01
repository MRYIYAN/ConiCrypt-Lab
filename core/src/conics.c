#include "conics.h"
#include <stdlib.h>
#include <math.h>
#include <string.h>

// Calculate discriminant Δ = B² - 4AC
double calculate_delta(double A, double B, double C) {
    return B * B - 4 * A * C;
}

// Classify conic based on discriminant and coefficients
const char* classify_conic(double A, double B, double C, double delta) {
    const double epsilon = 1e-9;
    
    // Check for degenerate cases
    if (fabs(A) < epsilon && fabs(B) < epsilon && fabs(C) < epsilon) {
        return "degenerate";
    }
    
    // Circle: A = C and B = 0
    if (fabs(A - C) < epsilon && fabs(B) < epsilon && A > epsilon) {
        return "circle";
    }
    
    // Parabola: Δ = 0
    if (fabs(delta) < epsilon) {
        return "parabola";
    }
    
    // Ellipse: Δ < 0
    if (delta < -epsilon) {
        return "ellipse";
    }
    
    // Hyperbola: Δ > 0
    if (delta > epsilon) {
        return "hyperbola";
    }
    
    return "degenerate";
}

// Sample points on the conic using grid sampling
ConicResult analyze_conic(ConicParams params) {
    ConicResult result;
    result.delta = calculate_delta(params.A, params.B, params.C);
    result.type = classify_conic(params.A, params.B, params.C, result.delta);
    
    // Allocate memory for points
    int max_points = params.samples > 0 ? params.samples : 600;
    result.points = malloc(max_points * sizeof(Point));
    result.num_points = 0;
    
    // Sample points using a grid approach
    // For the equation: Ax² + Bxy + Cy² + Dx + Ey + F = 0
    double range = 10.0;
    double step = (2.0 * range) / sqrt(max_points);
    
    for (double x = -range; x <= range && result.num_points < max_points; x += step) {
        // For each x, solve for y using quadratic formula
        // Cy² + (Bx + E)y + (Ax² + Dx + F) = 0
        
        double a_coef = params.C;
        double b_coef = params.B * x + params.E;
        double c_coef = params.A * x * x + params.D * x + params.F;
        
        if (fabs(a_coef) > 1e-9) {
            double discriminant = b_coef * b_coef - 4 * a_coef * c_coef;
            
            if (discriminant >= 0) {
                double y1 = (-b_coef + sqrt(discriminant)) / (2 * a_coef);
                double y2 = (-b_coef - sqrt(discriminant)) / (2 * a_coef);
                
                if (result.num_points < max_points && fabs(y1) < range) {
                    result.points[result.num_points].x = x;
                    result.points[result.num_points].y = y1;
                    result.num_points++;
                }
                
                if (result.num_points < max_points && fabs(y2) < range && fabs(y1 - y2) > 1e-6) {
                    result.points[result.num_points].x = x;
                    result.points[result.num_points].y = y2;
                    result.num_points++;
                }
            }
        } else if (fabs(b_coef) > 1e-9) {
            // Linear in y
            double y = -c_coef / b_coef;
            if (result.num_points < max_points && fabs(y) < range) {
                result.points[result.num_points].x = x;
                result.points[result.num_points].y = y;
                result.num_points++;
            }
        }
    }
    
    return result;
}

void free_conic_result(ConicResult *result) {
    if (result && result->points) {
        free(result->points);
        result->points = NULL;
    }
}
