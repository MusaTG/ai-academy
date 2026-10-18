"""Canny Edge Detector — NumPy ile sıfırdan.

Adımlar: Gauss yumuşatma → Sobel gradyanı → maksimum olmayanı bastırma → histerezis.
Çalıştırma:  python canny.py    (sentetik bir kare üzerinde kenarları ASCII olarak çizer)
"""
from __future__ import annotations

import numpy as np

from imaging import gaussian_blur, max_filter, sobel

# region: gradient
def gradient(img: np.ndarray, sigma: float) -> tuple[np.ndarray, np.ndarray]:
    """Yumuşatılmış görüntünün gradyan büyüklüğü ve yönü (derece, 0–180)."""
    smooth = gaussian_blur(img, sigma)
    gx, gy = sobel(smooth)
    magnitude = np.hypot(gx, gy)
    angle = np.rad2deg(np.arctan2(gy, gx)) % 180.0
    return magnitude, angle
# endregion

# region: nms
def non_max_suppression(magnitude: np.ndarray, angle: np.ndarray) -> np.ndarray:
    """Gradyan yönündeki iki komşusundan büyük olmayan pikselleri bastırır (kenarı inceltir)."""
    m = np.pad(magnitude, 1, mode="constant")
    h, w = magnitude.shape
    c = m[1:-1, 1:-1]
    # Komşular: (satır kayması, sütun kayması). y ekseni aşağı doğru artar.
    def shifted(dy: int, dx: int) -> np.ndarray:
        return m[1 + dy : 1 + dy + h, 1 + dx : 1 + dx + w]

    q = np.zeros_like(angle, dtype=int)  # 0: 0°, 1: 45°, 2: 90°, 3: 135°
    q[(angle >= 22.5) & (angle < 67.5)] = 1
    q[(angle >= 67.5) & (angle < 112.5)] = 2
    q[(angle >= 112.5) & (angle < 157.5)] = 3
    n1 = np.select([q == 0, q == 1, q == 2, q == 3], [shifted(0, 1), shifted(1, 1), shifted(1, 0), shifted(1, -1)])
    n2 = np.select([q == 0, q == 1, q == 2, q == 3], [shifted(0, -1), shifted(-1, -1), shifted(-1, 0), shifted(-1, 1)])
    # Eşitlik durumunda (simetrik basamak kenarı) yalnızca bir tarafı tutmak için asimetrik karşılaştırma.
    # Kayan nokta gürültüsünü yok saymak için küçük bir tolerans kullanılır.
    tol = 1e-9 * (magnitude.max() + 1.0)
    keep = (c > n1 + tol) & (c >= n2 - tol) & (c > 0)
    return np.where(keep, magnitude, 0.0)
# endregion

# region: hysteresis
def hysteresis(thin: np.ndarray, low: float, high: float) -> np.ndarray:
    """Güçlü pikseller kenardır; zayıf pikseller güçlü bir kenara 8-komşulukla bağlıysa kenardır."""
    if low > high:
        raise ValueError("low eşiği high eşiğinden büyük olamaz")
    strong = thin >= high
    weak = (thin >= low) & ~strong
    edges = strong.copy()
    for _ in range(thin.size):  # her turda kenar en az bir piksel büyür; üst sınır güvenlik içindir
        grown = (max_filter(edges.astype(float)) > 0) & weak & ~edges
        if not grown.any():
            break
        edges |= grown
    return edges
# endregion

# region: canny
def canny(img: np.ndarray, sigma: float = 1.0, low_ratio: float = 0.1, high_ratio: float = 0.3) -> np.ndarray:
    """Kenar haritası (bool). Eşikler, inceltilmiş gradyanın en büyük değerine oranla verilir."""
    if img.ndim != 2:
        raise ValueError("Gri tonlamalı (2B) görüntü bekleniyor")
    magnitude, angle = gradient(img, sigma)
    thin = non_max_suppression(magnitude, angle)
    peak = thin.max()
    if peak == 0:
        return np.zeros_like(img, dtype=bool)
    return hysteresis(thin, low_ratio * peak, high_ratio * peak)
# endregion


def synthetic_square(size: int = 40, lo: int = 10, hi: int = 30) -> np.ndarray:
    img = np.zeros((size, size))
    img[lo:hi, lo:hi] = 1.0
    return img


if __name__ == "__main__":
    edges = canny(synthetic_square(24, 6, 18), sigma=1.0)
    for row in edges:
        print("".join("█" if v else "·" for v in row))
    print(f"{int(edges.sum())} kenar pikseli bulundu")
