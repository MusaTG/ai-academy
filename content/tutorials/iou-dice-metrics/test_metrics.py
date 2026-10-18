import numpy as np
import pytest

from metrics import box_iou, confusion_counts, dice, dice_from_iou, mask_iou


def test_box_iou_known_value():
    assert box_iou((0, 0, 10, 10), (5, 0, 15, 10)) == pytest.approx(1 / 3)


def test_box_iou_identical_and_disjoint():
    assert box_iou((0, 0, 4, 4), (0, 0, 4, 4)) == pytest.approx(1.0)
    assert box_iou((0, 0, 4, 4), (5, 5, 9, 9)) == 0.0


def test_box_iou_is_symmetric():
    a, b = (1, 2, 7, 9), (3, 1, 10, 6)
    assert box_iou(a, b) == pytest.approx(box_iou(b, a))


def test_invalid_box_raises():
    with pytest.raises(ValueError):
        box_iou((5, 5, 1, 1), (0, 0, 2, 2))


def test_counts_and_page_example():
    # Sayfadaki elle hesaplama örneği: TP=50, FP=20, FN=30
    gt = np.zeros(100, bool); gt[:80] = True
    pred = np.zeros(100, bool); pred[30:100] = True
    assert confusion_counts(pred, gt) == (50, 20, 30)
    assert dice(pred, gt) == pytest.approx(2 / 3)
    assert mask_iou(pred, gt) == pytest.approx(0.5)


def test_dice_iou_relationship():
    rng = np.random.default_rng(1)
    for _ in range(20):
        p, g = rng.random((16, 16)) > 0.5, rng.random((16, 16)) > 0.5
        assert dice(p, g) == pytest.approx(dice_from_iou(mask_iou(p, g)))
        assert dice(p, g) >= mask_iou(p, g)


def test_empty_masks_policy():
    empty = np.zeros((4, 4), bool)
    assert mask_iou(empty, empty) == 1.0
    assert dice(empty, empty, empty_score=0.0) == 0.0


def test_shape_mismatch_raises():
    with pytest.raises(ValueError):
        dice(np.zeros((2, 2)), np.zeros((3, 3)))
