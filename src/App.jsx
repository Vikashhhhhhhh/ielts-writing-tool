import { useState, useRef } from "react";

const CRITERIA = [
  { key: "ta", label: "Task Achievement", desc: "Did you fully address the task?" },
  { key: "cc", label: "Coherence & Cohesion", desc: "Is your writing logically organised?" },
  { key: "lr", label: "Lexical Resource", desc: "How varied and accurate is your vocabulary?" },
  { key: "gra", label: "Grammatical Range & Accuracy", desc: "How accurate and varied is your grammar?" },
];

const BAND_COLORS = {
  9: "#0ea66e", 8: "#2c7be5", 7: "#d4a017", 6: "#e07b39", 5: "#c0392b",
};

function getBandColor(score) {
  return score >= 8.5 ? BAND_COLORS[9] : score >= 7.5 ? BAND_COLORS[8] : score >= 6.5 ? BAND_COLORS[7] : score >= 5.5 ? BAND_COLORS[6] : BAND_COLORS[5];
}

function BandCircle({ score, size = 56 }) {
  const color = getBandColor(score);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2.5px solid ${color}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: color + "18", flexShrink: 0,
      boxShadow: `0 0 0 4px ${color}10`,
    }}>
      <span style={{ fontSize: size * 0.36, fontWeight: 700, color, lineHeight: 1, fontFamily: "'Georgia', serif" }}>{score}</span>
      {size > 40 && <span style={{ fontSize: 8, color, opacity: 0.75, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>Band</span>}
    </div>
  );
}

