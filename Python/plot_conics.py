#================================================================#
# MAIN - Script de ploteo de cónicas 
#================================================================#

#--------------------------------#
# Módulos y dependencias
#--------------------------------#
import json
import matplotlib.pyplot as plt
import asyncio
import websockets

try:
    import numpy as np
    has_numpy = True
except Exception:
    import math
    has_numpy = False

DATA_PATH = "/app/Data/conic.json"
OUTPUT_PATH = "/app/Output/conic_plot.png"

#--------------------------------#
# Cargar datos y graficar cónica
#--------------------------------#
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
        """Genera una lista de valores 

        Argumentos:
            a (float): Valor inicial.
            b (float): Valor final.
            num (int): Número de puntos.

        Returns:
            list: Lista de valores equiespaciados.
        """
        if num <= 1:
            return [a]
        step = (b - a) / (num - 1)
        return [a + i * step for i in range(num)]
    x = linspace(-10, 10, 400)
    scale = math.sqrt(abs((data["delta"]) / 4.0))
    y = [scale * xi for xi in x]

plt.figure(figsize=(6, 4))
plt.plot(x, y, label=f'{data["type"]}')
plt.title("Conic visualization")
plt.legend()
plt.grid(True)
plt.savefig(OUTPUT_PATH)

print(f"[OK] Gráfica guardada en {OUTPUT_PATH}")

# =====================================================
# Notificación al WebSocket de Tauri 
# =====================================================

async def notify_update():
    """
    Envía una notificación al WebSocket de Tauri.

    Conecta a ws 9191 y envía un evento JSON.
    Útil para avisar a la UI que la gráfica ha sido actualizada.

    Returns:
        None
    """
    uri = "ws://host.docker.internal:9191"
    payload = json.dumps({"event": "update_conic"})
    try:
        async with websockets.connect(uri) as ws:
            await ws.send(payload)
            print("[plotter]  Notificación enviada:", payload)
    except Exception as e:
        import sys
        print("[plotter]  Error al notificar:", e, file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(notify_update())
