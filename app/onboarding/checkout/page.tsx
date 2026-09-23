"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CheckoutContent() {
  const q = useSearchParams(), r = useRouter(), s = createClient(), plan = q.get("plan") || "Momentum", price = Number(q.get("price") || 150000), path = q.get("path") === "jobs" ? "jobs" : "forex";
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn"), [phone, setPhone] = useState(""), [loading, setLoading] = useState(false), [msg, setMsg] = useState(""), [error, setError] = useState("");
  async function pay(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const { data: { session } } = await s.auth.getSession();
    if (!session) { r.push("/login"); return; }
    const { data, error } = await s.functions.invoke("solvix-onboarding-payment", { body: { plan, price, path, provider, phone } });
    if (error || data?.error) { setError(error?.message || data?.error || "Payment could not be started."); setLoading(false); return; }
    setMsg("Mobile Money prompt sent. Waiting for payment verification…");
    const ref = data.tx_ref; let n = 0;
    const timer = setInterval(async () => {
      n++;
      const { data: p } = await s.from("onboarding_payments").select("status").eq("tx_ref", ref).maybeSingle();
      if (p?.status === "successful") { clearInterval(timer); r.push("/dashboard"); r.refresh(); }
      if (p?.status === "failed" || n >= 30) { clearInterval(timer); setLoading(false); if (p?.status === "failed") setError("Payment failed. Please retry."); }
    }, 3000);
  }
  return <main className="shell"><section className="panel narrow"><p className="eyebrow">STEP 03 / 03</p><h1 className="title">Secure checkout.</h1><div className="row" style={{margin:"20px 0"}}><span className="muted">{plan} · {path.toUpperCase()}</span><b className="mono">{price.toLocaleString()} UGX</b></div><form onSubmit={pay} className="stack"><div className="grid2"><button type="button" className="btn" onClick={() => setProvider("mtn")}>MTN MoMo</button><button type="button" className="btn" onClick={() => setProvider("airtel")}>Airtel Money</button></div><input className="input" type="tel" placeholder="077X XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} required/><button className="btn primary" disabled={loading}>{loading ? "AWAITING MOBILE MONEY…" : "PAY & UNLOCK →"}</button></form>{msg && <div className="success" style={{marginTop:14}}>{msg}</div>}{error && <div className="error" style={{marginTop:14}}>{error}</div>}<p className="muted mono" style={{fontSize:10,marginTop:18}}>Access is granted only after server-side payment verification.</p></section></main>;
}

export default function Checkout() {
  return <Suspense fallback={<main className="shell"><section className="panel narrow"><p className="muted">Loading checkout…</p></section></main>}><CheckoutContent /></Suspense>;
}
