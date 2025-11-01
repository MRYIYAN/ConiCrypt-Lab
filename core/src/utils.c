#include "utils.h"
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdio.h>

// Greatest common divisor using Euclidean algorithm
int64_t gcd(int64_t a, int64_t b) {
    a = llabs(a);
    b = llabs(b);
    while (b != 0) {
        int64_t temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Modular exponentiation
int64_t pow_mod(int64_t base, int64_t exp, int64_t mod) {
    int64_t result = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 == 1) {
            result = (result * base) % mod;
        }
        exp = exp >> 1;
        base = (base * base) % mod;
    }
    return result;
}

// Simple primality test (sufficient for small p)
bool is_prime_simple(int64_t n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    for (int64_t i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

// Simple JSON parser for integers
bool parse_json_int(const char *json, const char *key, int64_t *out) {
    char search[256];
    snprintf(search, sizeof(search), "\"%s\"", key);
    
    const char *pos = strstr(json, search);
    if (!pos) return false;
    
    pos += strlen(search);
    while (*pos && (*pos == ':' || isspace(*pos))) pos++;
    
    if (!*pos || (!isdigit(*pos) && *pos != '-')) return false;
    
    *out = strtoll(pos, NULL, 10);
    return true;
}

// Simple JSON parser for booleans
bool parse_json_bool(const char *json, const char *key, bool *out) {
    char search[256];
    snprintf(search, sizeof(search), "\"%s\"", key);
    
    const char *pos = strstr(json, search);
    if (!pos) return false;
    
    pos += strlen(search);
    while (*pos && (*pos == ':' || isspace(*pos))) pos++;
    
    if (strncmp(pos, "true", 4) == 0) {
        *out = true;
        return true;
    } else if (strncmp(pos, "false", 5) == 0) {
        *out = false;
        return true;
    }
    
    return false;
}
