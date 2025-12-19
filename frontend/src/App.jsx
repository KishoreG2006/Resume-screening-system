import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ResumeApp from "./pages/ResumeApp";

function App() {
  return (
    <Router>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>Resume<span style={{color:"#f59e0b"}}>AI</span></div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/about" style={styles.link}>About</Link>
          <Link to="/contact" style={styles.link}>Contact</Link>
          <Link to="/resume" style={styles.link}>Resume App</Link>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/resume" element={<ResumeApp />} />
      </Routes>
    </Router>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: { fontSize: 24, fontWeight: "700" },
  navLinks: { display: "flex", gap: 20 },
  link: {
    color: "#dbeafe",
    textDecoration: "none",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 6,
    transition: "0.3s",
  },
  linkHover: {
    background: "rgba(255,255,255,0.2)",
    color: "#ffed4a",
    fontWeight: 700,
  },
};

export default App;
