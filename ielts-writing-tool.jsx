import { useState } from "react";

const CRITERIA = [
  { key: "ta", label: "Task Achievement", icon: "✦" },
  { key: "cc", label: "Coherence & Cohesion", icon: "◈" },
  { key: "lr", label: "Lexical Resource", icon: "◇" },
  { key: "gra", label: "Grammatical Range & Accuracy", icon: "○" },
];

const BAND_COLORS = {
  9: "#1D9E75", 8: "#378ADD", 7: "#BA7517", 6: "#D85A30", 5: "#A32D2D",
};

function BandCircle({ score, size = 56 }) {
  const color = score >= 8.5 ? BAND_COLORS[9] : score >= 7.5 ? BAND_COLORS[8] : score >= 6.5 ? BAND_COLORS[7] : score >= 5.5 ? BAND_COLORS[6] : BAND_COLORS[5];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}`, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: color + "15", flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.35, fontWeight: 600, color, lineHeight: 1 }}>{score}</span>
      {size > 40 && <span style={{ fontSize: 9, color, opacity: 0.8, letterSpacing: 1 }}>BAND</span>}
    </div>
  );
}

function ScoreBar({ score }) {
  const pct = (score / 9) * 100;
  const color = score >= 8.5 ? BAND_COLORS[9] : score >= 7.5 ? BAND_COLORS[8] : score >= 6.5 ? BAND_COLORS[7] : score >= 5.5 ? BAND_COLORS[6] : BAND_COLORS[5];
  return (
    <div style={{ height: 4, background: "var(--color-border-tertiary)", borderRadius: 2, flex: 1 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 1s ease" }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "3rem 0" }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "2px solid var(--color-border-tertiary)",
        borderTopColor: "#1D9E75",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, margin: 0 }}>Evaluating your writing…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function IELTSTool() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [targetBand, setTargetBand] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingExample, setLoadingExample] = useState(false);
  const [exampleAnswer, setExampleAnswer] = useState("");

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  async function evaluate() {
    if (!question.trim() || !answer.trim()) {
      setError("Please enter both the question and your answer.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setExampleAnswer("");

    const prompt = `You are an expert IELTS examiner. Evaluate the following IELTS Writing Task answer strictly and accurately.

QUESTION:
${question}

STUDENT'S ANSWER:
${answer}

Provide your evaluation ONLY as a valid JSON object with this exact structure (no markdown, no extra text):
{
  "overall": <number 1-9, can use 0.5 increments>,
  "ta": <number 1-9>,
  "cc": <number 1-9>,
  "lr": <number 1-9>,
  "gra": <number 1-9>,
  "ta_feedback": "<2-3 specific improvement suggestions for Task Achievement>",
  "cc_feedback": "<2-3 specific improvement suggestions for Coherence & Cohesion>",
  "lr_feedback": "<2-3 specific improvement suggestions for Lexical Resource>",
  "gra_feedback": "<2-3 specific improvement suggestions for Grammatical Range & Accuracy>",
  "summary": "<1 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "key_errors": ["<error 1>", "<error 2>", "<error 3>"]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function generateExample() {
    setLoadingExample(true);
    setExampleAnswer("");
    const prompt = `You are an expert IELTS examiner and tutor. Write a Band ${targetBand} model answer for the following IELTS Writing question. The answer must authentically demonstrate exactly Band ${targetBand} level — not higher, not lower. Include natural characteristics of that band level.

QUESTION:
${question}

Write ONLY the model answer with no preamble, no labels, no explanation. Just the essay itself.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setExampleAnswer(text);
    } catch {
      setExampleAnswer("Could not generate example. Please try again.");
    }
    setLoadingExample(false);
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 0 4rem", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>
        IELTS Writing Evaluator
      </h2>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 2rem" }}>
        Paste your question and answer — get instant band scores and examiner feedback.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
            Question / Task prompt
          </label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Paste the IELTS writing question here…"
            rows={3}
            style={{ width: "100%", resize: "vertical", fontSize: 14, padding: "10px 12px", boxSizing: "border-box", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
              Your answer
            </label>
            <span style={{ fontSize: 12, color: wordCount < 150 ? "#D85A30" : "var(--color-text-secondary)" }}>
              {wordCount} words {wordCount < 150 ? "— aim for 150+" : ""}
            </span>
          </div>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write or paste your IELTS answer here…"
            rows={10}
            style={{ width: "100%", resize: "vertical", fontSize: 14, padding: "10px 12px", boxSizing: "border-box", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1.7 }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: 0 }}>{error}</p>
        )}

        <button
          onClick={evaluate}
          disabled={loading}
          style={{ alignSelf: "flex-start", padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Evaluating…" : "Evaluate my writing ↗"}
        </button>
      </div>

      {loading && <Spinner />}

      {result && (
        <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.4s ease", }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Overall score */}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <BandCircle score={result.overall} size={72} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>Overall band score</p>
                <p style={{ fontSize: 15, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>{result.summary}</p>
              </div>
            </div>
          </div>

          {/* Strengths & errors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#1D9E75", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Strengths</p>
              {result.strengths?.map((s, i) => (
                <p key={i} style={{ fontSize: 13, color: "var(--color-text-primary)", margin: "0 0 6px", paddingLeft: 12, borderLeft: "2px solid #1D9E75" }}>{s}</p>
              ))}
            </div>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#D85A30", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Key errors</p>
              {result.key_errors?.map((e, i) => (
                <p key={i} style={{ fontSize: 13, color: "var(--color-text-primary)", margin: "0 0 6px", paddingLeft: 12, borderLeft: "2px solid #D85A30" }}>{e}</p>
              ))}
            </div>
          </div>

          {/* Criteria breakdown */}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Criteria breakdown</p>
            {CRITERIA.map(c => (
              <div key={c.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <BandCircle score={result[c.key]} size={36} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>{c.label}</span>
                  <ScoreBar score={result[c.key]} />
                </div>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 0 46px", lineHeight: 1.6 }}>
                  {result[`${c.key}_feedback`]}
                </p>
              </div>
            ))}
          </div>

          {/* Example answer generator */}
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 1 }}>Model answer generator</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>
              See what a Band 7, 8, or 9 answer looks like for this exact question.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>Target band:</span>
              {[7, 7.5, 8, 8.5, 9].map(b => (
                <button
                  key={b}
                  onClick={() => setTargetBand(b)}
                  style={{
                    padding: "6px 14px", fontSize: 13, fontWeight: targetBand === b ? 500 : 400,
                    background: targetBand === b ? "var(--color-background-secondary)" : "transparent",
                    border: targetBand === b ? "0.5px solid var(--color-border-primary)" : "0.5px solid var(--color-border-tertiary)",
                    cursor: "pointer", borderRadius: "var(--border-radius-md)",
                  }}
                >
                  {b}
                </button>
              ))}
              <button
                onClick={generateExample}
                disabled={loadingExample}
                style={{ marginLeft: "auto", padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: loadingExample ? "not-allowed" : "pointer", opacity: loadingExample ? 0.6 : 1 }}
              >
                {loadingExample ? "Generating…" : `Generate Band ${targetBand} ↗`}
              </button>
            </div>

            {loadingExample && (
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--color-border-tertiary)", borderTopColor: "#378ADD", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Writing a Band {targetBand} answer…</span>
              </div>
            )}

            {exampleAnswer && (
              <div style={{ marginTop: 20, borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <BandCircle score={targetBand} size={32} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Band {targetBand} model answer</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
                  {exampleAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
