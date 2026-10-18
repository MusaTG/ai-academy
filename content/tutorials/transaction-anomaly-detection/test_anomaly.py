import math

import numpy as np
import pytest

from anomaly import (IsolationForest, average_precision, c_factor, choose_threshold_by_cost,
                     make_transactions, precision_at_k, robust_z_score, robust_zscore)


def test_c_factor_matches_page_example():
    assert c_factor(256) == pytest.approx(10.24, abs=0.01)
    assert c_factor(2) == 1.0 and c_factor(1) == 0.0


def test_robust_z_ignores_outlier_in_center_estimate():
    x = np.array([[10.0], [11], [9], [10], [1000]])
    z = robust_zscore(x)[:, 0]
    assert abs(z[0]) < 1 and z[-1] > 100


def test_isolation_forest_scores_outlier_higher():
    rng = np.random.default_rng(0)
    X = np.vstack([rng.normal(0, 1, (300, 2)), [[8.0, 8.0]]])
    s = IsolationForest(n_trees=50, seed=0).fit(X).score_samples(X)
    assert s[-1] > np.percentile(s[:-1], 99)
    assert s[-1] > 0.6


def test_isolation_forest_is_deterministic_with_seed():
    X, _, _ = make_transactions(800, seed=3)
    a = IsolationForest(n_trees=20, seed=7).fit(X).score_samples(X)
    b = IsolationForest(n_trees=20, seed=7).fit(X).score_samples(X)
    assert np.allclose(a, b)


def test_average_precision_matches_page_example():
    assert average_precision(np.array([1, 0, 1, 0]), np.array([0.9, 0.8, 0.7, 0.1])) == pytest.approx(0.8333, abs=1e-4)


def test_both_methods_beat_random_baseline_by_far():
    X, y, _ = make_transactions(4000, fraud_rate=0.01, seed=1)
    z = robust_z_score(X)
    iso = IsolationForest(seed=1).fit(X).score_samples(X)
    for s in (z, iso):
        assert average_precision(y, s) > 5 * y.mean()   # rastgele modelin AP'si ≈ pozitif oranı
    # Çok değişkenli yapıyı kullanan Isolation Forest bu veride tek-özellikli |z| maksimumundan iyidir.
    assert average_precision(y, iso) > average_precision(y, z)
    assert precision_at_k(y, iso, 20) >= 0.2


def test_cost_threshold_is_optimal_against_brute_force():
    X, y, amounts = make_transactions(600, seed=2)
    s = robust_z_score(X)
    best = choose_threshold_by_cost(y, s, amounts, cost_fp=20)
    for t in np.quantile(s, np.linspace(0, 1, 50)):
        alarm = s >= t
        cost = amounts[(y == 1) & ~alarm].sum() + 20 * ((y == 0) & alarm).sum()
        assert best["cost"] <= cost + 1e-6


def test_no_fit_raises():
    with pytest.raises(RuntimeError):
        IsolationForest().score_samples(np.zeros((2, 2)))
