import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px 72px",
        color: "#f8fafc",
        background:
          "linear-gradient(180deg, #0b1220 0%, #081018 100%)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 24,
          }}
        >
          <section
            style={{
              padding: 28,
              borderRadius: 28,
              border: "1px solid rgba(148, 163, 184, 0.16)",
              background: "rgba(15, 23, 42, 0.88)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: 18,
                padding: "10px 16px",
                borderRadius: 999,
                background: "rgba(96, 165, 250, 0.14)",
                color: "#dbeafe",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Upload → Pay → Receive instantly
            </div>

            <h1
              style={{
                margin: "0 0 18px",
                fontSize: 64,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                fontWeight: 800,
              }}
            >
              Automatic CV rewriting that sells itself in one page.
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: "#dbe4f0",
                fontSize: 22,
                lineHeight: 1.7,
              }}
            >
              Visitors upload a resume, pay online, and receive an AI-generated
              career package with an improved CV, ATS report, cover letter, and
              LinkedIn summary.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
              <Link
                href="/resume-rewrite"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 190,
                  padding: "16px 24px",
                  borderRadius: 18,
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 18,
                  background: "linear-gradient(135deg, #7dd3fc 0%, #60a5fa 100%)",
                  color: "#081018",
                }}
              >
                Start My CV Rewrite
              </Link>

              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 190,
                  padding: "16px 24px",
                  borderRadius: 18,
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 18,
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                  background: "rgba(15, 23, 42, 0.66)",
                  color: "#f8fafc",
                }}
              >
                See pricing
              </Link>
            </div>
          </section>

          <aside
            style={{
              padding: 24,
              borderRadius: 28,
              border: "1px solid rgba(148, 163, 184, 0.16)",
              background: "rgba(15, 23, 42, 0.88)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 6 }}>
                AUTOMATION FLOW
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
                100%
              </div>
              <p style={{ margin: 0, color: "#dbe4f0", lineHeight: 1.6, fontSize: 15 }}>
                Upload file → pay → AI process → result page + downloads delivered.
              </p>
            </div>

            <div style={{ marginBottom: 18, paddingTop: 18, borderTop: "1px solid rgba(148, 163, 184, 0.12)" }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 6 }}>
                AVERAGE TARGET
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
                2-3 orders/day
              </div>
              <p style={{ margin: 0, color: "#dbe4f0", lineHeight: 1.6, fontSize: 15 }}>
                Enough to move toward several thousand AED monthly depending on pricing and conversion.
              </p>
            </div>

            <div style={{ paddingTop: 18, borderTop: "1px solid rgba(148, 163, 184, 0.12)" }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 6 }}>
                BEST FOR
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
                Job seekers
              </div>
              <p style={{ margin: 0, color: "#dbe4f0", lineHeight: 1.6, fontSize: 15 }}>
                Especially Gulf job seekers wanting a stronger ATS-ready CV package fast.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
