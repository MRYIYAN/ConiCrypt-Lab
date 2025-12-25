//================================================================//
// MAIN - Núcleo matemático ConiCrypt Lab (versión profesional)
//================================================================//
//
// Punto de entrada para el núcleo en C (CLI).
// Lee coeficientes de cónicas desde stdin (JSON), analiza con el
// núcleo matemático y emite un JSON estructurado en stdout.
// Sin dependencias de UI/Tauri; reusable para ECC, CLI y tests.
//
///**
/// @file main.c
/// @brief Entrada CLI que analiza cónicas y emite JSON.
/// @details Lee JSON desde stdin con los coeficientes A, B, C, D, E, F,
///          usa analyze_conic y construye un JSON con clasificación,
///          discriminante, centro, rotación y puntos muestreados.
/// */

//--------------------------------//
// Includes y dependencias
//--------------------------------//
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "conics.h"
#include "cjson/cJSON.h"

//-------------------------------------------//
//            FUNCIONES AUXILIARES           //
//-------------------------------------------//

/**
 * @brief Lee todo stdin a un buffer NUL-terminado.
 * @return Puntero a buffer asignado con malloc (liberar con free), o NULL en error.
 */
static char* read_stdin(void) {
    size_t size = 0;
    size_t cap = 1024;
    char* buffer = malloc(cap);
    if (!buffer) return NULL;

    int c;
    while ((c = getchar()) != EOF) {
        buffer[size++] = (char)c;
        if (size >= cap) {
            cap *= 2;
            buffer = realloc(buffer, cap);
            if (!buffer) return NULL;
        }
    }
    buffer[size] = '\0';
    return buffer;
}

/**
 * @brief Convierte ConicType a string legible.
 * @param t Tipo de cónica.
 * @return Cadena constante con el tipo.
 */
static const char* conic_type_str(ConicType t) {
    switch (t) {
        case CONIC_CIRCLE:    return "CIRCLE";   
        case CONIC_ELLIPSE:   return "ELLIPSE";
        case CONIC_HYPERBOLA: return "HYPERBOLA";
        case CONIC_PARABOLA:  return "PARABOLA";
        default:              return "DEGENERATE";
    }
}

//-------------------------------------------//
//                 MAIN FLOW                 //
//-------------------------------------------//

/**
 * @brief Ejecuta el flujo CLI: leer JSON, analizar cónica y emitir JSON.
 * @return Código de salida del proceso (0 éxito, !=0 error).
 */
int main(void) {
    clock_t t0 = clock();

    /* 1. leer input */
    char* input = read_stdin();
    if (!input) {
        fprintf(stderr, "{\"ok\":false,\"error\":\"stdin_read_failed\"}\n");
        return 1;
    }

    cJSON* root = cJSON_Parse(input);
    free(input);

    if (!root) {
        fprintf(stderr, "{\"ok\":false,\"error\":\"invalid_json\"}\n");
        return 1;
    }

    /* 2. extraer coeficientes */
    double A = cJSON_GetObjectItem(root, "A")->valuedouble;
    double B = cJSON_GetObjectItem(root, "B")->valuedouble;
    double C = cJSON_GetObjectItem(root, "C")->valuedouble;
    double D = cJSON_GetObjectItem(root, "D")->valuedouble;
    double E = cJSON_GetObjectItem(root, "E")->valuedouble;
    double F = cJSON_GetObjectItem(root, "F")->valuedouble;

    cJSON_Delete(root);

    /* 3. análisis matemático */
    ConicResult r = analyze_conic(A, B, C, D, E, F);

    /* 4. construir JSON de salida */
    cJSON* out = cJSON_CreateObject();
    cJSON_AddBoolToObject(out, "ok", 1);

    /* coeficientes */
    cJSON* coeffs = cJSON_AddObjectToObject(out, "coefficients");
    cJSON_AddNumberToObject(coeffs, "A", A);
    cJSON_AddNumberToObject(coeffs, "B", B);
    cJSON_AddNumberToObject(coeffs, "C", C);
    cJSON_AddNumberToObject(coeffs, "D", D);
    cJSON_AddNumberToObject(coeffs, "E", E);
    cJSON_AddNumberToObject(coeffs, "F", F);

    /* clasificación */
    cJSON_AddStringToObject(out, "type", conic_type_str(r.type));
    cJSON_AddNumberToObject(out, "delta", r.delta);

    /* centro */
    cJSON* center = cJSON_AddObjectToObject(out, "center");
    cJSON_AddBoolToObject(center, "exists", r.has_center);
    if (r.has_center) {
        cJSON_AddNumberToObject(center, "x", r.cx);
        cJSON_AddNumberToObject(center, "y", r.cy);
    }

    /* rotación */
    cJSON* rotation = cJSON_AddObjectToObject(out, "rotation");
    cJSON_AddBoolToObject(rotation, "has_rotation", r.has_rotation);
    cJSON_AddNumberToObject(rotation, "theta", r.theta);

    /* parámetros canónicos (para render analítico React) */
    cJSON* canonical = cJSON_CreateObject();
    cJSON_AddBoolToObject(canonical, "exists", r.has_canonical);
    if (r.has_canonical) {
        cJSON_AddNumberToObject(canonical, "a", r.a);
        cJSON_AddNumberToObject(canonical, "b", r.b);
    }
    cJSON_AddItemToObject(out, "canonical", canonical);

    /* puntos muestreados (fallback React) */
    cJSON* pts = cJSON_AddArrayToObject(out, "points");
    for (int i = 0; i < r.point_count; i++) {
        cJSON* p = cJSON_CreateObject();
        cJSON_AddNumberToObject(p, "x", r.points[i].x);
        cJSON_AddNumberToObject(p, "y", r.points[i].y);
        cJSON_AddItemToArray(pts, p);
    }

    /* timing */
    clock_t t1 = clock();
    double elapsed_ms = 1000.0 * (double)(t1 - t0) / CLOCKS_PER_SEC;
    cJSON_AddNumberToObject(out, "timing_ms", elapsed_ms);

    /* 5. output */
    char* json_out = cJSON_PrintUnformatted(out);
    printf("%s\n", json_out);

    /* cleanup */
    free(json_out);
    cJSON_Delete(out);

    return 0;
}

