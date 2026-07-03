"""Input and rate limits for AI endpoints (cost / DoS protection)."""

# Writing — TEF longest task min is 200 words; allow ~2.5× headroom.
MAX_ESSAY_TEXT_LENGTH = 8_000
MAX_WRITING_PROMPT_LENGTH = 2_000
MAX_WORD_COUNT = 500
MAX_MIN_WORDS = 250

# Vocab lookup — single word or short phrase.
MAX_VOCAB_FIELD_LENGTH = 100

# Speaking prompts / conversation context.
MAX_SPEAKING_PROMPT_LENGTH = 2_000
MAX_STIMULUS_LENGTH = 4_000
MAX_CONVERSATION_TURN_TEXT = 2_000
MAX_CONVERSATION_TURNS = 30  # up to 15 user + 15 examiner turns
MAX_SPEAKING_DURATION_SECONDS = 600
MAX_SPEAKING_METADATA_CHARS = 80_000

# Identifiers and paths.
MAX_EXERCISE_ID_LENGTH = 128
MAX_MODULE_ID_LENGTH = 128
MAX_SECTION_ID_LENGTH = 32
MAX_STORAGE_PATH_LENGTH = 512

# Uploaded / downloaded speaking audio (single clip).
MAX_SPEAKING_AUDIO_BYTES = 10 * 1024 * 1024  # 10 MiB

# Per-user sliding window across all /ai/* routes.
AI_RATE_LIMIT_WINDOW_SEC = 60
AI_RATE_LIMIT_MAX_REQUESTS = 40
