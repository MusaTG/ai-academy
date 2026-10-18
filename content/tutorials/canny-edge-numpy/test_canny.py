import numpy as np
import pytest

from canny import canny, hysteresis, non_max_suppression, gradient, synthetic_square
from imaging import gaussian_kernel, filter2d


def border_distance(shape, lo, hi):
    yy, xx = np.indices(shape)
    inside = (yy >= lo) & (yy < hi) & (xx >= lo) & (xx < hi)
    d_in = np.minimum.reduce([yy - lo, hi - 1 - yy, xx - lo, hi - 1 - xx])
    d_out = np.maximum.reduce([lo - yy, yy - (hi - 1), lo - xx, xx - (hi - 1)])
    return np.where(inside, d_in, d_out)


def test_gaussian_kernel_sums_to_one_and_is_symmetric():
    k = gaussian_kernel(1.5)
    assert k.sum() == pytest.approx(1.0)
    assert np.allclose(k, k.T) and np.allclose(k, k[::-1, ::-1])


def test_filter2d_identity_kernel_keeps_image():
    img = np.random.default_rng(0).random((8, 9))
    ident = np.zeros((3, 3)); ident[1, 1] = 1
    assert np.allclose(filter2d(img, ident), img)


def test_edges_lie_on_square_border():
    img = synthetic_square(40, 10, 30)
    edges = canny(img, sigma=1.0)
    assert edges.sum() > 0
    dist = border_distance(img.shape, 10, 30)
    assert dist[edges].max() <= 2, "kenarlar karenin sınırından en fazla 2 piksel uzakta olmalı"
    assert 60 <= edges.sum() <= 200


def test_flat_image_has_no_edges():
    assert canny(np.ones((20, 20))).sum() == 0


def test_edges_are_thin():
    edges = canny(synthetic_square(40, 10, 30))
    # Kenarın ortasındaki bir satırda sol sınır bölgesinde en fazla 2 piksel olmalı (NMS çalışıyor).
    assert edges[20, 5:15].sum() <= 2


def test_noise_robustness():
    rng = np.random.default_rng(42)
    img = synthetic_square(40, 10, 30) + rng.normal(0, 0.05, (40, 40))
    edges = canny(img, sigma=1.5)
    dist = border_distance(img.shape, 10, 30)
    false_edges = (edges & (dist > 3)).sum()
    assert false_edges <= 0.05 * edges.sum()


def test_hysteresis_keeps_weak_pixel_connected_to_strong():
    thin = np.zeros((5, 5)); thin[2, 1] = 10; thin[2, 2] = 5; thin[0, 4] = 5
    e = hysteresis(thin, low=4, high=8)
    assert e[2, 1] and e[2, 2] and not e[0, 4]


def test_hysteresis_rejects_invalid_thresholds():
    with pytest.raises(ValueError):
        hysteresis(np.zeros((3, 3)), low=5, high=1)


def test_nms_thins_a_ramp():
    mag, ang = gradient(synthetic_square(30, 8, 22), sigma=1.0)
    thin = non_max_suppression(mag, ang)
    assert (thin > 0).sum() < (mag > 0.1 * mag.max()).sum()
