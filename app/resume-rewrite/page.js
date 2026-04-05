"use client";

import { useState } from "react";

export default function ResumeRewritePage() {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/test-openai");
      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setResult(data.text || "AI response received.");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, color: "#fff" }}>
      <h1 style={{ fontSize: 42, marginBottom: 12 }}>AI CV Rewrite</h1>
      <p style={{ marginBottom: 24, opacity: 0.9 }}>
       Paste your CV and get a stronger ATS-friendly rewrite in seconds
      </p>

      <label style={{ display: "block", marginBottom: 8 }}>Target role</label>
      <input
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        placeholder="e.g. Pediatric Specialist"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #334155",
          marginBottom: 16,
          background: "#0f172a",
          color: "#fff",
        }}
      />

      <label style={{ display: "block", marginBottom: 8 }}>CV text</label>
      <textarea
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
        placeholder="Paste CV text here..."
        rows={14}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #334155",
          marginBottom: 16,
          background: "#0f172a",
          color: "#fff",
        }}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "12px 18px",
          borderRadius: 10,
          border: "none",
          background: "#60a5fa",
          color: "#111827",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate My CV Rewrite"}
      </button>

      {error ? (
        <div style={{ marginTop: 20, color: "#fca5a5" }}>{error}</div>
      ) : null}

{result ? (
  <div
    style={{
      marginTop: 24,
      padding: 16,
      borderRadius: 12,
      background: "#0f172a",
      border: "1px solid #334155",
    }}
  >
    <div
      style={{
        whiteSpace: "pre-wrap",
        marginBottom: 16,
        color: "#e5e7eb",
      }}
    >
      {String(result).slice(0, 300)}...
    </div>

    <a
      href="https://payhip.com/order?link=J7W4G"
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-block",
        padding: "12px 18px",
        borderRadius: 10,
        textDecoration: "none",
        background: "#60a5fa",
        color: "#111827",
        fontWeight: 700,
      }}
    >
      Unlock Full Rewrite – $29
    </a>
  </div>
) : null}
