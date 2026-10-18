"""Harris Corner Detector — NumPy ile sıfırdan.

Çalıştırma:  python harris.py   (sentetik bir karenin 4 köşesini bulur)
"""
from __future__ import annotations

import numpy as np

from imaging import filter2d, gaussian_kernel, max_filter, sobel

# region: response
def harris_response(img: np.ndarray, sigma: float = 1.0, k: float = 0.05) -> np.ndarray:
    """R = det(M) − k·tr(M)², M = Gauss ağırlıklı yapı tensörü."""
    gx, gy = sobel(img.astype(float))
    w = gaussian_kernel(sigma)
    sxx = filter2d(gx * gx, w)
    syy = filter2d(gy * gy, w)
    sxy = filter2d(gx * gy, w)
    det = sxx * syy - sxy ** 2
    trace = sxx + syy
    return det - k * trace ** 2
# endregion

# region: detect
def detect_corners(img: np.ndarray, sigma: float = 1.0, k: float = 0.05,
                   rel_threshold: float = 0.1, window: int = 5) -> np.ndarray:
    """(satır, sütun) köşe koordinatları. Yerel maksimum + göreli eşik."""
    r = harris_response(img, sigma, k)
    if r.max() <= 0:
        return np.empty((0, 2), dtype=int)
    is_peak = (r == max_filter(r, window)) & (r > rel_threshold * r.max())
    return np.argwhere(is_peak)
# endregion


if __name__ == "__main__":
    img = np.zeros((40, 40)); img[10:30, 10:30] = 1.0
    corners = detect_corners(img)
    print("Bulunan köşeler (satır, sütun):", corners.tolist())
