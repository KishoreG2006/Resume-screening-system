import React from "react";

function Home() {
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Resume", path: "/resume" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const currentPath = window.location.pathname;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>Resume<span style={{color:"#f472b6"}}>AI</span></div>
        <nav style={styles.nav}>
          {navLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              style={{
                ...styles.navLink,
                ...(currentPath === link.path ? styles.activeNavLink : {}),
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>🚀 AI-Powered Resume Screening</h1>
        <p style={styles.heroSubtitle}>
          Instantly match resumes with job descriptions, score candidates, and export professional reports.
        </p>
        <a href="/resume">
          <button style={styles.ctaBtn}>Get Started</button>
        </a>
      </section>

      {/* Features */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>💡 Key Features</h2>
        <div style={styles.features}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>📂</div>
            <h3 style={styles.cardTitle}>Upload Resume</h3>
            <p style={styles.cardText}>Quickly upload resumes in PDF or DOCX format.</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>📊</div>
            <h3 style={styles.cardTitle}>Instant Score</h3>
            <p style={styles.cardText}>AI evaluates resumes and provides a detailed score.</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>📑</div>
            <h3 style={styles.cardTitle}>Export PDF</h3>
            <p style={styles.cardText}>Generate professional analysis reports for each candidate.</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}>👥</div>
            <h3 style={styles.cardTitle}>Manage Candidates</h3>
            <p style={styles.cardText}>Track and organize all candidate information in one place.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ ...styles.section, background: "#111827" }}>
        <h2 style={styles.sectionTitle}>⚡ How It Works</h2>
        <ul style={styles.steps}>
          <li>Upload your resume</li>
          <li>Paste or upload the job description</li>
          <li>Get instant analysis and score</li>
          <li>Download PDF reports or manage candidates</li>
        </ul>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 ResumeAI | Built by KNN</p>
      </footer>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", overflowX: "hidden", background: "#0f172a", color: "#e0f2fe" },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 50px",
    background: "#111827",
    color: "#22d3ee",
    boxShadow: "0 0 20px rgba(34,211,238,0.5)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: { fontSize: 28, fontWeight: 700, color: "#22d3ee" },
  nav: { display: "flex", gap: 25 },
  navLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 6,
    transition: "all 0.3s ease",
  },
  activeNavLink: {
    color: "#f472b6",
    textShadow: "0 0 6px #f472b6",
  },

  // Hero
  hero: {
    textAlign: "center",
    padding: "120px 20px",
    background: "linear-gradient(135deg, #111827, #1e293b)",
    boxShadow: "0 0 20px rgba(34,211,238,0.3)",
  },
  heroTitle: { fontSize: 48, marginBottom: 20, fontWeight: 800, color: "#22d3ee", textShadow: "0 0 10px #22d3ee" },
  heroSubtitle: { fontSize: 20, marginBottom: 30, lineHeight: 1.6, color: "#e0f2fe" },
  ctaBtn: {
    background: "#f472b6",
    color: "#0f172a",
    padding: "14px 28px",
    fontSize: 20,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 0 12px #f472b6",
    transition: "all 0.3s ease",
  },

  // Sections
  section: { padding: "80px 20px", textAlign: "center" },
  sectionTitle: { fontSize: 32, marginBottom: 50, fontWeight: 700, color: "#f472b6", textShadow: "0 0 6px #f472b6" },
  features: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 25,
  },
  card: {
    background: "#1e293b",
    padding: "30px 20px",
    width: 250,
    borderRadius: 20,
    boxShadow: "0 0 15px rgba(244,114,182,0.4)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    color: "#e0f2fe",
  },
  cardIcon: { fontSize: 45, marginBottom: 15, textShadow: "0 0 8px #22d3ee" },
  cardTitle: { fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#f472b6" },
  cardText: { fontSize: 16, color: "#94a3b8" },
  steps: {
    listStyle: "decimal",
    textAlign: "left",
    maxWidth: 500,
    margin: "0 auto",
    fontSize: 20,
    lineHeight: 2,
    color: "#e0f2fe",
  },

  // Footer
  footer: {
    padding: 30,
    background: "#111827",
    color: "#22d3ee",
    textAlign: "center",
    fontWeight: 500,
    boxShadow: "0 0 12px rgba(34,211,238,0.4)",
  },
};

export default Home;
