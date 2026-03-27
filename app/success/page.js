"use client";

import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  async function generateSummary() {
    try {
      if (!file) {
        setError("Please choose a CV file first.");
        return;
      }

      setLoading(true);
      setError("");
      setSummary("");
      setPreview("");

      const formData = new FormData();
      formData.append("cv", file);
      formData.append("targetRole", "Pediatrics Doctor");
      formData.append("targetMarket", "UAE");
      formData.append(
        "jobDescription",
        "Looking for a pediatric doctor with strong clinical and communication skills."
      );

      const res = await fetch("/api/generate-summary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setSummary(data.summary || "");
      setPreview(data.extractedTextPreview || "");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "white",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
        Payment successful
      </h1>

      <p style={{ fontSize: "20px", marginBottom: "20px" }}>
        Your order was received.
      </p>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: "20px", display: "block" }}
      />

      <button
        onClick={generateSummary}
        disabled={loading}
        style={{
          background: "#5bbcff",
          color: "#07111f",
          border: "none",
          padding: "14px 20px",
          borderRadius: "12px",
          fontWeight: "700",
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Generating..." : "Generate CV Summary"}
      </button>

      {error ? (
        <p style={{ color: "#ff8a8a", marginTop: "20px" }}>{error}</p>
      ) : null}

      {summary ? (
        <div
          style={{
            marginTop: "24px",
            background: "#121933",
            padding: "24px",
            borderRadius: "16px",
            maxWidth: "900px",
          }}
        >
          <h2>Generated Summary</h2>
          <p style={{ lineHeight: 1.7, fontSize: "18px", whiteSpace: "pre-wrap" }}>
            {summary}
          </p>
        </div>
      ) : null}

      {preview ? (
        <div
          style={{
            marginTop: "24px",
            background: "#10182d",
            padding: "24px",
            borderRadius: "16px",
            maxWidth: "900px",
          }}
        >
          <h2>Extracted Text Preview</h2>
          <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap", fontSize: "14px" }}>
            {preview}
          </p>
        </div>
      ) : null}
    </main>
  );
}
