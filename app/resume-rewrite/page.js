"use client";

import { useState } from "react";

export default function ResumeRewritePage() {
  const [form, setForm] = useState({
    fullName: "",
    targetRole: "",
    yearsExperience: "",
    location: "",
    phone: "",
    email: "",
    summaryNotes: "",
    workExperience: "",
    education: "",
    skills: "",
    certifications: "",
    languages: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate-full-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate CV");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Generate Full CV</h1>
        <p style={styles.subtitle}>
          Fill in the details below and generate a complete professional CV.
        </p>

        <div style={styles.grid}>
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(v) => updateField("fullName", v)}
            placeholder="e.g. Mohamed Ezzeldin"
          />
          <Input
            label="Target role"
            value={form.targetRole}
            onChange={(v) => updateField("targetRole", v)}
            placeholder="e.g. Pediatric Specialist"
          />
          <Input
            label="Years of experience"
            value={form.yearsExperience}
            onChange={(v) => updateField("yearsExperience", v)}
            placeholder="e.g. 10"
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(v) => updateField("location", v)}
            placeholder="e.g. Abu Dhabi, UAE"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            placeholder="e.g. +971..."
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
            placeholder="e.g. name@email.com"
          />
        </div>

        <TextArea
          label="Short background / summary notes"
          value={form.summaryNotes}
          onChange={(v) => updateField("summaryNotes", v)}
          placeholder="Write a few lines about your background and strengths..."
          rows={5}
        />

        <TextArea
          label="Work experience"
          value={form.workExperience}
          onChange={(v) => updateField("workExperience", v)}
          placeholder={`Example:
GP in Pediatrics – NMC Royal Hospital Abu Dhabi – 2021 to present
- Pediatric emergency and ward care
- Family counseling
- Clinical documentation

Previous GP experience in Sudan – 2 years
- NICU and pediatric cases under supervision`}
          rows={9}
        />

        <TextArea
          label="Education"
          value={form.education}
          onChange={(v) => updateField("education", v)}
          placeholder={`Example:
MBBS – University in Sudan
MRCPCH theory passed / MRCPCH completed`}
          rows={5}
        />

        <TextArea
          label="Skills"
          value={form.skills}
          onChange={(v) => updateField("skills", v)}
          placeholder="e.g. Pediatric assessment, emergency care, family counseling, documentation, teamwork"
          rows={4}
        />

        <TextArea
          label="Certifications"
          value={form.certifications}
          onChange={(v) => updateField("certifications", v)}
          placeholder="e.g. BLS, PALS, MRCPCH, DOH License"
          rows={4}
        />

        <TextArea
          label="Languages"
          value={form.languages}
          onChange={(v) => updateField("languages", v)}
          placeholder="e.g. Arabic, English"
          rows={3}
        />

        <div style={styles.actions}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Generating..." : "Generate Full CV"}
          </button>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        {result ? (
          <div style={styles.resultBox}>
            <h2 style={styles.resultTitle}>Generated CV</h2>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Professional Summary</h3>
              <p style={styles.preWrap}>{result.professional_summary}</p>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Core Skills</h3>
              <p style={styles.preWrap}>{result.core_skills}</p>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Professional Experience</h3>
              <p style={styles.preWrap}>{result.professional_experience}</p>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Education</h3>
              <p style={styles.preWrap}>{result.education}</p>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Certifications</h3>
              <p style={styles.preWrap}>{result.certifications}</p>
            </section>

            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Languages</h3>
              <p style={styles.preWrap}>{result.languages}</p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label style={styles.label}>
      <span style={styles.labelText}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 6 }) {
  return (
    <label style={styles.label}>
      <span style={styles.labelText}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={styles.textarea}
      />
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #081018 100%)",
    color: "#fff",
    padding: "32px 20px 60px",
  },
  container: {
    maxWidth: 960,
    margin: "0 auto",
  },
  title: {
    fontSize: 44,
    fontWeight: 800,
    marginBottom: 8,
  },
  subtitle: {
    color: "#cbd5e1",
    marginBottom: 24,
    fontSize: 18,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  label: {
    display: "block",
    marginBottom: 16,
  },
  labelText: {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    fontSize: 16,
  },
  textarea: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    fontSize: 16,
    resize: "vertical",
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    padding: "14px 22px",
    borderRadius: 12,
    border: "none",
    background: "#60a5fa",
    color: "#081018",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 18,
  },
  error: {
    color: "#fca5a5",
    marginBottom: 20,
    fontWeight: 700,
  },
  resultBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    background: "#0f172a",
    border: "1px solid #334155",
  },
  resultTitle: {
    fontSize: 28,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  preWrap: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    color: "#e2e8f0",
  },
};