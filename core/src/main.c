#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "conics.h"
#include "ecc.h"
#include "utils.h"

#define MAX_INPUT_SIZE 65536

void print_conic_result(ConicResult result) {
    printf("{\"delta\":%.6f,\"type\": \"%s\",\"points\":[", result.delta, result.type);
    
    for (int i = 0; i < result.num_points; i++) {
        if (i > 0) printf(",");
        printf("{\"x\":%.6f,\"y\":%.6f}", result.points[i].x, result.points[i].y);
    }
    
    printf("]}\n");
}

void print_ecc_result(ECCResult result) {
    if (!result.valid) {
        printf("{\"valid\":false,\"error\":\"%s\"}\n", 
               result.error ? result.error : "Unknown error");
        return;
    }
    
    printf("{\"valid\":true,\"Q\":");
    
    if (result.Q.is_infinity) {
        printf("{\"infinity\":true}");
    } else {
        printf("{\"x\":%lld,\"y\":%lld}", (long long)result.Q.x, (long long)result.Q.y);
    }
    
    if (result.points && result.num_points > 0) {
        printf(",\"points\":[");
        for (int i = 0; i < result.num_points; i++) {
            if (i > 0) printf(",");
            printf("{\"x\":%lld,\"y\":%lld}", 
                   (long long)result.points[i].x, (long long)result.points[i].y);
        }
        printf("]");
    }
    
    printf("}\n");
}

int process_conic_mode(const char *input) {
    ConicParams params;
    
    // Parse JSON input - simple parser for our needs
    if (!parse_json_double(input, "A", &params.A)) {
        fprintf(stderr, "Error: Missing or invalid 'A' parameter\n");
        return 1;
    }
    if (!parse_json_double(input, "B", &params.B)) {
        fprintf(stderr, "Error: Missing or invalid 'B' parameter\n");
        return 1;
    }
    if (!parse_json_double(input, "C", &params.C)) {
        fprintf(stderr, "Error: Missing or invalid 'C' parameter\n");
        return 1;
    }
    if (!parse_json_double(input, "D", &params.D)) {
        fprintf(stderr, "Error: Missing or invalid 'D' parameter\n");
        return 1;
    }
    if (!parse_json_double(input, "E", &params.E)) {
        fprintf(stderr, "Error: Missing or invalid 'E' parameter\n");
        return 1;
    }
    if (!parse_json_double(input, "F", &params.F)) {
        fprintf(stderr, "Error: Missing or invalid 'F' parameter\n");
        return 1;
    }
    
    int64_t samples_i64 = 600;
    parse_json_int(input, "samples", &samples_i64);
    params.samples = (int)samples_i64;
    
    ConicResult result = analyze_conic(params);
    print_conic_result(result);
    free_conic_result(&result);
    
    return 0;
}

int process_ecc_mode(const char *input) {
    ECCParams params;
    
    // Parse JSON input
    if (!parse_json_int(input, "p", &params.p)) {
        fprintf(stderr, "Error: Missing or invalid 'p' parameter\n");
        return 1;
    }
    if (!parse_json_int(input, "a", &params.a)) {
        fprintf(stderr, "Error: Missing or invalid 'a' parameter\n");
        return 1;
    }
    if (!parse_json_int(input, "b", &params.b)) {
        fprintf(stderr, "Error: Missing or invalid 'b' parameter\n");
        return 1;
    }
    if (!parse_json_int(input, "Px", &params.Px)) {
        fprintf(stderr, "Error: Missing or invalid 'Px' parameter\n");
        return 1;
    }
    if (!parse_json_int(input, "Py", &params.Py)) {
        fprintf(stderr, "Error: Missing or invalid 'Py' parameter\n");
        return 1;
    }
    if (!parse_json_int(input, "k", &params.k)) {
        fprintf(stderr, "Error: Missing or invalid 'k' parameter\n");
        return 1;
    }
    
    params.listPoints = false;
    parse_json_bool(input, "listPoints", &params.listPoints);
    
    ECCResult result = simulate_ecc(params);
    print_ecc_result(result);
    free_ecc_result(&result);
    
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s [--conic|--ecc]\n", argv[0]);
        return 1;
    }
    
    // Read input from stdin
    char *input = malloc(MAX_INPUT_SIZE);
    if (!input) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        return 1;
    }
    
    size_t total_read = 0;
    size_t bytes_read;
    while ((bytes_read = fread(input + total_read, 1, MAX_INPUT_SIZE - total_read - 1, stdin)) > 0) {
        total_read += bytes_read;
        if (total_read >= MAX_INPUT_SIZE - 1) break;
    }
    input[total_read] = '\0';
    
    int result = 0;
    
    if (strcmp(argv[1], "--conic") == 0) {
        result = process_conic_mode(input);
    } else if (strcmp(argv[1], "--ecc") == 0) {
        result = process_ecc_mode(input);
    } else {
        fprintf(stderr, "Error: Unknown mode '%s'\n", argv[1]);
        result = 1;
    }
    
    free(input);
    return result;
}
