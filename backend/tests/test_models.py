from models.ai import AIWritingCorrection, AISpeakingSuggestion


def test_writing_correction_model():
    data = {
        "analysis": "Reasoned through all dimensions.",
        "overallFeedback": "Good structure.",
        "cefrScore": "B2",
        "scoreRange": "B1-B2",
        "dimensionScores": {
            "vocabulary": "B2 — good range.",
            "grammar": "B1 — some errors.",
            "coherence": "B2 — clear flow.",
            "taskCompleteness": "B2 — task met.",
        },
        "detailedCorrections": [
            {"original": "je suis alle", "corrected": "je suis alle(e)", "explanation": "Gender agreement."}
        ],
        "improvedVersion": "Je suis alle(e) au marche.",
    }
    model = AIWritingCorrection(**data)
    assert model.cefrScore == "B2"
    assert len(model.detailedCorrections) == 1


def test_speaking_suggestion_model():
    data = {
        "cefrLevel": "B2",
        "fluencyFeedback": "Good fluency.",
        "grammarAndVocab": "B2",
        "structureAnalysis": "Good structure.",
        "pronunciationTips": ["Pronounce /r/ clearly.", "Use stress correctly."],
        "suggestedPhrases": [{"french": "Je suis alle", "english": "I went", "context": "Use to describe a trip."}],
        "modelSpokenDraft": "Je suis alle au marche.",
    }
    model = AISpeakingSuggestion(**data)
    assert model.cefrLevel == "B2"
    assert len(model.suggestedPhrases) == 1
    assert model.modelSpokenDraft == "Je suis alle au marche."