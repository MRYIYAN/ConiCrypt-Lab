from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os

app = Flask(__name__)
CORS(app)

CORE_BIN = "/app/Core/bin/conicrypt"


@app.route("/conic", methods=["POST"])
def conic():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"ok": False, "error": "Invalid JSON"}), 400

    try:
        payload = json.dumps(data)

        proc = subprocess.Popen(
            [CORE_BIN],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        stdout, stderr = proc.communicate(payload, timeout=5)

        if proc.returncode != 0:
            return jsonify({
                "ok": False,
                "error": "Core execution failed",
                "stderr": stderr,
                "stdout": stdout
            }), 500

        if not stdout.strip():
            return jsonify({
                "ok": False,
                "error": "Core returned empty output"
            }), 500

        try:
            result = json.loads(stdout)
        except json.JSONDecodeError:
            return jsonify({
                "ok": False,
                "error": "Invalid JSON returned by core",
                "raw": stdout
            }), 500


        # ===== DEBUG / LOGS =====
        print("====== CONIC ANALYSIS RESULT ======")
        print(f"Tipo        : {result.get('type')}")
        print(f"Delta (Δ)   : {result.get('delta')}")

        center = result.get("center", {})
        if center.get("exists"):
            print(f"Centro      : ({center.get('x')}, {center.get('y')})")
        else:
            print("Centro      : No existe")

        canonical = result.get("canonical", {})
        if canonical.get("exists"):
            print(f"Forma can.  : a={canonical.get('a')}, b={canonical.get('b')}")
        else:
            print("Forma can.  : No disponible")

        rotation = result.get("rotation", {})
        if rotation.get("has_rotation"):
            print(f"Rotación    : θ={rotation.get('theta')}")
        else:
            print("Rotación    : No")

        print(f"Puntos      : {len(result.get('points', []))}")
        print("===================================")

        return jsonify(result), 200

    except subprocess.TimeoutExpired:
        return jsonify({
            "ok": False,
            "error": "Core timeout"
        }), 504

    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "Unhandled server error",
            "exception": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
