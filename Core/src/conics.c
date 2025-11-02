#include "conics.h"
#include <stdio.h>
#include <math.h>

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

