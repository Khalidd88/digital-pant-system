import sys
import json
import os
import warnings

warnings.filterwarnings("ignore")
os.environ["YOLO_VERBOSE"] = "False"
os.environ["PYTHONWARNINGS"] = "ignore"

from ultralytics import YOLO

# Botol benar-benar mulus di dataset Rehan selalu tembus >= 90%.
# Botol peot yang ditegakkan nilainya tertahan di 80-85%, jadi patokan 0.88 ini mutlak.
STRICT_GOOD_THRESHOLD = 0.88

def predict(image_path):
    model_path = os.path.join(os.path.dirname(__file__), "best.pt")
    if not os.path.exists(model_path):
        print(json.dumps({"success": False, "error": f"Model tidak ditemukan di {model_path}"}))
        sys.exit(1)

    try:
        model = YOLO(model_path)

        # conf=0.10 agar deteksi cacat/rusak sekecil apa pun langsung tertangkap
        results = model.predict(
            source=image_path,
            conf=0.10,
            iou=0.40,
            imgsz=640,
            max_det=10,
            verbose=False
        )

        good_count = 0
        bad_count = 0
        detections = []

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                raw_label = model.names.get(cls_id, "unknown")
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].tolist()

                # LOGIKA MUTU KETAT:
                # 1. Jika terdeteksi bad_bottle -> PASTI DITOLAK
                if raw_label == "bad_bottle":
                    bad_count += 1
                    final_label = "bad_bottle"

                # 2. Jika terdeteksi good_bottle:
                elif raw_label == "good_bottle":
                    # Wajib >= 88% untuk diakui layak daur ulang
                    if conf >= STRICT_GOOD_THRESHOLD:
                        good_count += 1
                        final_label = "good_bottle"
                    else:
                        # Di bawah 88% berarti ada lekukan/peot yang membuat AI ragu -> TOLAK
                        bad_count += 1
                        final_label = "bad_bottle"
                else:
                    final_label = raw_label

                detections.append({
                    "label": final_label,
                    "confidence": round(conf, 2),
                    "bbox": [round(c, 1) for c in xyxy]
                })

        output = {
            "success": True,
            "goodBottles": good_count,
            "badBottles": bad_count,
            "totalBottles": good_count,  # Hanya yang beneran lolos mutu yang masuk saldo
            "detections": detections
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Path gambar tidak diberikan"}))
        sys.exit(1)
    predict(sys.argv[1])