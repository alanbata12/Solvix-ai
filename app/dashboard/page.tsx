import { Activity, Globe, Shield, Wallet, Zap } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export default async function GlobalDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims;
  if (!user?.sub) redirect('/login');

  const [{ data: profile }, { data: wallets }, { data: agents }, { data: leads }, { data: gate }] = await Promise.all([
    supabase.from('user_profiles').select('onboarding_complete,chosen_path,subscription_tier').eq('id', user.sub).maybeSingle(),
    supabase.from('wallets').select('currency_code,balance,is_locked').eq('user_id', user.sub).order('currency_code'),
    supabase.from('forex_agents').select('id,name,session,monthly_fee_usd,performance_verified,win_rate,status').order('name'),
    supabase.from('job_leads').select('id,title,client_region,expected_payout_usd,lead_price_usd,difficulty,required_skills,is_verified,source_name').eq('is_verified', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('solvix_live_execution_gate').select('live_enabled,reason,verified_trade_count').eq('id', 1).maybeSingle(),
  ]);
  if (!profile?.onboarding_complete) redirect('/onboarding/choose');

  return <main className="min-h-screen bg-[#050508] text-white p-4 md:p-6 font-sans">
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-cyan-400"/><span className="text-sm font-mono text-gray-400">GLOBAL NETWORK: <span className="text-green-400">ONLINE</span> · MULTI-CURRENCY LEDGER</span></div>
        <div className="flex gap-4 text-xs font-mono text-gray-500"><span>OPPORTUNITIES: <span className="text-cyan-400">VERIFIED ONLY</span></span><span>TRADING: <span className={gate?.live_enabled ? "text-green-400" : "text-red-400"}>{gate?.live_enabled ? "ENABLED" : "LOCKED"}</span></span></div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 md:col-span-4 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4"><Wallet className="w-5 h-5 text-cyan-400"/><span className="text-xs font-mono text-gray-400 tracking-widest">GLOBAL HOLDINGS</span></div>
          <div className="grid grid-cols-2 gap-3">{(wallets||[]).length ? wallets!.map(w=><div key={w.currency_code} className="p-3 bg-black/40 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 font-mono">{w.currency_code}</p><p className="text-xl font-bold font-mono">{Number(w.balance||0).toLocaleString()}</p><p className={w.is_locked ? "text-[10px] text-red-400" : "text-[10px] text-green-400"}>{w.is_locked ? "LOCKED" : "AVAILABLE"}</p></div>) : <p className="text-gray-500 text-sm col-span-2">No currency wallets created yet.</p>}</div>
          <p className="text-xs text-gray-600 mt-4">Balances are shown by currency. FX conversion is not fabricated when no live rate source is connected.</p>
        </section>

        <section className="col-span-12 md:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-purple-400"/><span className="text-xs font-mono text-gray-400 tracking-widest">EXECUTION CONTROL</span></div>
          <div className="h-48 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
            <Shield className="w-10 h-10 text-red-400 mb-3"/>
            <p className="font-bold">{gate?.live_enabled ? 'LIVE EXECUTION ENABLED' : 'LIVE EXECUTION LOCKED'}</p>
            <p className="text-xs text-gray-500 max-w-sm mt-2">{gate?.reason || 'Backend risk gate has not authorized live execution.'}</p>
          </div>
          <div className="flex justify-between mt-4 text-xs font-mono text-gray-500"><span>Verified trades: {gate?.verified_trade_count ?? 0}</span><span>Mode: {profile?.chosen_path?.toUpperCase()}</span></div>
        </section>

        <section className="col-span-12 md:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-green-400"/><span className="text-xs font-mono text-gray-400 tracking-widest">AGENT FLEET</span></div>
          <div className="space-y-3">{(agents||[]).map(a=><div key={a.id} className="p-3 bg-black/40 rounded-xl border border-white/5"><div className="flex justify-between"><p className="text-sm font-bold">{a.name}</p><span className="text-[10px] text-gray-500">{a.session}</span></div><div className="flex justify-between mt-2 text-[10px] font-mono"><span className={a.status==='ACTIVE' ? "text-green-400":"text-yellow-400"}>{a.status}</span><span className="text-gray-500">{a.performance_verified && a.win_rate != null ? a.win_rate+'% verified' : 'performance unverified'}</span></div></div>)}</div>
        </section>

        <section className="col-span-12 md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-yellow-400"/><span className="text-xs font-mono text-gray-400 tracking-widest">GLOBAL OPPORTUNITY ENGINE</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{(leads||[]).length ? leads!.map(l=><div key={l.id} className="p-4 bg-black/40 rounded-xl border border-white/5"><div className="flex justify-between gap-3 mb-2"><span className="text-[10px] font-mono text-gray-500">{l.client_region||'GLOBAL'}</span><span className="text-[10px] font-mono text-green-400">VERIFIED SOURCE</span></div><h3 className="font-bold mb-1">{l.title}</h3><p className="text-xs text-gray-500">{l.source_name||'External source'}</p><div className="flex justify-between text-xs text-gray-400 mt-3"><span>Expected: <span className="text-white font-mono">{l.expected_payout_usd == null ? 'Not stated' : '$'+Number(l.expected_payout_usd).toLocaleString()}</span></span><span>{l.difficulty||'Unspecified'}</span></div></div>) : <p className="text-sm text-gray-500">No verified global leads are currently stored.</p>}</div>
        </section>

        <section className="col-span-12 md:col-span-4 bg-gradient-to-br from-purple-500/5 to-transparent border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-purple-400"/><span className="text-xs font-mono text-gray-400 tracking-widest">ZERO-TRUST VAULT</span></div>
          <div className="space-y-4 text-sm"><div className="flex justify-between"><span className="text-gray-400">Settlement</span><span className="font-mono text-white">Provider-gated</span></div><div className="flex justify-between"><span className="text-gray-400">Ledger</span><span className="font-mono text-green-400">Auditable</span></div><div className="flex justify-between"><span className="text-gray-400">Trading gate</span><span className="font-mono text-red-400">{gate?.live_enabled ? 'OPEN' : 'LOCKED'}</span></div><p className="text-xs text-gray-600">Stripe, Wise, Circle/Coinbase and regional rails are integration targets until their credentials, account approvals and webhook verification are configured.</p></div>
        </section>
      </div>
    </div>
  </main>;
}
