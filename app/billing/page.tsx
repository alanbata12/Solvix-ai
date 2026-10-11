"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

function BillingContent() {
  const q = useSearchParams(), router = useRouter(), job = q.get("job") || "", vertical = q.get("vertical");
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

  if (vertical === "FOREX" || vertical === "AIL") {
    const label = vertical === "FOREX" ? "Forex Agents" : "AIL Hunter";
    return (
      <main className="min-h-screen bg-[#050508] text-white p-4 md:p-8">
        <section className="max-w-xl mx-auto bg-white/5 border border-emerald-400/20 rounded-3xl p-6 md:p-8">
          <p className="text-xs font-mono tracking-widest text-emerald-300">SOLVIX · VERTICAL ACCESS</p>
          <h1 className="text-3xl font-bold mt-2">{label} access</h1>
          <p className="text-gray-300 mt-3">This workspace requires an active access record for your account. Stripe checkout and subscription provisioning are intentionally not connected yet.</p>
          <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/10">
            <p className="text-xs text-gray-500">REQUESTED VERTICAL</p>
            <p className="font-mono text-sm mt-1">{vertical}</p>
            <p className="text-sm text-amber-200 mt-3">Payment is not being requested on this screen. No charge will be made.</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button className="btn primary" onClick={() => router.push("/dashboard")}>Back to dashboard</button>
            <button className="btn" onClick={() => router.push("/jobs")}>Open opportunities</button>
          </div>
          <p className="text-xs text-gray-500 mt-6">When billing is implemented, access will be granted only after the server verifies the payment provider event.</p>
        </section>
      </main>
    );
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
