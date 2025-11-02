import json
import matplotlib.pyplot as plt

try:
    import numpy as np
    has_numpy = True
except Exception:
    import math
    has_numpy = False

DATA_PATH = "/app/Data/conic.json"
OUTPUT_PATH = "/app/Output/conic_plot.png"

# Cargar datos
try:
    with open(DATA_PATH, "r") as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"[ERROR] No se encontró el archivo {DATA_PATH}")
    exit(1)

if "delta" not in data or "type" not in data:
    print("[ERROR] El archivo JSON no tiene los campos esperados (delta, type).")
    exit(1)

# Generar puntos
if has_numpy:
    x = np.linspace(-10, 10, 400)
    scale = np.sqrt(abs((data["delta"]) / 4.0))
    y = scale * x
else:
    import math
    def linspace(a, b, num):
        if num <= 1:
            return [a]
        step = (b - a) / (num - 1)
        return [a + i * step for i in range(num)]
    x = linspace(-10, 10, 400)
    scale = math.sqrt(abs((data["delta"]) / 4.0))
    y = [scale * xi for xi in x]

# Graficar
plt.figure(figsize=(6, 4))
plt.plot(x, y, label=f'{data["type"]}')
plt.title("Conic visualization")
plt.legend()
plt.grid(True)
plt.savefig(OUTPUT_PATH)

print(f"[OK] Gráfica guardada en {OUTPUT_PATH}")
