"use client";

import { FormEvent, useState } from "react";

export default function QwenPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/qwen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Qwen request failed");
      setAnswer(data.text || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qwen request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#07111f", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ opacity: 0.65, letterSpacing: 2, fontSize: 12 }}>SOLVIX OS · BRAIN AI</p>
        <h1 style={{ fontSize: 40, margin: "10px 0" }}>Qwen</h1>
        <p style={{ opacity: 0.75 }}>
          Qwen is connected through Vercel AI Gateway and authenticated through Solvix.
        </p>

        <form onSubmit={submit} style={{ marginTop: 28 }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Qwen about Solvix..."
            rows={7}
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.15)",
              background: "#0d1a2b",
              color: "#fff",
              resize: "vertical",
            }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 15,
              borderRadius: 14,
              border: 0,
              background: "#fff",
              color: "#07111f",
              fontWeight: 800,
            }}
          >
            {loading ? "QWEN IS THINKING…" : "ASK QWEN →"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "#2a1111" }}>
            {error}
          </div>
        )}

        {answer && (
          <section style={{ marginTop: 20, padding: 20, borderRadius: 16, background: "#0d1a2b" }}>
            <p style={{ opacity: 0.55, fontSize: 12, letterSpacing: 1 }}>QWEN RESPONSE</p>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{answer}</div>
          </section>
        )}
      </div>
    </main>
  );
}
