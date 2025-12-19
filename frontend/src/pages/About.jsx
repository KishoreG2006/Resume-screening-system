import React from "react";

function About() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>💡 About Smart Resume Screening</h1>
        <p style={styles.subtitle}>
          We use Artificial Intelligence and NLP to revolutionize how recruiters
          evaluate candidates — fast, fair, and bias-free.
        </p>
      </section>

      {/* Mission Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🎯 Our Mission</h2>
        <p style={styles.text}>
          Our mission is to make hiring smarter. By combining transformer-based NLP
          models and machine learning, we ensure companies find the right talent
          faster — while candidates get fair opportunities based on their skills,
          not keywords.
        </p>
      </section>

      {/* Tech Stack Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🧠 Technologies We Use</h2>
        <div style={styles.techGrid}>
          {[
            "React.js",
            "Flask / FastAPI",
            "BERT / RoBERTa",
            "TailwindCSS",
            "PostgreSQL",
            "Docker",
            "NLP & AI Models",
            "Chart.js",
          ].map((tech, i) => (
            <div key={i} style={styles.techCard}>
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>👥 Meet The Team</h2>
        <div style={styles.teamGrid}>
          {[
            { name: "Naveen Kumar S", role: "Full-Stack Developer" },
            { name: "Kishore G", role: "Data Scientist" },
          ].map((member, i) => (
            <div key={i} style={styles.teamCard}>
              <img
                src="/images.jpeg"
                alt={member.name}
                style={styles.avatar}
              />
              <h3 style={styles.memberName}>{member.name}</h3>
              <p style={styles.memberRole}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    paddingBottom: 60,
  },

  // Hero Section
  hero: {
    textAlign: "center",
    padding: "80px 20px",
    background: "linear-gradient(135deg, #1e3a8a, #0ea5e9)",
    color: "white",
    boxShadow: "0 0 25px rgba(14,165,233,0.3)",
  },
  title: { fontSize: 40, marginBottom: 16, fontWeight: 700 },
  subtitle: { fontSize: 18, maxWidth: 700, margin: "0 auto", lineHeight: 1.6 },

  // Section
  section: { padding: "60px 30px", textAlign: "center" },
  sectionTitle: {
    fontSize: 28,
    color: "#38bdf8",
    marginBottom: 24,
    textShadow: "0 0 10px #38bdf8",
  },
  text: {
    maxWidth: 800,
    margin: "0 auto",
    fontSize: 17,
    color: "#94a3b8",
    lineHeight: 1.7,
  },

  // Tech Cards
  techGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    maxWidth: 900,
    margin: "0 auto",
    marginTop: 30,
  },
  techCard: {
    background: "rgba(30, 58, 138, 0.3)",
    border: "1px solid rgba(56, 189, 248, 0.4)",
    padding: "20px",
    borderRadius: 12,
    color: "#38bdf8",
    fontWeight: 600,
    boxShadow: "0 0 15px rgba(56,189,248,0.2)",
    transition: "all 0.3s",
    backdropFilter: "blur(5px)",
    cursor: "pointer",
  },

  // Team Section
  teamGrid: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 30,
    marginTop: 30,
  },
  teamCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(56,189,248,0.3)",
    borderRadius: 14,
    width: 220,
    padding: 20,
    textAlign: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
    boxShadow: "0 0 15px rgba(56,189,248,0.1)",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: "2px solid #38bdf8",
    marginBottom: 10,
  },
  memberName: { color: "#f8fafc", marginBottom: 6 },
  memberRole: { color: "#94a3b8", fontSize: 14 },
};

export default About;
