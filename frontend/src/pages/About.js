import React from "react";

export default function About() {
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      {/* Hero Banner */}
      <section
        style={{
          position: "relative",
          backgroundImage: "url('https://picsum.photos/seed/abuad-farm-banner/1600/400')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          padding: "100px 20px",
          textAlign: "center",
        }}
      >
        {/* Dark overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)"
        }}></div>

        {/* Content on top */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: 10, textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}>
            About ABUAD Farms
          </h1>
          <p style={{ fontSize: "1.35rem", maxWidth: "800px", margin: "0 auto", fontWeight: 600, textShadow: "1px 1px 6px rgba(0,0,0,0.8)" }}>
            Nurturing the future of agriculture through innovation, sustainability, and excellence.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#2f855a", marginBottom: 20 }}>
          Who We Are
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#374151" }}>
          ABUAD Farms is a pioneering agricultural enterprise rooted in excellence and driven by the
          mission to revolutionize farming in Africa. Established under Afe Babalola University, our
          farm serves as a model of sustainable practices, research-led innovation, and hands-on
          student engagement in agro-entrepreneurship.
        </p>
      </section>

      {/* Vision / Mission */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, maxWidth: 1000, margin: "60px auto", padding: "0 20px" }}>
        <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.5rem", color: "#2f855a", marginBottom: 12 }}>👁️ Our Vision</h3>
          <p style={{ lineHeight: 1.7, color: "#374151" }}>
            To be a globally recognized leader in innovative farming and agribusiness, producing food
            that is healthy, affordable, and sustainable for generations to come.
          </p>
        </div>

        <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.5rem", color: "#2f855a", marginBottom: 12 }}>🎯 Our Mission</h3>
          <p style={{ lineHeight: 1.7, color: "#374151" }}>
            To integrate education, research, and commercial farming in a way that enhances food security,
            empowers students and local communities, and promotes innovation across agricultural value chains.
          </p>
        </div>
      </section>

      {/* Banner image with text overlay */}
      <section
        style={{
          position: "relative",
          backgroundImage: "url('https://picsum.photos/seed/abuad-greenhouses/1400/500')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "120px 20px",
          color: "white",
          textAlign: "center",
          borderRadius: 12,
          margin: "60px 20px",
        }}
      >
        {/* Dark overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          borderRadius: 12
        }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}>
            Innovation Meets Sustainability
          </h2>
          <p style={{ maxWidth: 700, margin: "20px auto", lineHeight: 1.7, fontSize: "1.2rem", fontWeight: 600, textShadow: "1px 1px 6px rgba(0,0,0,0.85)" }}>
            From modern greenhouses to open-field cultivation, we combine technology-driven farming with
            indigenous practices to achieve year-round quality yields.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ maxWidth: 1000, margin: "60px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#2f855a", marginBottom: 20 }}>
          Our Core Values
        </h2>
        <ul style={{ listStyle: "none", padding: 0, fontSize: "1.1rem", color: "#374151", lineHeight: 1.8 }}>
          <li>🏆 Excellence in agricultural research and production</li>
          <li>🤝 Integrity and sustainability in operations</li>
          <li>🎓 Student empowerment and skill development</li>
          <li>🌱 Commitment to food security and community growth</li>
        </ul>
      </section>

      {/* Future */}
      <section style={{ maxWidth: 1000, margin: "60px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#2f855a", marginBottom: 20 }}>
          Looking Ahead
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#374151" }}>
          As ABUAD Farms continues to expand, our focus will remain on year-round cultivation,
          renewable energy in farming, and integrating agri-tech for smarter production.
          Together with our partners, students, and local communities, we are shaping the future
          of farming in Nigeria and beyond.
        </p>
      </section>
    </div>
  );
}
