#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "conics.h"
#include "ecc.h"
#include "utils.h"

void print_usage() {
    fprintf(stderr, "Usage: conicrypt [--conic|--ecc]\n");
    fprintf(stderr, "Reads JSON from stdin and writes JSON to stdout\n");
    fprintf(stderr, "\nModes:\n");
    fprintf(stderr, "  --conic  Process conic section operations\n");
    fprintf(stderr, "  --ecc    Process elliptic curve cryptography operations\n");
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        print_usage();
        return 1;
    }
    
    char *input = read_stdin();
    if (!input) {
        print_json_error("Failed to read input");
        return 1;
    }
    
    if (strcmp(argv[1], "--conic") == 0) {
        process_conic_command(input);
    } else if (strcmp(argv[1], "--ecc") == 0) {
        process_ecc_command(input);
    } else {
        print_usage();
        free(input);
        return 1;
    }
    
    free(input);
    return 0;
}
