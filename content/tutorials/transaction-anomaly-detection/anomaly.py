"""İşlem verisinde anomali tespiti — robust z-score ve sıfırdan Isolation Forest.

Veri SENTETİKTİR: gerçek bir bankanın verisi değildir. Dağılımlar, öğretmek istediğimiz
örüntüleri (gece saatleri, yüksek tutar, yüksek işlem hızı) göstermek için seçilmiştir.

Çalıştırma:  python anomaly.py
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

FEATURES = ["log_tutar", "saat", "son_1_saat_islem_sayisi"]

# region: data
def make_transactions(n: int = 5000, fraud_rate: float = 0.01, seed: int = 0):
    """Sentetik işlemler: X (n, 3), y (n,) ve TL cinsinden tutarlar."""
    rng = np.random.default_rng(seed)
    n_fraud = max(1, int(round(n * fraud_rate)))
    n_norm = n - n_fraud
    night_share = 0.08  # meşru gece işlemleri de var: "farklı" her zaman "kötü" değildir
    n_night = int(n_norm * night_share)
    hours = np.r_[np.clip(rng.normal(14, 3.5, n_norm - n_night), 0, 23.99), rng.uniform(0, 6, n_night)]
    normal = np.column_stack([
        rng.normal(5.0, 0.8, n_norm),                         # ~150 TL civarı, geniş dağılım
        rng.permutation(hours),                               # çoğunlukla gündüz
        rng.poisson(1.2, n_norm),                             # düşük işlem hızı
    ])
    fraud_night = rng.random(n_fraud) < 0.6                   # dolandırıcılığın %60'ı gece
    fraud = np.column_stack([
        rng.normal(6.2, 0.9, n_fraud),                        # daha yüksek ama örtüşen tutarlar
        np.where(fraud_night, rng.uniform(0, 6, n_fraud), np.clip(rng.normal(14, 3.5, n_fraud), 0, 23.99)),
        rng.poisson(3.0, n_fraud),                            # daha yüksek işlem hızı
    ])
    X = np.vstack([normal, fraud])
    y = np.r_[np.zeros(n_norm, int), np.ones(n_fraud, int)]
    order = rng.permutation(n)
    X, y = X[order], y[order]
    return X, y, np.exp(X[:, 0])
# endregion

# region: robust_z
def robust_zscore(X: np.ndarray) -> np.ndarray:
    """Her sütun için 0.6745 (x − medyan) / MAD. MAD = 0 ise sütun 1 ile ölçeklenir."""
    med = np.median(X, axis=0)
    mad = np.median(np.abs(X - med), axis=0)
    mad = np.where(mad == 0, 1.0, mad)
    return 0.6745 * (X - med) / mad


def robust_z_score(X: np.ndarray) -> np.ndarray:
    """Tek anomali skoru: özellikler arasında en büyük |z|."""
    return np.abs(robust_zscore(X)).max(axis=1)
# endregion

# region: iforest
EULER_GAMMA = 0.5772156649


def c_factor(n: int) -> float:
    """n örneklik bir ağaçta başarısız aramanın ortalama yol uzunluğu (normalleştirme)."""
    if n > 2:
        return 2.0 * (math.log(n - 1) + EULER_GAMMA) - 2.0 * (n - 1) / n
    return 1.0 if n == 2 else 0.0


@dataclass
class _Node:
    size: int
    feature: int = -1
    split: float = 0.0
    left: "_Node | None" = None
    right: "_Node | None" = None


class IsolationForest:
    """Liu, Ting ve Zhou (2008) tarafından tanımlanan algoritmanın öğretici bir uygulaması."""

    def __init__(self, n_trees: int = 100, sample_size: int = 256, seed: int = 0):
        self.n_trees, self.sample_size, self.seed = n_trees, sample_size, seed
        self.trees: list[_Node] = []

    def _build(self, X: np.ndarray, depth: int, limit: int, rng) -> _Node:
        if depth >= limit or len(X) <= 1:
            return _Node(size=len(X))
        lo, hi = X.min(axis=0), X.max(axis=0)
        candidates = np.flatnonzero(hi > lo)
        if candidates.size == 0:              # tüm noktalar aynı: daha fazla bölünemez
            return _Node(size=len(X))
        f = int(rng.choice(candidates))
        s = float(rng.uniform(lo[f], hi[f]))
        mask = X[:, f] < s
        return _Node(len(X), f, s, self._build(X[mask], depth + 1, limit, rng), self._build(X[~mask], depth + 1, limit, rng))

    def fit(self, X: np.ndarray) -> "IsolationForest":
        rng = np.random.default_rng(self.seed)
        psi = min(self.sample_size, len(X))
        limit = math.ceil(math.log2(max(psi, 2)))
        self._psi = psi
        self.trees = [self._build(X[rng.choice(len(X), psi, replace=False)], 0, limit, rng) for _ in range(self.n_trees)]
        return self

    def _path_lengths(self, node: _Node, X: np.ndarray, idx: np.ndarray, depth: int, out: np.ndarray) -> None:
        if node.left is None:
            out[idx] = depth + c_factor(node.size)
            return
        go_left = X[idx, node.feature] < node.split
        self._path_lengths(node.left, X, idx[go_left], depth + 1, out)
        self._path_lengths(node.right, X, idx[~go_left], depth + 1, out)

    def score_samples(self, X: np.ndarray) -> np.ndarray:
        """s(x) = 2^(−E[h(x)] / c(ψ)); 1'e yakın = anomali."""
        if not self.trees:
            raise RuntimeError("önce fit() çağrılmalı")
        total = np.zeros(len(X))
        buf = np.empty(len(X))
        for tree in self.trees:
            self._path_lengths(tree, X, np.arange(len(X)), 0, buf)
            total += buf
        return 2.0 ** (-(total / len(self.trees)) / c_factor(self._psi))
