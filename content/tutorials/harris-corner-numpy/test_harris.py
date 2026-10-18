import numpy as np

from harris import detect_corners, harris_response


def square(size=40, lo=10, hi=30):
    img = np.zeros((size, size)); img[lo:hi, lo:hi] = 1.0
    return img


def test_finds_four_corners_of_square():
    corners = detect_corners(square())
    assert len(corners) == 4
    expected = np.array([[10, 10], [10, 29], [29, 10], [29, 29]])
    for e in expected:
        assert np.min(np.linalg.norm(corners - e, axis=1)) <= 2.0


def test_flat_image_has_no_corners():
    assert len(detect_corners(np.ones((20, 20)))) == 0


def test_straight_edge_is_not_a_corner():
    img = np.zeros((30, 30)); img[:, 15:] = 1.0
    r = harris_response(img)
    assert r[15, 10:20].max() <= 1e-9, "kenar boyunca R negatif veya sıfır olmalı"
    assert len(detect_corners(img)) == 0


def test_response_sign_matches_theory():
    r = harris_response(square())
    assert r[10, 10] > 0          # köşe
    assert r[20, 10] < 0          # kenar
    assert abs(r[20, 20]) < 1e-9  # düz bölge
