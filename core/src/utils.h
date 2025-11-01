#ifndef UTILS_H
#define UTILS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// JSON parsing and generation helpers
void print_json_error(const char *message);
void print_json_success(const char *message, const char *data);
char* read_stdin();

#endif
