"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Job = {
  id: string;
  title: string;
  client_region: string | null;
  expected_payout_usd: number | null;
  lead_price_usd: number | null;
  difficulty: string | null;
  required_skills: string[] | null;
  source_name: string | null;
};

export default function JobsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("job_leads")
        .select("id,title,client_region,expected_payout_usd,lead_price_usd,difficulty,required_skills,source_name")
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .limit(20);
      setJobs((data || []) as Job[]);
      setLoading(false);
    })();
  }, []);

  return <main className="min-h-screen bg-[#050508] text-white p-4 md:p-8">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-mono tracking-widest text-violet-400">SOLVIX JOB MARKET</p>
        <h1 className="text-3xl md:text-5xl font-bold mt-2">Jobs & Paychecks</h1>
        <p className="text-gray-400 mt-3">Review the work and expected paycheck first. Billing appears only after you select a job.</p>
      </div>

      {loading ? <p className="text-gray-500">Loading verified jobs…</p> :
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map(job => <button key={job.id} onClick={() => setSelected(job)} className="text-left p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-violet-400/50">
          <div className="flex justify-between gap-3"><span className="text-xs text-gray-500">{job.client_region || "GLOBAL"}</span><span className="text-xs text-green-400">VERIFIED</span></div>
          <h2 className="text-xl font-bold mt-3">{job.title}</h2>
          <p className="text-xs text-gray-500 mt-2">{job.source_name || "Verified opportunity"}</p>
          <div className="mt-5 flex justify-between">
            <span className="text-gray-400">Paycheck</span>
            <strong className="text-violet-300">{job.expected_payout_usd == null ? "Not stated" : "$" + Number(job.expected_payout_usd).toLocaleString()}</strong>
          </div>
          <p className="text-xs text-gray-500 mt-2">Select to view details and billing</p>
        </button>)}
        {!jobs.length && <p className="text-gray-500">No verified jobs are currently available.</p>}
      </div>}

      {selected && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelected(null)}>
        <section className="w-full max-w-lg bg-[#0b0b12] border border-violet-400/30 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
          <p className="text-xs font-mono text-violet-400">JOB SELECTED</p>
          <h2 className="text-2xl font-bold mt-2">{selected.title}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="p-4 bg-black/40 rounded-xl"><p className="text-xs text-gray-500">EXPECTED PAYCHECK</p><p className="text-xl font-bold text-green-400">{selected.expected_payout_usd == null ? "Not stated" : "$" + Number(selected.expected_payout_usd).toLocaleString()}</p></div>
            <div className="p-4 bg-black/40 rounded-xl"><p className="text-xs text-gray-500">JOB ACCESS / BILLING</p><p className="text-xl font-bold text-violet-300">{selected.lead_price_usd == null ? "Price at checkout" : "$" + Number(selected.lead_price_usd).toLocaleString()}</p></div>
          </div>
          <p className="text-sm text-gray-400 mt-5">You are not charged by opening or reviewing this job. Continue only when you are ready to confirm the billing.</p>
          <div className="flex gap-3 mt-6">
            <button className="btn" onClick={() => setSelected(null)}>BACK</button>
            <button className="btn primary flex-1" onClick={() => router.push("/billing?job=" + encodeURIComponent(selected.id))}>CONTINUE TO BILLING →</button>
          </div>
        </section>
      </div>}
    </div>
  </main>;
}
