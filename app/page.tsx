import { ArrowRight, CheckCircle, Mail, Globe, Shield, Target, TrendingUp, Users, Wallet, Smartphone, CandlestickChart, BriefcaseBusiness, Bot, BarChart3, Settings, UserRound } from 'lucide-react';
import Link from 'next/link';

const nav = [
  ['Dashboard','/dashboard',BarChart3],['Opportunities','/dashboard#opportunities',Target],['Jobs','/jobs',BriefcaseBusiness],
  ['Revenue','/billing',Wallet],['Forex','/forex',CandlestickChart],['Agents','/dashboard#agents',Bot],
  ['Customers','/dashboard#customers',Users],['Settings','/dashboard#settings',Settings]
] as const;

const forexBars = [24,38,31,52,44,68,57,76,64,88,72,94,80,91,73,97];

export default function LandingPage() {
  return <main className="min-h-screen bg-[#030305] text-white overflow-x-hidden">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"><span className="text-black font-black text-base">S</span></div>
          <span className="font-black text-xl tracking-tight text-white">SOLVIX <span className="text-white">OS</span></span>
        </Link>
        <div className="hidden lg:flex items-center gap-5 text-xs text-white font-bold">
          {nav.slice(0,6).map(([label,href,Icon])=><Link key={label} href={href} className="nav-white flex items-center gap-1.5"><Icon className="w-3.5 h-3.5"/>{label}</Link>)}
        </div>
        <Link href="/login" className="px-4 md:px-6 py-3 bg-white text-black border border-white rounded-xl text-xs md:text-sm font-black shadow-lg uppercase whitespace-nowrap">OPEN SOLVIX</Link>
      </div>
    </nav>

    <section id="services" className="relative pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-white"/><span className="text-xs text-white font-mono tracking-wider">GLOBAL · ZERO-TRUST WORKSPACE</span>
            </div>
            <p className="text-6xl sm:text-7xl md:text-8xl font-black tracking-[-0.07em] leading-none text-white mb-5">SOLVIX</p>
            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-[1.02]">Your work.<br/>Your money.<br/><span className="text-white">One control room.</span></h1>
            <p className="text-base md:text-lg text-gray-300 max-w-xl mb-8">A mobile-first workspace for opportunities, jobs, revenue, agents and market workflows. Built to keep real results separate from targets and projections.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard" className="px-7 py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-2 shadow-xl uppercase">ENTER DASHBOARD <ArrowRight className="w-5 h-5"/></Link>
              <Link href="/forex" className="px-7 py-4 bg-transparent border border-white/30 rounded-xl font-bold text-white text-center">OPEN FOREX ROOM</Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[#09090b] border border-white/15 rounded-3xl p-4 md:p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-[10px] text-white font-mono tracking-[.2em]">MOBILE CONTROL ROOM</p><h2 className="text-2xl md:text-3xl font-black mt-1 text-white">Money from your phone.</h2></div>
                <div className="w-11 h-11 rounded-xl border border-white/20 flex items-center justify-center"><Smartphone className="w-5 h-5 text-white"/></div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <div className="flex items-center justify-between mb-5">
                  <div><p className="text-xs text-gray-400">EUR/USD</p><p className="text-2xl font-black text-white">— — —</p></div>
                  <div className="text-right"><p className="text-[10px] text-gray-400">LIVE FEED</p><p className="text-[10px] font-bold text-white">VERIFYING</p></div>
                </div>
                <div className="h-40 flex items-end gap-1 border-b border-white/10">
                  {forexBars.map((height,i)=><div key={i} className="flex-1 rounded-t bg-white/85" style={{height:height+'%'}} />)}
                </div>
                <div className="flex justify-between mt-3 text-[9px] text-gray-400 font-mono"><span>15M</span><span>1H</span><span>4H</span><span>1D</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] text-gray-500 uppercase">Wallet</p><p className="text-lg font-black text-white">Verified only</p></div>
                <div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] text-gray-500 uppercase">Execution</p><p className="text-lg font-black text-white">Controlled</p></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400"><CandlestickChart className="w-4 h-4 text-white"/> No guaranteed returns. Live trading requires a verified broker/feed connection.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="modules" className="py-16 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-9"><p className="text-[10px] text-white font-mono tracking-[.2em] mb-3">SOLVIX OS MODULES</p><h2 className="text-3xl md:text-5xl font-black text-white">Everything in one terminal.</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {nav.map(([label,href,Icon])=><Link key={label} href={href} className="module-card"><Icon className="w-5 h-5 text-white"/><span className="font-bold text-sm text-white">{label}</span><ArrowRight className="w-4 h-4 ml-auto text-white/60"/></Link>)}
        </div>
      </div>
    </section>

    <section id="proof" className="py-16 px-4 border-t border-white/10"><div className="max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 mb-4"><CheckCircle className="w-4 h-4 text-white"/><span className="text-xs text-white font-mono">VERIFIED LEDGER</span></div>
      <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Proof stays separate.</h2>
      <p className="text-gray-400 mb-8">Verified transactions belong in the ledger. Targets and projections stay clearly labeled as targets.</p>
      <div className="bg-white/[.03] border border-white/10 rounded-2xl p-8"><CheckCircle className="w-10 h-10 text-white mx-auto mb-4"/><p className="text-gray-300">Verified payout activity will appear here when real transactions are confirmed.</p></div>
    </div></section>

    <footer className="border-t border-white/10 py-10 px-4 bg-black/40"><div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-5">
      <div><div className="font-black text-white mb-2">SOLVIX OS</div><p className="text-sm text-gray-500">Global opportunity and business control workspace.</p></div>
      <div className="text-sm text-gray-400"><a href="mailto:Solvixfeedback@gmail.com" className="flex items-center gap-2 text-white"><Mail className="w-4 h-4"/>Support</a><Link href="/dashboard" className="block mt-3 text-white">Open workspace</Link></div>
      <p className="text-sm text-gray-600">© 2026 Solvix OS</p>
    </div></footer>
  </main>;
}