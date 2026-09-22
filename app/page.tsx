import { ArrowRight, CheckCircle, Mail, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import HolographicOrb from '@/components/HolographicOrb';

export default function LandingPage() {
  const pillars = [
    ['Security boundaries','Authentication and row-level authorization keep user data scoped to the authenticated account.'],
    ['Payment verification','The dashboard is unlocked only after the backend records a successful payment.'],
    ['Human control','Trading remains explicitly gated. Automation is not a promise of profit.'],
  ];
  return <main className="min-h-screen bg-[#030305] text-white overflow-x-hidden">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030305]/80 backdrop-blur-xl border-b border-gray-800/50"><div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3"><div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center"><span className="text-black font-black text-sm">S</span></div><span className="font-bold text-lg">SOLVIX <span className="text-cyan-400 font-light">OS</span></span></div>
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400"><a href="#services">Services</a><a href="#trust">Security</a><a href="#proof">Verification</a><a href="mailto:Solvixfeedback@gmail.com">Support</a></div>
      <Link href="/login" className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-mono font-bold">LAUNCH APP →</Link>
    </div></nav>
    <section id="services" className="relative pt-28"><div className="text-center px-4 relative z-20">
      <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6"><Shield className="w-4 h-4 text-cyan-400"/><span className="text-xs text-cyan-400 font-mono tracking-wider">ZERO-TRUST WORKSPACE</span></div>
      <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-tight">Proof Over Promises.<br/><span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Control Over Chaos.</span></h1>
      <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8">An AI-powered workspace for opportunity discovery and controlled trading workflows. Verified money stays separate from projections.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center px-4"><Link href="/login" className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-xl flex items-center justify-center gap-2">START ONBOARDING <ArrowRight className="w-5 h-5"/></Link><a href="#trust" className="px-8 py-4 bg-gray-900/50 border border-gray-800 rounded-xl font-bold">SEE HOW IT WORKS</a></div>
      <p className="text-xs text-gray-600 font-mono mt-4">Hover the orb to explore the workspace.</p></div><HolographicOrb/></section>
    <section id="proof" className="py-16 px-4 border-t border-gray-800/50"><div className="max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/><span className="text-xs text-green-400 font-mono">VERIFIED REVENUE</span></div>
      <h2 className="text-3xl md:text-4xl font-bold mb-2">Proof belongs in the ledger.</h2><p className="text-gray-400 mb-8">Solvix does not manufacture payout numbers. Revenue is shown only after backend verification.</p>
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8"><CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-4"/><p className="text-gray-300">Verified payouts will appear here when the audit ledger contains confirmed transactions.</p><p className="text-xs text-gray-600 font-mono mt-3">NO SIMULATED EARNINGS · NO FABRICATED USER COUNTS · NO GUARANTEED RETURNS</p></div>
    </div></section>
    <section id="trust" className="py-20 px-4 border-t border-gray-800"><div className="max-w-6xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl md:text-5xl font-bold mb-4">Built around <span className="text-cyan-400">control.</span></h2><p className="text-gray-400 text-lg">Onboarding, payments and dashboard access are designed around server verification.</p></div>
      <div className="grid md:grid-cols-3 gap-6">{pillars.map(([title,desc])=><div key={title} className="bg-gray-900/40 border border-gray-800 rounded-xl p-6"><div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-cyan-500/10 text-cyan-400"><Shield className="w-6 h-6"/></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-gray-400 text-sm leading-relaxed">{desc}</p></div>)}</div>
    </div></section>
    <section className="py-20 px-4 border-t border-gray-800"><div className="max-w-4xl mx-auto text-center"><h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to operate your <span className="text-cyan-400">workspace?</span></h2><p className="text-gray-400 text-lg mb-8">Choose Forex or Jobs, select a plan, complete verified Mobile Money payment, then access the dashboard.</p><Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-black font-bold rounded-xl">BEGIN SECURE ONBOARDING <ArrowRight className="w-5 h-5"/></Link></div></section>
    <footer className="border-t border-gray-800 py-12 px-4 bg-black/30"><div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6"><div><div className="font-bold mb-2">SOLVIX OS</div><p className="text-sm text-gray-500">Opportunity and trading workspace built around proof, control and useful automation.</p></div><div className="text-sm text-gray-400"><a href="mailto:Solvixfeedback@gmail.com" className="flex items-center gap-2"><Mail className="w-4 h-4"/>Solvixfeedback@gmail.com</a><a href="/support" className="block mt-3">Help Center</a></div><p className="text-sm text-gray-600">© 2026 Solvix OS</p></div></footer>
  </main>;
}
