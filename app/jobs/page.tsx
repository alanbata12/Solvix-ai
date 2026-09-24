"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Job = {
  id: string;
  title: string;
  reward: number | null;
  currency: string | null;
  active: boolean;
  source_name: string | null;
  source_url: string | null;
  expected_payout_usd?: number | null;
  difficulty?: string | null;
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

      const { data: leads } = await supabase
        .from("job_leads")
        .select("id,title,client_region,expected_payout_usd,difficulty,source_name,source_url,is_verified")
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (leads?.length) {
        setJobs(leads.map((l: any) => ({
          id: l.id,
          title: l.title,
          reward: l.expected_payout_usd,
          currency: l.expected_payout_usd == null ? null : "USD",
          active: true,
          source_name: l.source_name,
          source_url: l.source_url,
          expected_payout_usd: l.expected_payout_usd,
          difficulty: l.difficulty
        })));
      } else {
        const { data } = await supabase
          .from("earning_opportunities")
          .select("id,title,reward,currency,active,source_name,source_url,created_at")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(20);
        setJobs((data || []) as Job[]);
      }
      setLoading(false);
    })();
  }, []);

  return <main className="min-h-screen bg-[#050508] text-white p-4 md:p-8">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-mono tracking-widest text-gray-400">SOLVIX JOB LEADS</p>
        <h1 className="text-3xl md:text-5xl font-bold mt-2">Jobs & Paychecks</h1>
        <p className="text-gray-400 mt-3">Review the sourced job and its payout information first. Billing appears only after you select an opportunity.</p>
      </div>

      {loading ? <p className="text-gray-500">Loading sourced jobs…</p> :
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map(job => <button key={job.id} onClick={() => setSelected(job)} className="text-left p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/30">
          <div className="flex justify-between gap-3"><span className="text-xs text-gray-500">GLOBAL</span><span className="text-xs text-green-400">SOURCE LINKED</span></div>
          <h2 className="text-xl font-bold mt-3">{job.title}</h2>
          <p className="text-xs text-gray-500 mt-2">{job.source_name || "Opportunity source"}</p>
          <div className="mt-5 flex justify-between">
            <span className="text-gray-400">Listed payout</span>
            <strong className="text-white">{job.reward == null ? "Not stated" : Number(job.reward).toLocaleString() + " " + (job.currency || "")}</strong>
          </div>
          <p className="text-xs text-gray-500 mt-2">{job.difficulty || "Review requirements"} · Select to view details</p>
        </button>)}
        {!jobs.length && <p className="text-gray-500">No sourced job leads are currently available.</p>}
      </div>}

      {selected && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelected(null)}>
        <section className="w-full max-w-lg bg-[#0b0b12] border border-white/15 rounded-3xl p-6" onClick={e => e.stopPropagation()}>
          <p className="text-xs font-mono text-gray-400">JOB LEAD SELECTED</p>
          <h2 className="text-2xl font-bold mt-2">{selected.title}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="p-4 bg-black/40 rounded-xl"><p className="text-xs text-gray-500">LISTED PAYOUT</p><p className="text-xl font-bold text-green-400">{selected.reward == null ? "Not stated" : Number(selected.reward).toLocaleString() + " " + (selected.currency || "")}</p></div>
            <div className="p-4 bg-black/40 rounded-xl"><p className="text-xs text-gray-500">SOURCE</p><p className="text-sm font-bold text-white">{selected.source_name || "External source"}</p></div>
          </div>
          <p className="text-sm text-gray-400 mt-5">Opening a job does not charge you. Review the external source and requirements before continuing.</p>
          <div className="flex gap-3 mt-6">
            <button className="btn" onClick={() => setSelected(null)}>BACK</button>
            {selected.source_url && <a className="btn primary flex-1 text-center" href={selected.source_url} target="_blank" rel="noreferrer">OPEN SOURCE →</a>}
          </div>
        </section>
      </div>}
    </div>
  </main>;
}