# endregion

# region: evaluation
def average_precision(y: np.ndarray, scores: np.ndarray) -> float:
    """AP = Σ (R_n − R_{n−1}) P_n  (scikit-learn ile aynı tanım; eşit skorlar birlikte ele alınır)."""
    order = np.argsort(-scores, kind="mergesort")
    y_sorted, s_sorted = y[order], scores[order]
    tp = np.cumsum(y_sorted)
    distinct = np.r_[np.flatnonzero(np.diff(s_sorted)), len(s_sorted) - 1]
    tp = tp[distinct]
    fp = (distinct + 1) - tp
    precision = tp / (tp + fp)
    recall = tp / y.sum()
    return float(np.sum(np.diff(np.r_[0.0, recall]) * precision))


def precision_at_k(y: np.ndarray, scores: np.ndarray, k: int) -> float:
    """En yüksek skorlu k alarmın ne kadarı gerçek? (analist kapasitesi metriği)"""
    top = np.argsort(-scores, kind="mergesort")[:k]
    return float(y[top].mean())


def choose_threshold_by_cost(y, scores, amounts, cost_fp: float = 20.0):
    """Beklenen maliyeti (kaçan tutar + yanlış alarm × cost_fp) en aza indiren eşik."""
    best = (math.inf, None)
    for t in np.unique(scores):
        alarm = scores >= t
        cost = amounts[(y == 1) & ~alarm].sum() + cost_fp * ((y == 0) & alarm).sum()
        if cost < best[0]:
            best = (float(cost), float(t))
    return {"threshold": best[1], "cost": best[0]}
# endregion


if __name__ == "__main__":
    X, y, amounts = make_transactions()
    print(f"{len(y)} işlem, {y.sum()} dolandırıcılık (pozitif oranı {y.mean():.2%})")
    for name, s in [("Robust z-score", robust_z_score(X)), ("Isolation Forest", IsolationForest(seed=0).fit(X).score_samples(X))]:
        best = choose_threshold_by_cost(y, s, amounts)
        print(f"{name:18s} AP={average_precision(y, s):.3f}  P@50={precision_at_k(y, s, 50):.2f}  "
              f"en iyi eşik maliyeti={best['cost']:,.0f} TL")
    print(f"Taban çizgisi (rastgele) AP ≈ {y.mean():.3f}")
