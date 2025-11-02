#!/bin/bash
set -e
echo " Compilando núcleo C..."
make -C ../Core

echo " Ejecutando análisis de cónica..."
echo '{"A":1,"B":0,"C":1,"D":0,"E":0,"F":-9}' | ../Core/bin/conicrypt --conic > ../Data/conic.json

echo "Generando gráfica con Python..."
python3 ../Python/plot_conics.py

echo " Proceso completo. Resultado en /Output/"
