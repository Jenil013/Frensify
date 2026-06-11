from config import TIER_CAPS, MOCK_CAPS, Settings


def test_tier_caps_all_tiers_present():
    for tier in ("Free", "Pro", "Max"):
        assert tier in TIER_CAPS


def test_tier_caps_endpoints():
    for tier, caps in TIER_CAPS.items():
        for endpoint in ("writing_eval", "speaking_eval", "vocab_explain"):
            assert endpoint in caps, f"{tier} missing {endpoint}"


def test_free_tier_ai_locked():
    free = TIER_CAPS["Free"]
    assert free["writing_eval"] == 0
    assert free["speaking_eval"] == 0


def test_max_tier_caps():
    max_caps = TIER_CAPS["Max"]
    assert max_caps["writing_eval"] == 4
    assert max_caps["speaking_eval"] == 4
    assert max_caps["vocab_explain"] == 30


def test_mock_caps_all_tiers():
    assert MOCK_CAPS["Free"] == 0
    assert MOCK_CAPS["Pro"] == 2
    assert MOCK_CAPS["Max"] == 4
