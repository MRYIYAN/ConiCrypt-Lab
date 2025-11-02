#ifndef CONICS_H
#define CONICS_H

struct Conic {
    double A, B, C, D, E, F;
};

void analyze_conic(struct Conic *c);

#endif
