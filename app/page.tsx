import { ArrowRight, CheckCircle, Mail, Globe, Shield, Target, TrendingUp, Users, Wallet, Smartphone, CandlestickChart } from 'lucide-react';
import Link from 'next/link';

const marketTargets = [
  ['93%', 'Target strategy win-rate benchmark', 'Not a live or guaranteed performance claim'],
  ['$15M+', 'Long-term global payout target', 'Aspirational market objective'],
  ['4', 'Planned flagship agents', 'Fleet target, not current live count'],
  ['2,847+', 'User adoption target', 'Growth objective, not current users'],
  ['$142M+', 'Cumulative payout vision', 'Long-term target, not verified payouts'],
  ['98.7%', 'Uptime objective', 'Engineering target, not measured current uptime'],
];

const agentTargets = [
  ['Sentinel', 'Asian', '74.5%', '$29/mo'],
  ['Vanguard', 'European', '81.2%', '$79/mo'],
  ['Apex', 'American', '86.8%', '$149/mo'],
  ['Omni', '24/7 Crypto + Forex', '91.5%', '$299/mo'],
];

const forexBars = [24, 38, 31, 52, 44, 68, 57, 76, 64, 88, 72, 94];

export default function LandingPage() {
  return <main className="min-h-screen bg-[#030305] text-white overflow-x-hidden">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030305]/90 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center"><span className="text-black font-black text-sm">S</span></div>
          <span className="font-black text-lg">SOLVIX <span className="text-white">OS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white font-semibold">
          <a href="#services">Services</a><a href="#targets">Market Targets</a><a href="#trust">Security</a><a href="mailto:Solvixfeedback@gmail.com">Support</a>
        </div>
        <Link href="/login" className="px-6 py-3 bg-white text-black border border-white rounded-lg text-sm font-black shadow-lg uppercase">BEGIN SECURE ONBOARDING →</Link>
      </div>
    </nav>

    <section id="services" className="relative pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-white"/><span className="text-xs text-white font-mono tracking-wider">GLOBAL · ZERO-TRUST WORKSPACE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-5 leading-[1.02]">Proof Over Promises.<br/><span className="text-white">Control Over Chaos.</span></h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl mb-8">A global workspace for multi-currency opportunity management and controlled trading workflows. Verified money stays separate from projections and market targets.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="px-8 py-5 bg-white text-black font-black text-base rounded-xl flex items-center justify-center gap-2 shadow-xl uppercase">BEGIN SECURE ONBOARDING <ArrowRight className="w-5 h-5"/></Link>
              <a href="#targets" className="px-8 py-5 bg-transparent border border-white/30 rounded-xl font-bold text-white text-center">VIEW MARKET STRATEGY</a>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[#0a0a0d] border border-white/15 rounded-3xl p-5 md:p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white font-mono tracking-widest">FOREX CONTROL ROOM</p>
                  <h2 className="text-2xl font-black mt-1">Money from your phone.</h2>
                </div>
                <div className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center"><Smartphone className="w-6 h-6 text-white"/></div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
                <div className="flex items-center justify-between mb-5">
                  <div><p className="text-xs text-gray-400">EUR/USD</p><p className="text-2xl font-black text-white">1.1742</p></div>
                  <div className="text-right"><p className="text-xs text-gray-400">LIVE FEED</p><p className="text-xs font-bold text-white">LOCKED UNTIL VERIFIED</p></div>
                </div>
                <div className="h-36 flex items-end gap-1.5 border-b border-white/10">
                  {forexBars.map((height, i) => <div key={i} className="flex-1 rounded-t bg-white/80" style={{height: height + '%'}} />)}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-mono"><span>15M</span><span>1H</span><span>4H</span><span>1D</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] text-gray-500 uppercase">Wallet</p><p className="text-lg font-black text-white">Verified only</p></div>
                <div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] text-gray-500 uppercase">Execution</p><p className="text-lg font-black text-white">Human gated</p></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400"><CandlestickChart className="w-4 h-4 text-white"/> No guaranteed returns. Live trading requires a verified broker/feed connection.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="targets" className="py-20 px-4 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10"><div className="inline-flex items-center gap-2 text-white font-mono text-xs tracking-widest mb-3"><Target className="w-4 h-4"/> X100 PRO MARKET STRATEGY</div><h2 className="text-3xl md:text-5xl font-bold mb-3">The numbers we are <span className="text-white">building toward.</span></h2><p className="text-gray-400 max-w-2xl mx-auto">These are strategic targets and positioning figures—not current user counts, verified payouts, measured win rates, or guaranteed returns.</p></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {marketTargets.map(([value,label,note])=><div key={label} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5"><p className="text-3xl md:text-4xl font-black font-mono text-white">{value}</p><p className="font-bold mt-2">{label}</p><p className="text-[11px] text-gray-600 mt-2">{note}</p></div>)}
        </div>
      </div>
    </section>

    <section className="py-20 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10"><h2 className="text-3xl md:text-5xl font-bold">24/7 Agent <span className="text-white">Fleet Vision</span></h2><p className="text-gray-400 mt-3">Proposed commercial positioning. Performance figures remain unverified until backed by audited live results.</p></div>
        <div className="grid md:grid-cols-4 gap-4">
          {agentTargets.map(([name,session,win,fee])=><div key={name} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5"><div className="flex items-center justify-between"><TrendingUp className="w-5 h-5 text-white"/><span className="text-[10px] text-gray-600 font-mono">TARGET</span></div><h3 className="text-xl font-bold mt-4">{name}</h3><p className="text-xs text-gray-500 font-mono">{session}</p><div className="mt-5 flex justify-between"><span className="text-green-400 font-mono">{win}</span><span className="text-gray-300 font-mono">{fee}</span></div><p className="text-[10px] text-gray-600 mt-2">Strategy benchmark / proposed pricing</p></div>)}
        </div>
      </div>
    </section>

    <section id="proof" className="py-16 px-4 border-t border-gray-800/50"><div className="max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/><span className="text-xs text-green-400 font-mono">VERIFIED LEDGER</span></div>
      <h2 className="text-3xl md:text-4xl font-bold mb-2">Real proof, separate from the strategy.</h2><p className="text-gray-400 mb-8">Solvix displays payouts only when they are recorded and verified by the backend ledger.</p>
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8"><CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-4"/><p className="text-gray-300">Verified payout activity will appear here as real transactions are confirmed.</p><p className="text-xs text-gray-600 font-mono mt-3">STRATEGY TARGETS ≠ VERIFIED RESULTS · NO GUARANTEED RETURNS</p></div>
    </div></section>

    <section id="trust" className="py-20 px-4 border-t border-gray-800"><div className="max-w-6xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl md:text-5xl font-bold mb-4">Built for <span className="text-white">global control.</span></h2><p className="text-gray-400 text-lg">Multi-currency accounting, auditable opportunities and explicit execution gates.</p></div>
      <div className="grid md:grid-cols-3 gap-6">
        {[['Multi-Currency Ledger','Hold supported currencies independently instead of pretending every balance is UGX.',Wallet],['Settlement Abstraction','Payment rails can be connected independently; credentials and provider verification stay server-side.',Globe],['Human Control','Trading remains locked until the backend confirms the required execution conditions.',Shield]].map(([title,desc,Icon])=><div key={title as string} className="bg-gray-900/40 border border-gray-800 rounded-xl p-6"><div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/5 text-white"><Icon className="w-6 h-6"/></div><h3 className="text-xl font-bold mb-2">{title as string}</h3><p className="text-gray-400 text-sm leading-relaxed">{desc as string}</p></div>)}
      </div>
    </div></section>

    <section className="py-20 px-4 border-t border-gray-800"><div className="max-w-4xl mx-auto text-center"><Users className="w-8 h-8 text-white mx-auto mb-4"/><h2 className="text-3xl md:text-5xl font-bold mb-4">Build the <span className="text-white">global terminal.</span></h2><p className="text-gray-400 text-lg mb-8">The market strategy is ambitious. The ledger must remain factual. We will promote each target to a verified metric only when the backend has evidence.</p></div></section>

    <footer className="border-t border-gray-800 py-12 px-4 bg-black/30"><div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6"><div><div className="font-bold mb-2">SOLVIX OS</div><p className="text-sm text-gray-500">Global opportunity and trading workspace built around proof, control and useful automation.</p></div><div className="text-sm text-gray-400"><a href="mailto:Solvixfeedback@gmail.com" className="flex items-center gap-2"><Mail className="w-4 h-4"/>Solvixfeedback@gmail.com</a><a href="/support" className="block mt-3">Help Center</a></div><p className="text-sm text-gray-600">© 2026 Solvix OS</p></div></footer>
  </main>;
}
