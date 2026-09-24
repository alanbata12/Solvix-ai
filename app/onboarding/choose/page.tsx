"use client";

import { useRouter } from "next/navigation";

export default function Choose() {
  const router = useRouter();

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">STEP 01 / 02</p>
        <h1 className="title">Choose your operating path.</h1>
        <p className="muted">
          Browse the work and paycheck first. Billing happens only after you select a job or opportunity.
        </p>

        <div className="grid2" style={{ marginTop: 28 }}>
          <button
            className="card"
            style={{ textAlign: "left", cursor: "pointer", color: "white" }}
            onClick={() => router.push("/jobs")}
          >
            <h2>▣ Opportunity Engine</h2>
            <p className="muted">See verified jobs and their expected paychecks before any billing.</p>
            <b style={{ color: "var(--cyan)" }}>VIEW JOBS →</b>
          </button>

          <button
            className="card"
            style={{ textAlign: "left", cursor: "pointer", color: "white" }}
            onClick={() => router.push("/forex")}
          >
            <h2>↗ Forex Control Room</h2>
            <p className="muted">Review market opportunities and projected outcomes before billing or execution.</p>
            <b style={{ color: "#c4b5fd" }}>VIEW FOREX →</b>
          </button>
        </div>
      </section>
    </main>
  );
}
