from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os, io, re, docx, fitz
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import torch
from transformers import AutoTokenizer, AutoModel

app = Flask(__name__)
CORS(app)

# -------------------------------
# Database Setup
# -------------------------------
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///candidates.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# -------------------------------
# Candidate Table
# -------------------------------
class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    final_score = db.Column(db.Float)
    keyword_score = db.Column(db.Float)
    semantic_score = db.Column(db.Float)
    matched_skills = db.Column(db.Text)
    missing_skills = db.Column(db.Text)
    experience_years = db.Column(db.Float, default=0)
    education_level = db.Column(db.String(50), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "final_score": self.final_score,
            "keyword_match_score": self.keyword_score,
            "semantic_score": self.semantic_score,
            "matched_skills": self.matched_skills.split(",") if self.matched_skills else [],
            "missing_skills": self.missing_skills.split(",") if self.missing_skills else [],
            "experience_years": self.experience_years,
            "education_level": self.education_level
        }

# -------------------------------
# Contact Table
# -------------------------------
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    message = db.Column(db.Text)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "message": self.message}

# -------------------------------
# Candidate Feedback Table
# -------------------------------
class CandidateFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer)
    hired = db.Column(db.Boolean)

    def to_dict(self):
        return {"id": self.id, "candidate_id": self.candidate_id, "hired": self.hired}

with app.app_context():
    db.create_all()

# -------------------------------
# Load BERT/RoBERTa Model
# -------------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = AutoTokenizer.from_pretrained("roberta-base")  # can also use 'bert-base-uncased'
model = AutoModel.from_pretrained("roberta-base").to(device)
model.eval()

# -------------------------------
# Helper Functions
# -------------------------------
def extract_text_from_pdf(pdf_file):
    text = ""
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    return " ".join([para.text for para in doc.paragraphs])

def extract_resume_text(file):
    filename = file.filename.lower()
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)
    elif filename.endswith(".docx") or filename.endswith(".doc"):
        return extract_text_from_docx(file)
    else:
        return ""

def extract_skills(text):
    skills_db = [
        "python", "java", "c", "c++", "c#", "javascript", "typescript",
        "react", "angular", "vue", "node.js", "express", "django", "flask",
        "mysql", "postgresql", "mongodb", "oracle", "sqlite",
        "machine learning", "deep learning", "nlp", "computer vision",
        "pandas", "numpy", "matplotlib", "scikit-learn", "tensorflow", "pytorch",
        "aws", "azure", "gcp", "docker", "kubernetes", "linux", "git", "ci/cd", "css", "html"
    ]
    text = text.lower()
    found_skills = []
    for skill in skills_db:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found_skills.append(skill)
    return list(set(found_skills))

def extract_experience_years(text):
    matches = re.findall(r'(\d+)\+?\s+years?', text.lower())
    if matches:
        return float(max([int(x) for x in matches]))
    return 0

def extract_education_level(text):
    levels = ["phd", "doctorate", "master", "bachelor", "diploma", "high school"]
    text_lower = text.lower()
    for level in levels:
        if level in text_lower:
            return level.capitalize()
    return "Not Specified"

def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    # Use mean pooling of last hidden state
    embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings

def semantic_score(resume_text, job_desc):
    emb_resume = get_bert_embedding(resume_text)
    emb_jd = get_bert_embedding(job_desc)
    similarity = torch.nn.functional.cosine_similarity(emb_resume, emb_jd).item() * 100
    return round(similarity, 2)

def adjust_score_with_feedback(candidate):
    feedbacks = CandidateFeedback.query.filter_by(candidate_id=candidate.id).all()
    if feedbacks:
        hired_count = sum(f.hired for f in feedbacks)
        total = len(feedbacks)
        feedback_boost = (hired_count / total) * 10
        candidate.final_score = min(candidate.final_score + feedback_boost, 100)

# -------------------------------
# API Routes
# -------------------------------
@app.route("/analyze_resume", methods=["POST"])
def analyze_resume():
    resume_file = request.files.get("resume")
    job_description = request.form.get("job_description")
    name = request.form.get("name")
    email = request.form.get("email")
    phone = request.form.get("phone")

    if not resume_file or not job_description or not name or not email or not phone:
        return jsonify({"error": "Missing fields"}), 400

    resume_text = extract_resume_text(resume_file)
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    matched = list(set(resume_skills) & set(jd_skills))
    missing = list(set(jd_skills) - set(resume_skills))

    jd_count = max(1, len(jd_skills))
    keyword_score = round((len(matched) / jd_count) * 100, 2)

    # Semantic score with full BERT/RoBERTa
    semantic_sim = semantic_score(resume_text, job_description)

    experience_years = extract_experience_years(resume_text)
    education_level = extract_education_level(resume_text)

    final_score = round(0.5 * keyword_score + 0.5 * semantic_sim, 2)

    candidate = Candidate(
        name=name,
        email=email,
        phone=phone,
        final_score=final_score,
        keyword_score=keyword_score,
        semantic_score=semantic_sim,
        matched_skills=",".join(matched),
        missing_skills=",".join(missing),
        experience_years=experience_years,
        education_level=education_level
    )
    db.session.add(candidate)
    db.session.commit()

    return jsonify({
        "candidate_id": candidate.id,
        "candidate_name": name,
        "candidate_email": email,
        "candidate_phone": phone,
        "resume_skills": sorted(resume_skills),
        "job_description_skills": sorted(jd_skills),
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "keyword_match_score": keyword_score,
        "semantic_score": semantic_sim,
        "final_score": final_score,
        "experience_years": experience_years,
        "education_level": education_level
    })

# -------------------------------
# PDF Export & Other Routes remain unchanged
# -------------------------------

