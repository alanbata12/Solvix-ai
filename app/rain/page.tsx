"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Wallet } from "lucide-react";

const drops = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  delay: (i % 12) * 0.13,
  duration: 2.2 + (i % 5) * 0.35,
  size: 16 + (i % 4) * 7,
}));

export default function RainModePage() {
  const [raining, setRaining] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] px-4 py-6 text-white md:px-8">
      <style jsx global>{`
        @keyframes solvix-dollar-fall {
          0% { transform: translate3d(0,-12vh,0) rotate(-15deg); opacity: 0; }
          12% { opacity: .9; }
          100% { transform: translate3d(28px,112vh,0) rotate(360deg); opacity: 0; }
        }
        .solvix-dollar { position: absolute; top: -12vh; color: #a3e635; font-weight: 900; text-shadow: 0 0 18px rgba(163,230,53,.3); animation-name: solvix-dollar-fall; animation-timing-function: linear; animation-iteration-count: infinite; pointer-events: none; }
      `}</style>

      {raining && <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {drops.map((drop) => <span key={drop.id} className="solvix-dollar" style={{ left: drop.left + "%", fontSize: drop.size + "px", animationDelay: drop.delay + "s", animationDuration: drop.duration + "s" }}>$</span>)}
      </div>}

      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>

        <section className="mt-8 rounded-3xl border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-white/[.04] to-transparent p-6 shadow-2xl md:p-10">
          <div className="flex items-center gap-2 text-xs font-mono tracking-[.2em] text-lime-300"><Sparkles className="h-4 w-4" /> SOLVIX · RAIN MODE</div>
          <p className="mt-8 text-xs font-mono tracking-widest text-gray-400">SIMULATED DEMO BALANCE · NOT REAL FUNDS</p>
          <div className="mt-3 break-words text-5xl font-black tracking-tight md:text-7xl">$5,000,000<span className="text-2xl text-lime-300 md:text-4xl">.00</span></div>
          <div className="mt-5 flex items-center gap-2 text-sm text-gray-400"><Wallet className="h-4 w-4" /> USD · Demo credits only · No bank or mobile-money connection</div>

          <button onClick={() => setRaining((value) => !value)} className="mt-9 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-lime-300 px-6 py-4 text-base font-black text-black transition hover:bg-lime-200 sm:w-auto">
            <Sparkles className="h-5 w-5" /> {raining ? "STOP THE RAIN" : "MAKE IT RAIN $"}
          </button>
          <p className="mt-4 text-xs text-gray-500">{raining ? "Visual celebration active. The demo balance is unchanged." : "Start the visual dollar-rain celebration."}</p>
        </section>

        <section className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-gray-400">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-lime-300" />
          <p>This is a visual Solvix demo mode. It does not create a financial ledger entry, represent earned revenue, or enable withdrawal, transfer, or Airtel Money payout. Verified funds remain separate in the real wallet.</p>
        </section>
      </div>
    </main>
  );
}
