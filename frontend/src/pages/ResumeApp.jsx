import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function ResumeApp() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const COLORS = ["#22d3ee", "#f472b6"]; // neon colors for Pie chart

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const formatPct = (n) =>
    typeof n === "number" && !Number.isNaN(n) ? `${n.toFixed(2)}%` : "0%";
  const barColor = (score) => {
    if (score >= 70) return "#22d3ee";
    if (score >= 40) return "#facc15";
    return "#f472b6";
  };

  const submitDisabled = useMemo(
    () => !file || !jobDescription || !name || !email || !phone || loading,
    [file, jobDescription, name, email, phone, loading]
  );

  const fillSampleJD = () => {
    setJobDescription(
      [
        "We are hiring a Full-Stack Developer.",
        "Required: Python, Django, React, JavaScript, Docker, AWS, PostgreSQL, MongoDB.",
        "Bonus: FastAPI or Flask, Linux, Git, CI/CD.",
      ].join(" ")
    );
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setErrMsg("");
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (!file || !jobDescription.trim() || !name || !email || !phone) {
      setErrMsg("Please fill all fields and upload a resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/analyze_resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}). Response: ${text}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrMsg("Could not analyze the resume. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async (data) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/export_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume_report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export PDF");
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (!candidates.length) return alert("No candidates to export.");
    const headers = ["Name", "Email", "Phone", "Final Score", "Semantic Score", "Experience", "Education"];
    const rows = candidates.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.final_score,
      c.semantic_score,
      c.experience_years,
      c.education_level,
    ]);
    const csvContent =
      [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/candidates");
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const data = await res.json();
      setCandidates(data);
      setShowCandidates(true);
    } catch (err) {
      alert("Could not load candidates");
      console.error(err);
    }
  };

  const clearCandidates = async () => {
    if (!window.confirm("Delete ALL candidates? This cannot be undone.")) return;
    try {
      setClearing(true);
      const res = await fetch("http://127.0.0.1:5000/candidates/clear", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to clear candidates");
      setCandidates([]);
      setShowCandidates(true);
    } catch (err) {
      alert("Could not clear candidates");
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/candidates/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete candidate");
      setCandidates(candidates.filter((c) => c.id !== id));
    } catch (err) {
      alert("Could not delete candidate");
      console.error(err);
    }
  };

  const ScoreBar = ({ label, value }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          width: "100%",
          background: "#1e293b",
          borderRadius: 10,
          overflow: "hidden",
          height: 22,
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value || 0))}%`,
            background: barColor(value || 0),
            height: "100%",
            transition: "width 400ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f172a",
            fontWeight: 700,
            fontSize: 12,
            textShadow: "0 0 3px #fff",
          }}
        >
          {formatPct(value || 0)}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🚀 Resume Screening App</h1>
      <p style={styles.subheader}>
        Enter your details, upload your resume and paste the job description.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ width: "100%", maxWidth: 720 }}>
          <label style={styles.label}>Full Name</label>
          <input type="text" value={name}
            onChange={(e) => setName(e.target.value)} style={styles.input}
            placeholder="Enter your name" disabled={loading} />
        </div>

        <div style={{ width: "100%", maxWidth: 720 }}>
          <label style={styles.label}>Email</label>
          <input type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} style={styles.input}
            placeholder="Enter your email" disabled={loading} />
        </div>

        <div style={{ width: "100%", maxWidth: 720 }}>
          <label style={styles.label}>Phone</label>
          <input type="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)} style={styles.input}
            placeholder="Enter your phone number" disabled={loading} />
        </div>

        <div style={{ width: "100%", maxWidth: 720 }}>
          <label style={styles.label}>Job Description</label>
          <textarea placeholder="Paste the job description…" value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)} style={styles.textarea} />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={fillSampleJD}
              style={{ ...styles.secondaryBtn, ...styles.sampleBtn }} disabled={loading}>
              Sample JD
            </button>
            <button type="button" onClick={resetForm}
              style={{ ...styles.secondaryBtn, ...styles.resetBtn }} disabled={loading}>
              Reset
            </button>
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 720 }}>
          <label style={styles.label}>Resume (PDF/DOC/DOCX)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange}
            style={styles.fileInput} disabled={loading} />
        </div>

        <button type="submit" style={{
          ...styles.button,
          opacity: submitDisabled ? 0.6 : 1,
          cursor: submitDisabled ? "not-allowed" : "pointer",
        }} disabled={submitDisabled}>
          {loading ? <span className="spinner"></span> : "Analyze"}
        </button>
        {errMsg && <div style={styles.errorBox}>{errMsg}</div>}
      </form>

      {result && (
        <div style={styles.resultBox}>
          <h2 style={styles.resultHeader}>📊 Analysis Result</h2>
          <p><b>Name:</b> {result.candidate_name}</p>
          <p><b>Email:</b> {result.candidate_email}</p>
          <p><b>Phone:</b> {result.candidate_phone}</p>
          <p><b>Experience (years):</b> {result.experience_years}</p>
          <p><b>Education Level:</b> {result.education_level}</p>

          <h3 style={styles.sectionTitle}>Scores</h3>
          <ScoreBar label="Keyword Match" value={result.keyword_match_score} />
          <ScoreBar label="Semantic Similarity" value={result.semantic_score} />
          <ScoreBar label="Final Score" value={result.final_score} />

          <div style={{ marginTop: 20 }}>
            <h3 style={styles.sectionTitle}>Resume Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {result.resume_skills?.map((s, i) => (
                <span key={i} style={styles.skillBadge}>{s}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
            <PieChart width={320} height={260}>
              <Pie
                data={[
                  { name: "Matched Skills", value: result.matched_skills.length },
                  { name: "Missing Skills", value: result.missing_skills.length },
                ]}
                cx="50%" cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {["Matched Skills", "Missing Skills"].map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div style={{ marginTop: 20 }}>
            <button style={styles.button} onClick={() => exportPDF(result)}>⬇ Export PDF</button>
          </div>
        </div>
      )}

      {/* Candidate List & Actions */}
      <div style={{ marginTop: 30, display: "flex", gap: 10, justifyContent: "center" }}>
        <button style={styles.button} onClick={fetchCandidates}>📋 View Candidates</button>
        <button style={styles.button} onClick={exportCSV}>⬇ Export CSV</button>
        <button style={{ ...styles.secondaryBtn, ...styles.resetBtn }}
          onClick={clearCandidates} disabled={clearing}>
          {clearing ? "Clearing…" : "🗑 Clear Candidates"}
        </button>
      </div>

      {showCandidates && (
        <div style={styles.resultBox}>
          <h2 style={styles.resultHeader}>👥 Candidate List</h2>
          {candidates.length ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Final Score</th>
                  <th>Semantic Score</th>
                  <th>Experience</th>
                  <th>Education</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...candidates].sort((a, b) => b.final_score - a.final_score).map((c) => (
                  <tr key={c.id} style={{
                    backgroundColor: c.final_score >= 70 ? "#0f766e" : "#991b1b",
                    color: "#fefefe",
                    fontWeight: 600,
                  }}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.final_score}%</td>
                    <td>{c.semantic_score}%</td>
                    <td>{c.experience_years}</td>
                    <td>{c.education_level}</td>
                    <td>
                      <button style={styles.viewBtn} onClick={() => setSelectedCandidate(c)}>👁 View</button>
                      <button style={styles.deleteBtn} onClick={() => deleteCandidate(c.id)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No candidates found.</p>
          )}
        </div>
      )}

      {/* Candidate Modal */}
      {selectedCandidate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={{ color: "#22d3ee" }}>{selectedCandidate.name} – Profile</h2>
            <p><b>Email:</b> {selectedCandidate.email}</p>
            <p><b>Phone:</b> {selectedCandidate.phone}</p>
            <p><b>Final Score:</b> {selectedCandidate.final_score}%</p>
            <p><b>Semantic Score:</b> {selectedCandidate.semantic_score}%</p>
            <p><b>Experience (years):</b> {selectedCandidate.experience_years}</p>
            <p><b>Education Level:</b> {selectedCandidate.education_level}</p>

            <h3>Matched Skills</h3>
            <ul>
              {selectedCandidate.matched_skills?.map((s, i) => (
                <li key={i} style={{ color: "#22d3ee" }}>✅ {s}</li>
              ))}
            </ul>

            <h3>Missing Skills</h3>
            <ul>
              {selectedCandidate.missing_skills?.map((s, i) => (
                <li key={i} style={{ color: "#f472b6" }}>❌ {s}</li>
              ))}
            </ul>

            <div style={{ marginTop: 15 }}>
              <button style={styles.button} onClick={() => exportPDF(selectedCandidate)}>⬇ Export PDF</button>
              <button style={styles.closeBtn} onClick={() => setSelectedCandidate(null)}>✖ Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: "28px 16px", background: "#0f172a", color: "#e0f2fe", minHeight: "100vh" },
  header: { fontSize: 28, fontWeight: 800, color: "#22d3ee", textShadow: "0 0 8px #22d3ee" },
  subheader: { fontSize: 15, margin: "10px 0 26px", color: "#94a3b8" },
  form: { display: "grid", gap: 16, justifyItems: "center", marginBottom: 24 },
  label: { display: "block", textAlign: "left", fontWeight: 600, marginBottom: 4, color: "#e0f2fe" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#1e293b", color: "#e0f2fe" },
  textarea: { width: "100%", height: 120, padding: 12, borderRadius: 8, border: "1px solid #374151", background: "#1e293b", color: "#e0f2fe" },
  fileInput: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #374151", background: "#1e293b", color: "#e0f2fe" },
  button: { padding: "10px 16px", background: "#22d3ee", color: "#0f172a", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 12px #22d3ee", transition: "0.3s" },
  secondaryBtn: { padding: "8px 12px", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  sampleBtn: { background: "#2563eb", color: "#fff", boxShadow: "0 0 8px #2563eb" },
  resetBtn: { background: "#dc2626", color: "#fff", boxShadow: "0 0 8px #dc2626" },
  viewBtn: { padding: "6px 12px", marginRight: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", boxShadow: "0 0 6px #2563eb" },
  deleteBtn: { padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", boxShadow: "0 0 6px #dc2626" },
  closeBtn: { marginLeft: 10, background: "#374151", color: "white", padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer" },
  errorBox: { marginTop: 10, padding: "10px 12px", background: "#b91c1c", color: "#fca5a5", borderRadius: 8 },
  resultBox: { textAlign: "left", margin: "0 auto", padding: 22, maxWidth: 900, background: "#1e293b", borderRadius: 12, boxShadow: "0 6px 20px rgba(34,211,238,0.3)" },
  resultHeader: { fontSize: 22, marginBottom: 14, color: "#22d3ee" },
  sectionTitle: { margin: "14px 0 10px", fontSize: 16, fontWeight: 800, color: "#facc15" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 10, color: "#e0f2fe" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center" },
  modalBox: { background: "#1e293b", padding: 20, borderRadius: 10, width: "400px", textAlign: "left", color: "#e0f2fe", boxShadow: "0 0 12px #22d3ee" },
  skillBadge: { padding: "6px 10px", background: "#2563eb", borderRadius: 6, color: "#fff", textShadow: "0 0 4px #fff" },
};

export default ResumeApp;
