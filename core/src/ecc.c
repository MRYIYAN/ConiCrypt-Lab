#include "ecc.h"
#include "utils.h"

bool is_point_on_curve(ECPoint *point, EllipticCurve *curve) {
    if (point->is_infinity) {
        return true;
    }
    
    double lhs = point->y * point->y;
    double rhs = point->x * point->x * point->x + curve->a * point->x + curve->b;
    
    return fabs(lhs - rhs) < 1e-6;
}

ECPoint ecc_point_double(ECPoint *p, EllipticCurve *curve) {
    ECPoint result;
    
    if (p->is_infinity || fabs(p->y) < 1e-10) {
        result.is_infinity = true;
        return result;
    }
    
    double slope = (3 * p->x * p->x + curve->a) / (2 * p->y);
    double x3 = slope * slope - 2 * p->x;
    double y3 = slope * (p->x - x3) - p->y;
    
    result.x = x3;
    result.y = y3;
    result.is_infinity = false;
    
    return result;
}

ECPoint ecc_point_add(ECPoint *p1, ECPoint *p2, EllipticCurve *curve) {
    ECPoint result;
    
    if (p1->is_infinity) {
        return *p2;
    }
    if (p2->is_infinity) {
        return *p1;
    }
    
    if (fabs(p1->x - p2->x) < 1e-10) {
        if (fabs(p1->y + p2->y) < 1e-10) {
            result.is_infinity = true;
            return result;
        }
        return ecc_point_double(p1, curve);
    }
    
    double slope = (p2->y - p1->y) / (p2->x - p1->x);
    double x3 = slope * slope - p1->x - p2->x;
    double y3 = slope * (p1->x - x3) - p1->y;
    
    result.x = x3;
    result.y = y3;
    result.is_infinity = false;
    
    return result;
}

ECPoint ecc_scalar_multiply(ECPoint *p, int k, EllipticCurve *curve) {
    ECPoint result;
    result.is_infinity = true;
    
    ECPoint temp = *p;
    
    while (k > 0) {
        if (k & 1) {
            result = ecc_point_add(&result, &temp, curve);
        }
        temp = ecc_point_double(&temp, curve);
        k >>= 1;
    }
    
    return result;
}

void process_ecc_command(const char *input) {
    // Parse JSON input: {"operation":"add","curve":{"a":-1,"b":1},"p1":{"x":0,"y":1},"p2":{"x":1,"y":0},"scalar":5}
    EllipticCurve curve = {0, 0};
    ECPoint p1 = {0, 0, false};
    ECPoint p2 = {0, 0, false};
    char operation[32] = {0};
    int scalar = 0;
    
    if (input == NULL) {
        print_json_error("Invalid input");
        return;
    }
    
    // Simple parsing - in production, use a JSON library
    sscanf(input, "{\"operation\":\"%31[^\"]\",\"curve\":{\"a\":%lf,\"b\":%lf},\"p1\":{\"x\":%lf,\"y\":%lf},\"p2\":{\"x\":%lf,\"y\":%lf},\"scalar\":%d}",
           operation, &curve.a, &curve.b, &p1.x, &p1.y, &p2.x, &p2.y, &scalar);
    
    ECPoint result;
    char result_str[512];
    
    if (strcmp(operation, "add") == 0) {
        result = ecc_point_add(&p1, &p2, &curve);
        if (result.is_infinity) {
            snprintf(result_str, sizeof(result_str), "{\"result\":\"infinity\",\"operation\":\"add\"}");
        } else {
            snprintf(result_str, sizeof(result_str), 
                     "{\"result\":{\"x\":%.6f,\"y\":%.6f},\"operation\":\"add\"}", 
                     result.x, result.y);
        }
    } else if (strcmp(operation, "double") == 0) {
        result = ecc_point_double(&p1, &curve);
        if (result.is_infinity) {
            snprintf(result_str, sizeof(result_str), "{\"result\":\"infinity\",\"operation\":\"double\"}");
        } else {
            snprintf(result_str, sizeof(result_str), 
                     "{\"result\":{\"x\":%.6f,\"y\":%.6f},\"operation\":\"double\"}", 
                     result.x, result.y);
        }
    } else if (strcmp(operation, "multiply") == 0) {
        result = ecc_scalar_multiply(&p1, scalar, &curve);
        if (result.is_infinity) {
            snprintf(result_str, sizeof(result_str), "{\"result\":\"infinity\",\"operation\":\"multiply\",\"scalar\":%d}", scalar);
        } else {
            snprintf(result_str, sizeof(result_str), 
                     "{\"result\":{\"x\":%.6f,\"y\":%.6f},\"operation\":\"multiply\",\"scalar\":%d}", 
                     result.x, result.y, scalar);
        }
    } else {
        print_json_error("Unknown operation");
        return;
    }
    
    print_json_success("ECC operation completed", result_str);
}
