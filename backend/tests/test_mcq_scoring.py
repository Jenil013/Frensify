from services.mcq_scoring import estimate_mcq_cefr, format_mcq_score_label


def test_tcf_raw_to_cefr_bands():
    assert estimate_mcq_cefr(12, 39) == "A1"
    assert estimate_mcq_cefr(14, 39) == "A1"
    assert estimate_mcq_cefr(15, 39) == "A2"
    assert estimate_mcq_cefr(28, 39) == "B2"
    assert estimate_mcq_cefr(37, 39) == "C1"
    assert estimate_mcq_cefr(39, 39) == "C2"


def test_tef_raw_bands_out_of_40():
    assert estimate_mcq_cefr(12, 40) == "A1"
    assert estimate_mcq_cefr(37, 40) == "C1"
    assert estimate_mcq_cefr(38, 40) == "C2"
    assert estimate_mcq_cefr(39, 40) == "C2"
    assert estimate_mcq_cefr(40, 40) == "C2"
    assert format_mcq_score_label(12, 39) == "12/39 (A1)"
    assert format_mcq_score_label(40, 40) == "40/40 (C2)"
