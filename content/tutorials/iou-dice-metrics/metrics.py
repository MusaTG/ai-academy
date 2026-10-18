"""IoU ve Dice — kutular ve ikili maskeler için sıfırdan, test edilmiş uygulama.

Kullanılan tanımlar (varyantlar açıkça belirtilir):
- Kutular (x1, y1, x2, y2) biçimindedir, x2 > x1 ve y2 > y1; alan = genişlik × yükseklik
  (piksel indeksli "+1" konvansiyonu KULLANILMAZ).
- Boş tahmin ve boş gerçek maskede (0/0) IoU ve Dice varsayılan olarak 1.0 kabul edilir;
  bu politika `empty_score` parametresiyle değiştirilebilir.
"""
from __future__ import annotations

import numpy as np

# region: box_iou
def box_iou(a: tuple[float, float, float, float], b: tuple[float, float, float, float]) -> float:
    """İki eksen-hizalı kutunun IoU değeri."""
    for box in (a, b):
        if box[2] <= box[0] or box[3] <= box[1]:
            raise ValueError(f"geçersiz kutu: {box}")
    ix1, iy1 = max(a[0], b[0]), max(a[1], b[1])
    ix2, iy2 = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    return inter / (area_a + area_b - inter)
# endregion

# region: counts
def confusion_counts(pred: np.ndarray, gt: np.ndarray) -> tuple[int, int, int]:
    """İkili maskeler için (TP, FP, FN)."""
    pred = np.asarray(pred, dtype=bool)
    gt = np.asarray(gt, dtype=bool)
    if pred.shape != gt.shape:
        raise ValueError("maskeler aynı boyutta olmalı")
    tp = int(np.logical_and(pred, gt).sum())
    fp = int(np.logical_and(pred, ~gt).sum())
    fn = int(np.logical_and(~pred, gt).sum())
    return tp, fp, fn
# endregion

# region: mask_metrics
def mask_iou(pred, gt, empty_score: float = 1.0) -> float:
    tp, fp, fn = confusion_counts(pred, gt)
    denom = tp + fp + fn
    return empty_score if denom == 0 else tp / denom


def dice(pred, gt, empty_score: float = 1.0) -> float:
    tp, fp, fn = confusion_counts(pred, gt)
    denom = 2 * tp + fp + fn
    return empty_score if denom == 0 else 2 * tp / denom


def dice_from_iou(j: float) -> float:
    """D = 2J / (1 + J)"""
    return 2 * j / (1 + j)
# endregion


if __name__ == "__main__":
    print("Kutu IoU:", round(box_iou((0, 0, 10, 10), (5, 0, 15, 10)), 3))
    gt = np.zeros((10, 10), bool); gt[2:8, 2:8] = True
    pred = np.zeros((10, 10), bool); pred[3:9, 3:9] = True
    print("Maske IoU:", round(mask_iou(pred, gt), 3), "Dice:", round(dice(pred, gt), 3))
