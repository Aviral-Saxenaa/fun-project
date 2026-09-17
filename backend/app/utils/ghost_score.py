import math


def calculate_ghost_score(
    ghost_reports: int,
    total_reports: int,
    total_upvotes: int,
    unique_reporters: int,
) -> int:
    if total_reports == 0:
        return 0

    min_sample = 5
    if total_reports < min_sample:
        confidence = total_reports / min_sample
    else:
        confidence = 1.0

    ghost_ratio = ghost_reports / total_reports

    vote_factor = min(total_upvotes / max(total_reports, 1), 3.0) / 3.0

    uniqueness = min(unique_reporters / max(total_reports, 1), 1.0)

    raw = (ghost_ratio * 0.5 + vote_factor * 0.3 + uniqueness * 0.2) * 100

    score = raw * confidence

    bayesian_mean = 40
    bayesian_weight = 3
    smoothed = (score * total_reports + bayesian_mean * bayesian_weight) / (
        total_reports + bayesian_weight
    )

    return max(0, min(100, int(round(smoothed))))


def get_ghost_label(score: int) -> str:
    if score <= 20:
        return "Surprisingly Responsive"
    elif score <= 40:
        return "Mostly Responsive"
    elif score <= 60:
        return "Could Be Better"
    elif score <= 80:
        return "Getting Ghosty"
    else:
        return "Professional Ghost"


def get_ghost_emoji(score: int) -> str:
    if score <= 20:
        return "\U0001f47c"
    elif score <= 40:
        return "\U0001f642"
    elif score <= 60:
        return "\U0001f610"
    elif score <= 80:
        return "\U0001f47b"
    else:
        return "\U0001f480"
