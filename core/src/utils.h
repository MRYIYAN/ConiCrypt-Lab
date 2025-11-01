#ifndef UTILS_H
#define UTILS_H

#include <stdint.h>
#include <stdbool.h>

// Mathematical utilities
int64_t gcd(int64_t a, int64_t b);
int64_t pow_mod(int64_t base, int64_t exp, int64_t mod);
bool is_prime_simple(int64_t n);

// JSON parsing helpers
bool parse_json_int(const char *json, const char *key, int64_t *out);
bool parse_json_bool(const char *json, const char *key, bool *out);

#endif // UTILS_H
