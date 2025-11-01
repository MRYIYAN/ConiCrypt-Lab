#include "utils.h"

void print_json_error(const char *message) {
    printf("{\"status\":\"error\",\"message\":\"%s\"}\n", message);
    fflush(stdout);
}

void print_json_success(const char *message, const char *data) {
    printf("{\"status\":\"success\",\"message\":\"%s\",\"data\":%s}\n", message, data);
    fflush(stdout);
}

char* read_stdin() {
    char *buffer = NULL;
    size_t buffer_size = 0;
    size_t total_read = 0;
    size_t chunk_size = 1024;
    
    while (1) {
        buffer = realloc(buffer, buffer_size + chunk_size);
        if (!buffer) {
            return NULL;
        }
        
        size_t bytes_read = fread(buffer + buffer_size, 1, chunk_size, stdin);
        buffer_size += bytes_read;
        total_read += bytes_read;
        
        if (bytes_read < chunk_size) {
            break;
        }
    }
    
    if (buffer) {
        buffer = realloc(buffer, buffer_size + 1);
        buffer[buffer_size] = '\0';
    }
    
    return buffer;
}
