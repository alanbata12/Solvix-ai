"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

function BillingContent() {
  const q = useSearchParams(), router = useRouter(), job = q.get("job") || "";
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn");
  const [phone, setPhone] = useState(""), [loading, setLoading] = useState(false), [error, setError] = useState("");

  async function confirmBilling(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    if (!job) { setError("No job was selected."); setLoading(false); return; }

    // The server must calculate the final charge from the job ID.
    // Never trust a price supplied by the browser.
    const { data, error } = await supabase.functions.invoke("solvix-job-billing", {
      body: { job_id: job, provider, phone, confirm: true }
    });
    if (error || data?.error) {
      setError(error?.message || data?.error || "Billing could not be started.");
      setLoading(false); return;
    }
    router.push("/jobs/" + encodeURIComponent(job) + "/status?tx=" + encodeURIComponent(data.tx_ref || ""));
  }

  return <main className="min-h-screen bg-[#050508] text-white p-4 md:p-8">
    <section className="max-w-xl mx-auto bg-white/5 border border-violet-400/20 rounded-3xl p-6 md:p-8">
      <p className="text-xs font-mono tracking-widest text-violet-400">STEP 2 · BILLING</p>
      <h1 className="text-3xl font-bold mt-2">Confirm job billing</h1>
      <p className="text-gray-400 mt-3">You already reviewed the job and paycheck. Billing is requested only now, after your explicit confirmation.</p>
      <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/10"><p className="text-xs text-gray-500">SELECTED JOB</p><p className="font-mono text-sm mt-1">{job}</p></div>
      <form onSubmit={confirmBilling} className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={"btn " + (provider === "mtn" ? "primary" : "")} onClick={() => setProvider("mtn")}>MTN MoMo</button>
          <button type="button" className={"btn " + (provider === "airtel" ? "primary" : "")} onClick={() => setProvider("airtel")}>Airtel Money</button>
        </div>
        <input className="input" type="tel" placeholder="077X XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} required />
        <button className="btn primary w-full" disabled={loading}>{loading ? "STARTING SECURE BILLING…" : "CONFIRM & PAY FOR JOB →"}</button>
      </form>
      {error && <p className="error mt-4">{error}</p>}
      <p className="text-xs text-gray-600 mt-6">Opening a job never charges you. The backend must verify the selected job, calculate its price, and record payment before execution is unlocked.</p>
    </section>
  </main>;
}

export default function Billing() {
  return <Suspense fallback={<main className="min-h-screen bg-[#050508] text-white p-6"><p>Loading billing…</p></main>}><BillingContent /></Suspense>;
}
