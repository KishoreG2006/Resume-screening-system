# services/semantic_match.py
from sentence_transformers import SentenceTransformer, util

# Load the model once (efficient)
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_semantic_similarity(job_desc: str, resume_text: str) -> float:
    """
    Compute semantic similarity between job description and resume text.
    Returns a score between 0 and 1.
    """
    # Encode into embeddings
    jd_embedding = model.encode(job_desc, convert_to_tensor=True)
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)

    # Compute cosine similarity
    similarity = util.cos_sim(jd_embedding, resume_embedding)

    # Convert tensor → float
    return float(similarity.item())
