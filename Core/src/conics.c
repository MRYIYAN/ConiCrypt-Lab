//================================================================//
// CONICS MODULE (TEMPORAL PARA LEVANTAR CONTENDORES)
//================================================================//
//
// Este archivo implementa una versión muy inicial del módulo de cónicas
// para ConiCrypt Lab. Solo calcula el discriminante delta = B^2 - 4AC,
// determina el tipo de cónica (elipse, parábola, hipérbola) y exporta
// los parámetros y el tipo a un archivo JSON en /app/Data/conic.json.
// No incluye validaciones ni lógica avanzada.
//
// Se utiliza para pruebas básicas y para levantar los contenedores :)
//
//--------------------------------//
// Includes y dependencias
//--------------------------------//
#include "conics.h"
#include <stdio.h>
#include <math.h>

/**
 * Analiza una cónica y exporta los resultados a JSON.
 *
 * Calcula el discriminante delta = B^2 - 4AC y determina el tipo de cónica.
 * Exporta los parámetros y el tipo a /app/Data/conic.json.
 *
 * @param c Puntero a la estructura Conic con los coeficientes.
 */
void analyze_conic(struct Conic *c) {
    double delta = c->B * c->B - 4 * c->A * c->C;

    if (delta < 0)
        printf("Elipse o circunferencia\n");
    else if (delta == 0)
        printf("Parábola\n");
    else
        printf("Hipérbola\n");

    // Exportar a JSON
    FILE *f = fopen("/app/Data/conic.json", "w");
    fprintf(f, "{\"A\":%.2f, \"B\":%.2f, \"C\":%.2f, \"delta\":%.2f, \"type\":\"%s\"}",
            c->A, c->B, c->C, delta,
            delta < 0 ? "ellipse" : delta == 0 ? "parabola" : "hyperbola");
    fclose(f);
}


