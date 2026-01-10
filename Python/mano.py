import cv2
import mediapipe as mp
import numpy as np

# --- Iniciamos la detección de manos con MediaPipe ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)
mp_draw = mp.solutions.drawing_utils

# Activamos la cámara
cap = cv2.VideoCapture(0)

# Guardamos los vectores
vectores_mano = []

# Función para contar dedos
def contar_dedos(hand_landmarks, hand_label="Right"):
    tips = [4, 8, 12, 16, 20]
    pip_joints = [3, 6, 10, 14, 18]

    puntos = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark])
    dedos_arriba = 0
    es_mano_derecha = hand_label == "Right"

    # Dedo pulgar
    if es_mano_derecha:
        if puntos[tips[0]][0] < puntos[tips[0]-1][0]:
            dedos_arriba += 1
    else:
        if puntos[tips[0]][0] > puntos[tips[0]-1][0]:
            dedos_arriba += 1

    # Otros dedos
    for i in range(1, 5):
        if puntos[tips[i]][1] < puntos[pip_joints[i]][1]:
            dedos_arriba += 1

    return dedos_arriba

# Dibujar recuadro
def dibujar_bbox(frame, hand_landmarks, w, h):
    x_coords = [int(lm.x * w) for lm in hand_landmarks.landmark]
    y_coords = [int(lm.y * h) for lm in hand_landmarks.landmark]
    x_min, x_max = min(x_coords)-30, max(x_coords)+30
    y_min, y_max = min(y_coords)-30, max(y_coords)+30
    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0,0,255), 3)
    return (x_min, y_min, x_max, y_max)

# Dibujar vectores desde la muñeca y mostramos los dedos 
def dibujar_vectores(frame, puntos, w, h):
    wx, wy = int(puntos[0][0]*w), int(puntos[0][1]*h)
    dedos_idx = [4, 8, 12, 16, 20]
    colores = [(255,0,255), (0,255,255), (255,255,0), (255,128,0), (128,0,255)]
    nombres_dedos = ["PULGAR", "INDICE", "MEDIO", "ANULAR", "MEÑIQUE"]

    vectores_frame = []

    for i, idx in enumerate(dedos_idx):
        fx, fy, fz = puntos[idx]
        fx_px, fy_px = int(fx*w), int(fy*h)

        # Vector relativo a la muñeca
        vector = np.array([fx - puntos[0][0], fy - puntos[0][1], fz - puntos[0][2]])
        vectores_frame.append(vector)

        # Dibujamos flechas
        cv2.arrowedLine(frame, (wx, wy), (fx_px, fy_px), colores[i], 3, tipLength=0.2)
        # Círculo en la punta del dedo
        cv2.circle(frame, (fx_px, fy_px), 8, colores[i], -1)
        cv2.circle(frame, (fx_px, fy_px), 10, (255,255,255), 2)
        # Texto con componentes del vector
        cv2.putText(frame, f"{nombres_dedos[i]}: X={vector[0]:.2f} Y={vector[1]:.2f} Z={vector[2]:.2f}",
                    (fx_px+10, fy_px-10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, colores[i], 1)

    return np.array(vectores_frame)

# Nombres de los dedos detectados
nombres_numeros = {0:"CERO",1:"UNO",2:"DOS",3:"TRES",4:"CUATRO",5:"CINCO"}

# Bucle principal
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks, hand_handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
            # Dibujamos el esqueleto
            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2),
                mp_draw.DrawingSpec(color=(255,0,0), thickness=2)
            )

            # Puntos 3D
            puntos = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark])

            # Vectores relativos de la muñeca
            vectores = dibujar_vectores(frame, puntos, w, h)
            vectores_mano.append(vectores)

            # Contamos dedos
            hand_label = hand_handedness.classification[0].label
            num_dedos = contar_dedos(hand_landmarks, hand_label)
            texto_dedos = nombres_numeros.get(num_dedos, str(num_dedos))

            # Dibujamos recuadro y el número de dedos
            bbox = dibujar_bbox(frame, hand_landmarks, w, h)
            cv2.putText(frame, texto_dedos, (bbox[0], bbox[1]-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,0,255), 3)

            # Estadísticas de magnitud
            mag_promedio = np.mean(np.linalg.norm(vectores[:,:2], axis=1))
            cv2.putText(frame, f"Mag promedio: {mag_promedio:.3f}", (10, h-50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    else:
        cv2.putText(frame, "No se detecta mano", (10,40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    # Botón para salir de la cámara 
    cv2.putText(frame, "ESC para salir", (10,30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1)

    cv2.imshow("Vectores de la Mano", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()

# Convertimos en array
vectores_mano = np.array(vectores_mano)

# Resumen final de los datos obtenidos
print("="*50)
print("RESUMEN DE VECTORES CAPTURADOS")
print("="*50)
print(f"Forma del array: {vectores_mano.shape}")
print(f"Total de frames: {len(vectores_mano)}")
if len(vectores_mano) > 0:
    print(f"Media global: {np.mean(vectores_mano):.4f}")
    print(f"Desviación estándar: {np.std(vectores_mano):.4f}")
    print(f"Mínimo: {np.min(vectores_mano):.4f}")
    print(f"Máximo: {np.max(vectores_mano):.4f}")

    # Vectores de la última posición de la mano
    print("\nVectores muñeca → dedos (última posición):")
    ultima = vectores_mano[-1]
    for i, vec in enumerate(ultima):
        print(f"  Dedo {i}: [x={vec[0]:.3f}, y={vec[1]:.3f}, z={vec[2]:.3f}]")