if __name__ == "__main__":
    app.run(debug=True)
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os, io, re, docx, fitz
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import torch
from transformers import AutoTokenizer, AutoModel

app = Flask(__name__)
CORS(app)

# -------------------------------
# Database Setup
# -------------------------------
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///candidates.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# -------------------------------
# Candidate Table
# -------------------------------
class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    final_score = db.Column(db.Float)
    keyword_score = db.Column(db.Float)
    semantic_score = db.Column(db.Float)
    matched_skills = db.Column(db.Text)
    missing_skills = db.Column(db.Text)
    experience_years = db.Column(db.Float, default=0)
    education_level = db.Column(db.String(50), default="")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "final_score": self.final_score,
            "keyword_match_score": self.keyword_score,
            "semantic_score": self.semantic_score,
            "matched_skills": self.matched_skills.split(",") if self.matched_skills else [],
            "missing_skills": self.missing_skills.split(",") if self.missing_skills else [],
            "experience_years": self.experience_years,
            "education_level": self.education_level
        }

# -------------------------------
# Contact Table
# -------------------------------
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    message = db.Column(db.Text)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "message": self.message}

# -------------------------------
# Candidate Feedback Table
# -------------------------------
class CandidateFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer)
    hired = db.Column(db.Boolean)

    def to_dict(self):
        return {"id": self.id, "candidate_id": self.candidate_id, "hired": self.hired}

with app.app_context():
    db.create_all()

# -------------------------------
# Load BERT/RoBERTa Model
# -------------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = AutoTokenizer.from_pretrained("roberta-base")  # can also use 'bert-base-uncased'
model = AutoModel.from_pretrained("roberta-base").to(device)
model.eval()

# -------------------------------
# Helper Functions
# -------------------------------
def extract_text_from_pdf(pdf_file):
    text = ""
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    return " ".join([para.text for para in doc.paragraphs])

def extract_resume_text(file):
    filename = file.filename.lower()
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)
    elif filename.endswith(".docx") or filename.endswith(".doc"):
        return extract_text_from_docx(file)
    else:
        return ""

def extract_skills(text):
    skills_db = [
        "python", "java", "c", "c++", "c#", "javascript", "typescript",
        "react", "angular", "vue", "node.js", "express", "django", "flask",
        "mysql", "postgresql", "mongodb", "oracle", "sqlite",
        "machine learning", "deep learning", "nlp", "computer vision",
        "pandas", "numpy", "matplotlib", "scikit-learn", "tensorflow", "pytorch",
        "aws", "azure", "gcp", "docker", "kubernetes", "linux", "git", "ci/cd", "css", "html"
    ]
    text = text.lower()
    found_skills = []
    for skill in skills_db:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text):
            found_skills.append(skill)
    return list(set(found_skills))

def extract_experience_years(text):
    matches = re.findall(r'(\d+)\+?\s+years?', text.lower())
    if matches:
        return float(max([int(x) for x in matches]))
    return 0

def extract_education_level(text):
    levels = ["phd", "doctorate", "master", "bachelor", "diploma", "high school"]
    text_lower = text.lower()
    for level in levels:
        if level in text_lower:
            return level.capitalize()
    return "Not Specified"

def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    # Use mean pooling of last hidden state
    embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings

def semantic_score(resume_text, job_desc):
    emb_resume = get_bert_embedding(resume_text)
    emb_jd = get_bert_embedding(job_desc)
    similarity = torch.nn.functional.cosine_similarity(emb_resume, emb_jd).item() * 100
    return round(similarity, 2)

def adjust_score_with_feedback(candidate):
    feedbacks = CandidateFeedback.query.filter_by(candidate_id=candidate.id).all()
    if feedbacks:
        hired_count = sum(f.hired for f in feedbacks)
        total = len(feedbacks)
        feedback_boost = (hired_count / total) * 10
        candidate.final_score = min(candidate.final_score + feedback_boost, 100)

# -------------------------------
# API Routes
# -------------------------------
@app.route("/analyze_resume", methods=["POST"])
def analyze_resume():
    resume_file = request.files.get("resume")
    job_description = request.form.get("job_description")
    name = request.form.get("name")
    email = request.form.get("email")
    phone = request.form.get("phone")

    if not resume_file or not job_description or not name or not email or not phone:
        return jsonify({"error": "Missing fields"}), 400

    resume_text = extract_resume_text(resume_file)
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    matched = list(set(resume_skills) & set(jd_skills))
    missing = list(set(jd_skills) - set(resume_skills))

    jd_count = max(1, len(jd_skills))
    keyword_score = round((len(matched) / jd_count) * 100, 2)

    # Semantic score with full BERT/RoBERTa
    semantic_sim = semantic_score(resume_text, job_description)

    experience_years = extract_experience_years(resume_text)
    education_level = extract_education_level(resume_text)

    final_score = round(0.5 * keyword_score + 0.5 * semantic_sim, 2)

    candidate = Candidate(
        name=name,
        email=email,
        phone=phone,
        final_score=final_score,
        keyword_score=keyword_score,
        semantic_score=semantic_sim,
        matched_skills=",".join(matched),
        missing_skills=",".join(missing),
        experience_years=experience_years,
        education_level=education_level
    )
    db.session.add(candidate)
    db.session.commit()

    return jsonify({
        "candidate_id": candidate.id,
        "candidate_name": name,
        "candidate_email": email,
        "candidate_phone": phone,
        "resume_skills": sorted(resume_skills),
        "job_description_skills": sorted(jd_skills),
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "keyword_match_score": keyword_score,
        "semantic_score": semantic_sim,
        "final_score": final_score,
        "experience_years": experience_years,
        "education_level": education_level
    })

# -------------------------------
# PDF Export & Other Routes remain unchanged
# -------------------------------

if __name__ == "__main__":
    app.run(debug=True)
