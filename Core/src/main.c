//================================================================//
// MAIN - Núcleo matemático ConiCrypt Lab (versión inicial)
//================================================================//
//
// Punto de entrada para el núcleo en C. Solo ejecuta una prueba básica
// de análisis de cónicas y exporta el resultado a JSON.
// Versión muy inicial para levantar contenedores.
//
#include <stdio.h>
#include <stdlib.h>
#include "conics.h"
#include "ecc.h"

int main(void) {
    printf("ConiCrypt Core iniciado correctamente.\n");

    // Prueba: crear una cónica (x² + y² - 9 = 0 → círculo)
    struct Conic c = {1, 0, 1, 0, 0, -9};
    analyze_conic(&c);

    printf("Análisis completado. JSON generado en /app/Data/conic.json\n");

    return 0;
}

