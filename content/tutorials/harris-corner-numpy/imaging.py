"""Ortak görüntü işleme yardımcıları (yalnızca NumPy).

Canny ve Harris tutorial'ları bu dosyayı kullanır. Fonksiyonlar bilinçli olarak
basit tutuldu: amaç hız değil, her adımın ne yaptığını görebilmektir.
"""
from __future__ import annotations

import numpy as np
from numpy.lib.stride_tricks import sliding_window_view

# region: filter2d
def filter2d(img: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """2B çapraz korelasyon (görüntü işlemede 'konvolüsyon' diye anılan işlem).

    Kenarlarda yansıtmalı dolgu (reflect padding) kullanılır; çıktı girdiyle aynı boyuttadır.
    """
    kh, kw = kernel.shape
    padded = np.pad(img.astype(float), ((kh // 2, kh // 2), (kw // 2, kw // 2)), mode="reflect")
    windows = sliding_window_view(padded, (kh, kw))
    return np.einsum("ijkl,kl->ij", windows, kernel)
# endregion

# region: gaussian
def gaussian_kernel(sigma: float) -> np.ndarray:
    """Toplamı 1 olan 2B Gauss çekirdeği; yarıçap ≈ 3σ."""
    if sigma <= 0:
        raise ValueError("sigma pozitif olmalı")
    radius = max(1, int(round(3 * sigma)))
    x = np.arange(-radius, radius + 1, dtype=float)
    g = np.exp(-(x ** 2) / (2 * sigma ** 2))
    g /= g.sum()
    return np.outer(g, g)  # ayrılabilir: G(x, y) = g(x) g(y)


def gaussian_blur(img: np.ndarray, sigma: float) -> np.ndarray:
    return filter2d(img, gaussian_kernel(sigma))
# endregion

# region: sobel
SOBEL_X = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=float)
SOBEL_Y = SOBEL_X.T


def sobel(img: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Yatay (gx) ve dikey (gy, satır yönünde aşağı) türevler."""
    return filter2d(img, SOBEL_X), filter2d(img, SOBEL_Y)
# endregion


def max_filter(img: np.ndarray, size: int = 3) -> np.ndarray:
    """Her pikselin size×size komşuluğundaki en büyük değer."""
    pad = size // 2
    padded = np.pad(img, pad, mode="constant", constant_values=-np.inf)
    return sliding_window_view(padded, (size, size)).max(axis=(-1, -2))
