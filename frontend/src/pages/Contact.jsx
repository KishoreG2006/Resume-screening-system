import { useState } from "react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const res = await fetch("http://127.0.0.1:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("✅ Message sent successfully!");
        setName(""); setEmail(""); setMessage("");
      } else {
        setStatus("❌ Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error sending message.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>📬 Contact Us</h1>
        <p style={styles.subtitle}>
          Have questions, feedback, or collaboration ideas? We'd love to hear from you!
        </p>
      </section>

      {/* Contact Form */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>💡 Get in Touch</h2>
        <div style={styles.formCard}>
          <form style={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.textarea}
              required
            />
            <button type="submit" style={styles.button}>Send Message</button>
          </form>
          {status && <p style={styles.status}>{status}</p>}
        </div>
      </section>

      {/* Contact Info */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📞 Contact Information</h2>
        <p style={styles.text}>📧 Email: support@resumeanalyzer.com</p>
        <p style={styles.text}>📱 Phone: +91 90031 47267</p>
        <p style={styles.text}>📍 Location: Chennai, India</p>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 Resume Analyzer | Dark Neon Theme</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#0f172a",
    color: "#e0f2fe",
  },

  // Hero
  hero: {
    background: "linear-gradient(135deg, #111827, #1e293b)",
    color: "#22d3ee",
    padding: "80px 20px",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(34,211,238,0.4)",
  },
  title: { fontSize: 40, fontWeight: "700", marginBottom: 20, textShadow: "0 0 8px #22d3ee" },
  subtitle: { fontSize: 18, maxWidth: 700, margin: "0 auto", lineHeight: 1.6, color: "#e0f2fe" },

  // Sections
  section: { padding: "60px 20px", textAlign: "center" },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f472b6",
    marginBottom: 25,
    textShadow: "0 0 6px #f472b6",
  },

  // Text
  text: { fontSize: 17, maxWidth: 700, margin: "0 auto 10px", color: "#94a3b8" },

  // Form card
  formCard: {
    maxWidth: 450,
    margin: "0 auto",
    background: "#1e293b",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 0 20px rgba(244,114,182,0.4)",
  },
  form: { display: "grid", gap: 16 },
  input: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #22d3ee",
    background: "#0f172a",
    color: "#e0f2fe",
    fontSize: 16,
    outline: "none",
  },
  textarea: {
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #22d3ee",
    background: "#0f172a",
    color: "#e0f2fe",
    fontSize: 16,
    minHeight: 120,
    outline: "none",
  },
  button: {
    padding: "12px",
    background: "#22d3ee",
    color: "#0f172a",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 0 10px #22d3ee",
  },

  // Status message
  status: { marginTop: 12, fontWeight: "600", color: "#f472b6" },

  // Footer
  footer: {
    textAlign: "center",
    padding: "25px 0",
    background: "#111827",
    color: "#22d3ee",
    marginTop: 60,
    boxShadow: "0 0 10px rgba(34,211,238,0.4)",
  },
};

export default Contact;
