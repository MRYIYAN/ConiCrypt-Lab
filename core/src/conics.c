#include "conics.h"
#include "utils.h"

double calculate_discriminant(ConicCoefficients *coeffs) {
    return coeffs->B * coeffs->B - 4 * coeffs->A * coeffs->C;
}

const char* classify_conic(ConicCoefficients *coeffs) {
    double delta = calculate_discriminant(coeffs);
    
    if (fabs(delta) < 1e-10) {
        return "parabola";
    } else if (delta < 0) {
        if (fabs(coeffs->A - coeffs->C) < 1e-10 && fabs(coeffs->B) < 1e-10) {
            return "circle";
        }
        return "ellipse";
    } else {
        return "hyperbola";
    }
}

void generate_conic_points(ConicCoefficients *coeffs, char *output_buffer, size_t buffer_size) {
    snprintf(output_buffer, buffer_size, 
             "[{\"x\":0,\"y\":0},{\"x\":1,\"y\":1},{\"x\":-1,\"y\":1}]");
}

void process_conic_command(const char *input) {
    // Simple parser for JSON input: {"A":1,"B":0,"C":1,"D":0,"E":0,"F":-1}
    ConicCoefficients coeffs = {0, 0, 0, 0, 0, 0};
    
    if (input == NULL) {
        print_json_error("Invalid input");
        return;
    }
    
    // Parse coefficients from input
    sscanf(input, "{\"A\":%lf,\"B\":%lf,\"C\":%lf,\"D\":%lf,\"E\":%lf,\"F\":%lf}",
           &coeffs.A, &coeffs.B, &coeffs.C, &coeffs.D, &coeffs.E, &coeffs.F);
    
    const char* type = classify_conic(&coeffs);
    double delta = calculate_discriminant(&coeffs);
    
    char points[2048];
    generate_conic_points(&coeffs, points, sizeof(points));
    
    char result[4096];
    snprintf(result, sizeof(result),
             "{\"type\":\"%s\",\"discriminant\":%.6f,\"coefficients\":{\"A\":%.6f,\"B\":%.6f,\"C\":%.6f,\"D\":%.6f,\"E\":%.6f,\"F\":%.6f},\"points\":%s}",
             type, delta, coeffs.A, coeffs.B, coeffs.C, coeffs.D, coeffs.E, coeffs.F, points);
    
    print_json_success("Conic classified", result);
}
