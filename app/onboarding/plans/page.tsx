"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PLANS } from "@/lib/plans";

function PlansContent() {
  const q = useSearchParams(), r = useRouter(), path = q.get("path") === "jobs" ? "jobs" : "forex";
  return <main className="shell"><section className="panel"><p className="eyebrow">STEP 02 / 03</p><h1 className="title">Select your {path === "forex" ? "trading" : "opportunity"} tier.</h1><p className="muted">Payment is required before the dashboard is unlocked.</p><div className="grid3" style={{marginTop:28}}>{PLANS.map(p => <article className="card" key={p.name}><p className="eyebrow">{p.name.toUpperCase()}</p><div className="big">{p.price.toLocaleString()} <span style={{fontSize:11}}>UGX / MONTH</span></div><ul className="muted">{p.features.map(f => <li key={f}>{f}</li>)}</ul><button className="btn" style={{marginTop:20}} onClick={() => r.push("/onboarding/checkout?plan=" + p.name + "&price=" + p.price + "&path=" + path)}>SELECT {p.name.toUpperCase()}</button></article>)}</div></section></main>;
}

export default function Plans() {
  return <Suspense fallback={<main className="shell"><section className="panel"><p className="muted">Loading plans…</p></section></main>}><PlansContent /></Suspense>;
}
