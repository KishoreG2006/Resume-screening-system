# services/screening.py
from services.semantic_match import compute_semantic_similarity

def screen_resume(job_desc: str, resume_text: str) -> dict:
    """
    Screen resume against job description using semantic similarity.
    """
    score = compute_semantic_similarity(job_desc, resume_text)
    percentage = round(score * 100, 2)

    return {
        "semantic_score": percentage,
        "result": f"Resume matches JD with {percentage}% confidence"
    }