function ScoreBar({ score }) {
  const pct = (score / 9) * 100;
  const color = getBandColor(score);
  return (
    <div style={{ height: 5, background: "#e8e8e8", borderRadius: 3, flex: 1, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function Spinner({ message }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "3rem 0" }}>
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #f0f0f0" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#0ea66e", animation: "spin 0.9s linear infinite" }} />
      </div>
      <p style={{ color: "#888", fontSize: 14, margin: 0, fontStyle: "italic" }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Task Selection Screen ───────────────────────────────────────────────────
function TaskSelector({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #fafafa 0%, #f4f4f2 100%)",
      padding: "2rem", fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: 15, letterSpacing: 4, color: "#0ea66e", fontWeight: 600, textTransform: "uppercase", marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>
          IELTS Writing Evaluator
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400, color: "#1a1a1a", margin: "0 0 12px", lineHeight: 1.2 }}>
          Which task are you<br />practising today?
        </h1>
        <p style={{ fontSize: 15, color: "#888", margin: 0, fontFamily: "system-ui, sans-serif", fontWeight: 400 }}>
          Your feedback will be tailored to the specific criteria
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
        {[
          {
            task: "Task 1",
            title: "Task 1",
            subtitle: "Report",

            words: "150+ words",
          },
          {
            task: "Task 2",
            title: "Task 2",
            subtitle: "Essay",

            words: "250+ words",
          },
        ].map(({ task, title, subtitle, detail, words, icon }) => (
          <button
            key={task}
            onClick={() => onSelect(task)}
            onMouseEnter={() => setHovered(task)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 260, padding: "2rem 1.75rem", textAlign: "left",
              background: hovered === task ? "#fff" : "#fff",
              border: hovered === task ? "2px solid #0ea66e" : "2px solid #e8e8e8",
              borderRadius: 16, cursor: "pointer",
              transform: hovered === task ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hovered === task ? "0 12px 40px rgba(14,166,110,0.15)" : "0 2px 12px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#0ea66e", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, fontFamily: "'Georgia', serif" }}>{subtitle}</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.5 }}>{detail}</div>
            <div style={{ fontSize: 12, color: "#0ea66e", fontWeight: 600, background: "#f0fdf8", padding: "4px 10px", borderRadius: 20, display: "inline-block" }}>
              {words}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Evaluator ──────────────────────────────────────────────────────────
export default function IELTSTool() {
  const [taskType, setTaskType] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [targetBand, setTargetBand] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingExample, setLoadingExample] = useState(false);
  const [exampleAnswer, setExampleAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const wordLimit = taskType === "Task 1" ? 150 : 250;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const wordPct = Math.min((wordCount / wordLimit) * 100, 100);
  const wordColor = wordCount < wordLimit ? "#e07b39" : "#0ea66e";

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = e => setImage(e.target.result);
    reader.readAsDataURL(file);
  }

  async function evaluate() {
    if (!question.trim() || !answer.trim()) {
      setError("Please enter both the question and your answer.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setExampleAnswer("");

    const task1Extra = taskType === "Task 1"
      ? `This is IELTS Writing Task 1. Evaluate based on: accurately describing all key features and trends shown in the data, making meaningful comparisons, avoiding personal opinion, and organising data logically. The student ${image ? "has provided the graph image." : "has described a graph/chart."}`
      : `This is IELTS Writing Task 2. Evaluate based on: presenting a clear position, developing arguments with relevant examples, addressing all parts of the question, and structuring the essay coherently.`;

    const prompt = `You are an expert IELTS examiner. Evaluate the following IELTS Writing ${taskType} answer strictly and accurately.

${task1Extra}

QUESTION:
${question}

STUDENT'S ANSWER:
${answer}

Provide your evaluation ONLY as a valid JSON object with this exact structure (no markdown, no extra text):
{
  "overall": <number 1-9, use 0.5 increments>,
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
      const res = await fetch("http://localhost:3001/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
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
    const prompt = `You are an expert IELTS examiner and tutor. Write a Band ${targetBand} model answer for the following IELTS Writing ${taskType} question. The answer must authentically demonstrate exactly Band ${targetBand} — not higher, not lower.

QUESTION:
${question}

Write ONLY the model answer. No preamble, no labels, no explanation.`;

    try {
      const res = await fetch("http://localhost:3001/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      setExampleAnswer(text);
    } catch {
      setExampleAnswer("Could not generate example. Please try again.");
    }
    setLoadingExample(false);
  }

  // Show task selector first
  if (!taskType) return <TaskSelector onSelect={setTaskType} />;

  const isTask1 = taskType === "Task 1";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fafafa 0%, #f4f4f2 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #e8e8e8", background: "#fff",
        padding: "0 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, letterSpacing: 3, color: "#0ea66e", fontWeight: 700, textTransform: "uppercase" }}>
            IELTS Evaluator
          </span>
          <span style={{ fontSize: 11, background: "#f0fdf8", color: "#0ea66e", padding: "2px 10px", borderRadius: 20, fontWeight: 600, border: "1px solid #c6f0e0" }}>
            {taskType}
          </span>
        </div>
        <button
          onClick={() => { setTaskType(null); setResult(null); setAnswer(""); setQuestion(""); setImage(null); setExampleAnswer(""); }}
          style={{ fontSize: 12, color: "#888", background: "none", border: "1px solid #e8e8e8", borderRadius: 8, padding: "4px 12px", cursor: "pointer" }}
        >
          ← Switch task
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

        {/* Page title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 26, fontWeight: 400, color: "#1a1a1a", margin: "0 0 6px", fontFamily: "'Georgia', serif" }}>
            {isTask1 ? "Describe the visual data" : "Write your essay"}
          </h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
            {isTask1
              ? "Upload the graph or chart, paste the question, then write your answer below."
              : "Paste the essay question, write your answer, and get instant examiner feedback."}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Image upload — Task 1 only */}
          {isTask1 && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 8 }}>
                Graph / Chart image
              </label>
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); }}
                style={{
                  border: `2px dashed ${dragOver ? "#0ea66e" : image ? "#0ea66e" : "#d0d0d0"}`,
                  borderRadius: 12, padding: image ? "0" : "2rem",
                  textAlign: "center", cursor: "pointer",
                  background: dragOver ? "#f0fdf8" : image ? "#000" : "#fafafa",
                  transition: "all 0.2s",
                  overflow: "hidden", position: "relative",
                  minHeight: image ? 200 : "auto",
                }}
              >
                {image ? (
                  <>
                    <img src={image} alt="Graph" style={{ width: "100%", maxHeight: 300, objectFit: "contain", display: "block" }} />
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      background: "rgba(0,0,0,0.6)", color: "#fff",
                      fontSize: 11, padding: "4px 10px", borderRadius: 20,
                    }}>
                      {imageName} · click to change
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                    <p style={{ fontSize: 14, color: "#888", margin: "0 0 4px" }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{ fontSize: 12, color: "#bbb", margin: 0 }}>PNG, JPG, GIF supported</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageFile(e.target.files[0])} />
            </div>
          )}

          {/* Question input */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 8 }}>
              {isTask1 ? "Task question / instructions" : "Essay question"}
            </label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={isTask1
                ? "e.g. The chart below shows the percentage of households with internet access. Summarise the information by selecting and reporting the main features…"
                : "e.g. Some people believe that universities should focus on providing academic knowledge. Others think they should prepare students for working life. Discuss both views…"}
              rows={3}
              style={{
                width: "100%", resize: "vertical", fontSize: 14,
                padding: "12px 14px", boxSizing: "border-box",
                borderRadius: 10, border: "1.5px solid #e0e0e0",
                background: "#fff", color: "#1a1a1a",
                fontFamily: "system-ui, sans-serif", lineHeight: 1.6,
                transition: "border-color 0.2s",
                outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#0ea66e"}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {/* Answer input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Your answer</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Word count bar */}
                <div style={{ width: 80, height: 4, background: "#e8e8e8", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${wordPct}%`, height: "100%", background: wordColor, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 12, color: wordColor, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
                  {wordCount} / {wordLimit}+ words
                </span>
              </div>
            </div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={isTask1
                ? "Write your Task 1 answer here. Describe the main features and make comparisons where relevant…"
                : "Write your essay here. Present your argument clearly with well-developed paragraphs…"}
              rows={12}
              style={{
                width: "100%", resize: "vertical", fontSize: 14,
                padding: "12px 14px", boxSizing: "border-box",
                borderRadius: 10, border: "1.5px solid #e0e0e0",
                background: "#fff", color: "#1a1a1a",
                fontFamily: "'Georgia', serif", lineHeight: 1.8,
                transition: "border-color 0.2s", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#0ea66e"}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
            {wordCount > 0 && wordCount < wordLimit && (
              <p style={{ fontSize: 12, color: "#e07b39", margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                ⚠ Aim for at least {wordLimit} words — you need {wordLimit - wordCount} more
              </p>
            )}
          </div>

          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>⚠ {error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={evaluate}
            disabled={loading}
            style={{
              alignSelf: "flex-start", padding: "12px 28px",
              fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              background: loading ? "#ccc" : "#0ea66e",
              color: "#fff", border: "none", borderRadius: 10,
              boxShadow: loading ? "none" : "0 4px 16px rgba(14,166,110,0.3)",
              transform: loading ? "none" : "translateY(0)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; }}
          >
            {loading ? "Evaluating…" : `Evaluate my ${taskType} ↗`}
          </button>
        </div>

        {loading && <Spinner message={`Analysing your ${taskType} answer…`} />}

        {/* Results */}
        {result && (
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", animation: "fadeUp 0.5s ease" }}>
            <style>{`
              @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
              <span style={{ fontSize: 11, color: "#bbb", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Examiner Feedback</span>
              <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
            </div>

            {/* Overall score */}
            <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 14, padding: "1.5rem", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <BandCircle score={result.overall} size={76} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 2 }}>Overall Band Score</p>
                <p style={{ fontSize: 16, color: "#1a1a1a", margin: 0, lineHeight: 1.5, fontFamily: "'Georgia', serif" }}>{result.summary}</p>
              </div>
            </div>

            {/* Strengths & errors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#f0fdf8", border: "1.5px solid #c6f0e0", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#0ea66e", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1.5 }}>✓ Strengths</p>
                {result.strengths?.map((s, i) => (
                  <p key={i} style={{ fontSize: 13, color: "#1a5c3a", margin: "0 0 7px", paddingLeft: 10, borderLeft: "2px solid #0ea66e", lineHeight: 1.5 }}>{s}</p>
                ))}
              </div>
              <div style={{ background: "#fff8f5", border: "1.5px solid #fdd", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#e07b39", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1.5 }}>✗ Key errors</p>
                {result.key_errors?.map((e, i) => (
                  <p key={i} style={{ fontSize: 13, color: "#7a2e0e", margin: "0 0 7px", paddingLeft: 10, borderLeft: "2px solid #e07b39", lineHeight: 1.5 }}>{e}</p>
                ))}
              </div>
            </div>

            {/* Criteria breakdown */}
            <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 14, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", margin: "0 0 1.25rem", textTransform: "uppercase", letterSpacing: 2 }}>Criteria Breakdown</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {CRITERIA.map(c => (
                  <div key={c.key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <BandCircle score={result[c.key]} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{c.label}</span>
                          <ScoreBar score={result[c.key]} />
                        </div>
                        <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{c.desc}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#555", margin: "0 0 0 50px", lineHeight: 1.65, background: "#fafafa", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #e8e8e8" }}>
                      {result[`${c.key}_feedback`]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model answer generator */}
            <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 14, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 2 }}>Model Answer Generator</p>
              <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px", lineHeight: 1.5 }}>
                See what a Band 7–9 answer looks like for this exact question.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>Target band:</span>
                {[7, 7.5, 8, 8.5, 9].map(b => (
                  <button
                    key={b}
                    onClick={() => setTargetBand(b)}
                    style={{
                      padding: "6px 14px", fontSize: 13,
                      fontWeight: targetBand === b ? 700 : 400,
                      background: targetBand === b ? "#0ea66e" : "#fff",
                      color: targetBand === b ? "#fff" : "#555",
                      border: `1.5px solid ${targetBand === b ? "#0ea66e" : "#e0e0e0"}`,
                      cursor: "pointer", borderRadius: 8,
                      transition: "all 0.15s",
                    }}
                  >
                    {b}
                  </button>
                ))}
                <button
                  onClick={generateExample}
                  disabled={loadingExample}
                  style={{
                    marginLeft: "auto", padding: "8px 20px", fontSize: 13,
                    fontWeight: 600, cursor: loadingExample ? "not-allowed" : "pointer",
                    opacity: loadingExample ? 0.6 : 1,
                    background: "#1a1a1a", color: "#fff",
                    border: "none", borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "all 0.2s",
                  }}
                >
                  {loadingExample ? "Writing…" : `Generate Band ${targetBand} ↗`}
                </button>
              </div>

              {loadingExample && (
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #e8e8e8", borderTopColor: "#2c7be5", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>Writing a Band {targetBand} answer…</span>
                </div>
              )}

              {exampleAnswer && (
                <div style={{ marginTop: 20, borderTop: "1px solid #f0f0f0", paddingTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <BandCircle score={targetBand} size={32} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>Band {targetBand} model answer</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#333", lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0, fontFamily: "'Georgia', serif", background: "#fafafa", padding: "1.25rem", borderRadius: 10 }}>
                    {exampleAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
