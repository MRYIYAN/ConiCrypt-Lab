//================================================================//
// CONICS MODULE HEADER (TEMPORAL PARA LEVANTAR CONTENDORES)
//================================================================//
//
// Definición de la estructura Conic y declaración de la función para el módulo de cónicas de ConiCrypt Lab :)
//
#ifndef CONICS_H
#define CONICS_H

struct Conic {
    double A, B, C, D, E, F;
};

/**
 * Analiza una cónica y exporta los resultados a JSON.
 */
void analyze_conic(struct Conic *c);

#endif