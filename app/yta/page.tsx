"use client";
import { useEffect, useMemo, useState } from "react";
import { Activity, Film, Plus, RefreshCw, Settings2, Sparkles, Youtube } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

const API="https://jvmicoqonhuuyedvpmcn.supabase.co/functions/v1/solvix-yta-dashboard";
type Channel={id:string;channel_name:string;channel_id:string|null;handle:string|null;niche:string;enabled:boolean;monetization_status:string;cadence_per_week:number;approval_required:boolean};
type Item={id:string;channel_id:string|null;topic:string;title:string|null;script:string|null;status:string;scheduled_at:string|null;published_at:string|null;views:number;watch_time_minutes:number;subscribers_gained:number;revenue:number;revenue_currency:string;video_url:string|null;thumbnail_url:string|null;youtube_status:string|null;last_error:string|null};
type Data={settings:any;channels:Channel[];queue:Item[];runs:any[];analytics:any[]};

function fmt(n:number){return Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(n||0)}
function statusClass(s:string){return s==="PUBLISHED"?"text-green-400":s==="APPROVED"?"text-cyan-400":s==="SCRIPT_READY"?"text-yellow-400":s==="RENDERED"?"text-violet-400":"text-gray-400"}

export default function YtaPage(){
 const [data,setData]=useState<Data>({settings:null,channels:[],queue:[],runs:[],analytics:[]});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [form,setForm]=useState({channel_name:"",handle:"",channel_id:"",niche:"",monetization_status:"NOT_MONETIZED"});
 const [showAdd,setShowAdd]=useState(false);
 const supabase=createClient();

 async function call(action:string, extra:any={}){
  setBusy(action);setError("");setNotice("");
  try{
   const {data:s}=await supabase.auth.getSession(); const token=s.session?.access_token;
   if(!token) throw new Error("Authenticated session required.");
   const r=await fetch(API,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({action,...extra})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok) throw new Error(j.error?.message||j.error||"YTA action failed.");
   setNotice(action==="run_writer"?"Script writer completed.":action==="run_planner"?"Planner completed.":"Action completed.");
   await load();
   return j;
  }catch(e:any){setError(e.message||String(e));}finally{setBusy("")}
 }
 async function load(){
  setLoading(true);setError("");
  try{
   const {data:s}=await supabase.auth.getSession(); const token=s.session?.access_token;
   if(!token){setLoading(false);return}
   const r=await fetch(API,{headers:{Authorization:"Bearer "+token}});
   const j=await r.json(); if(!r.ok)throw new Error(j.error||"Unable to load YTA.");
   setData(j);
  }catch(e:any){setError(e.message||String(e))}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 const totals=useMemo(()=>data.analytics.reduce((a,x)=>({views:a.views+(+x.views||0),watch:a.watch+(+x.watch_time_minutes||0),subs:a.subs+(+x.subscribers_gained||0),rev:a.rev+(+x.revenue||0)}),{views:0,watch:0,subs:0,rev:0}),[data.analytics]);
 const stages=["IDEA","SCRIPT_READY","READY_TO_RENDER","RENDERED","APPROVED","PUBLISHED"];
 return <main className="min-h-screen bg-[#050508] text-white p-4 md:p-8">
  <div className="max-w-7xl mx-auto">
   <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
    <div><a href="/dashboard" className="text-xs font-mono text-gray-500 hover:text-white">← SOLVIX DASHBOARD</a><div className="flex items-center gap-3 mt-3"><Youtube className="text-red-400"/><div><p className="text-xs font-mono tracking-widest text-gray-500">SOLVIX OS · YOUTUBE AUTOMATION</p><h1 className="text-3xl md:text-4xl font-bold">YTA Control Room</h1></div></div><p className="text-gray-400 mt-2 max-w-2xl">Research, scripts, approvals, publishing and analytics in one authenticated workspace. No fake upload or revenue status.</p></div>
    <div className="flex gap-2"><button onClick={()=>load()} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm"><RefreshCw className="inline w-4 h-4 mr-2"/>Refresh</button><button onClick={()=>setShowAdd(true)} className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm"><Plus className="inline w-4 h-4 mr-2"/>Add channel</button></div>
   </header>
   {error&&<div className="mb-5 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-300 text-sm">{error}</div>}
   {notice&&<div className="mb-5 p-4 rounded-2xl border border-green-500/20 bg-green-500/5 text-green-300 text-sm">{notice}</div>}
   <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    {[["Views",fmt(totals.views)],["Watch minutes",fmt(totals.watch)],["Subscribers",fmt(totals.subs)],["Revenue",totals.rev?totals.rev.toLocaleString(undefined,{style:"currency",currency:"USD"}):"$0"]].map(([k,v])=><div key={k} className="p-5 rounded-2xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">{k}</p><p className="text-2xl font-bold font-mono mt-2">{v}</p></div>)}
   </section>
   <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
    <div className="lg:col-span-2 p-5 rounded-3xl bg-white/5 border border-white/10">
      <div className="flex justify-between items-center mb-5"><div><p className="text-xs font-mono text-gray-500 tracking-widest">AUTOMATION</p><h2 className="text-xl font-bold mt-1">Content engine</h2></div><Sparkles className="text-cyan-400"/></div>
      <div className="grid md:grid-cols-3 gap-3">
       <button disabled={!!busy||!data.channels.length} onClick={()=>call("run_planner")} className="p-4 rounded-2xl bg-black/30 border border-white/10 text-left disabled:opacity-40"><Sparkles className="w-5 h-5 text-cyan-400"/><p className="font-semibold mt-3">Generate ideas</p><p className="text-xs text-gray-500 mt-1">Plan topics for configured channels.</p></button>
       <button disabled={!!busy||!data.channels.length} onClick={()=>call("run_writer")} className="p-4 rounded-2xl bg-black/30 border border-white/10 text-left disabled:opacity-40"><Film className="w-5 h-5 text-yellow-400"/><p className="font-semibold mt-3">Write scripts</p><p className="text-xs text-gray-500 mt-1">Uses the existing Claude writer when its key is configured.</p></button>
       <div className="p-4 rounded-2xl bg-black/30 border border-white/10"><Settings2 className="w-5 h-5 text-gray-400"/><p className="font-semibold mt-3">{data.settings?.mode||"SUPERVISED"}</p><p className="text-xs text-gray-500 mt-1">{data.settings?.require_approval===false?"Approval not required":"Approval required before publishing."}</p></div>
      </div>
    </div>
    <div className="p-5 rounded-3xl bg-white/5 border border-white/10"><p className="text-xs font-mono text-gray-500 tracking-widest">EXECUTION STATUS</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span>Planner</span><span className="text-green-400">CONNECTED</span></div><div className="flex justify-between"><span>Script writer</span><span className="text-green-400">CONNECTED</span></div><div className="flex justify-between"><span>Video renderer</span><span className="text-yellow-400">PROVIDER REQUIRED</span></div><div className="flex justify-between"><span>YouTube upload</span><span className="text-yellow-400">CREDENTIAL GATED</span></div><p className="text-xs text-gray-600 pt-2 border-t border-white/5">Solvix will not claim a video was rendered or uploaded until the backend provider returns success.</p></div></div>
   </section>
   <section className="p-5 rounded-3xl bg-white/5 border border-white/10 mb-6 overflow-x-auto">
    <div className="flex items-center justify-between mb-5"><div><p className="text-xs font-mono text-gray-500 tracking-widest">PIPELINE</p><h2 className="text-xl font-bold mt-1">Content queue</h2></div><span className="text-xs font-mono text-gray-500">{data.queue.length} items</span></div>
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 min-w-[760px]">
     {stages.map(stage=><div key={stage} className="rounded-2xl bg-black/25 border border-white/5 p-3 min-h-36"><div className="flex justify-between text-[10px] font-mono text-gray-500 mb-3"><span>{stage.replaceAll("_"," ")}</span><span>{data.queue.filter(x=>x.status===stage).length}</span></div>{data.queue.filter(x=>x.status===stage).slice(0,4).map(x=><div key={x.id} className="p-3 mb-2 rounded-xl bg-white/5"><p className="text-xs font-semibold">{x.title||x.topic}</p><p className={"text-[10px] font-mono mt-2 "+statusClass(x.status)}>{x.status}</p>{(x.status==="SCRIPT_READY"||x.status==="RENDERED")&&<button onClick={()=>call("approve",{id:x.id})} disabled={!!busy} className="mt-2 text-[10px] px-2 py-1 rounded-lg bg-white/10">Approve</button>}{x.status==="APPROVED"&&<button onClick={()=>call("publish",{id:x.id})} disabled={!!busy} className="mt-2 text-[10px] px-2 py-1 rounded-lg bg-white/10">Publish</button>}</div>)}</div>)}
    </div>
   </section>
   <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <div className="p-5 rounded-3xl bg-white/5 border border-white/10"><div className="flex justify-between mb-4"><div><p className="text-xs font-mono text-gray-500 tracking-widest">CHANNELS</p><h2 className="text-xl font-bold mt-1">Connected channels</h2></div><Youtube className="text-red-400"/></div>{loading?<p className="text-gray-500">Loading…</p>:data.channels.length?data.channels.map(c=><div key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-black/30 border border-white/5 mb-2"><div><p className="font-semibold">{c.channel_name}</p><p className="text-xs text-gray-500">{c.handle||"No handle"} · {c.niche}</p></div><div className="text-right text-xs"><p className="text-green-400">{c.enabled?"ENABLED":"DISABLED"}</p><p className="text-gray-500">{c.monetization_status}</p></div></div>):<div className="p-5 rounded-2xl bg-black/30 border border-dashed border-white/10 text-sm text-gray-500">No channel configured yet. Add your first channel to activate the planner.</div>}</div>
    <div className="p-5 rounded-3xl bg-white/5 border border-white/10"><div className="flex items-center gap-2 mb-4"><Activity className="text-cyan-400"/><div><p className="text-xs font-mono text-gray-500 tracking-widest">RUN HISTORY</p><h2 className="text-xl font-bold mt-1">Recent automation</h2></div></div>{data.runs.length?data.runs.slice(0,6).map(r=><div key={r.id} className="flex justify-between gap-3 p-3 rounded-xl bg-black/25 mb-2"><div><p className="text-sm font-semibold">{r.action}</p><p className="text-xs text-gray-500">{r.started_at?new Date(r.started_at).toLocaleString():"—"}</p></div><span className={r.status==="SUCCEEDED"?"text-green-400":"text-yellow-400"}>{r.status}</span></div>):<p className="text-gray-500 text-sm">No runs yet.</p>}</div>
   </section>
  </div>
  {showAdd&&<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"><div className="w-full max-w-lg p-6 rounded-3xl bg-[#0c0c12] border border-white/10"><div className="flex justify-between"><div><p className="text-xs font-mono text-gray-500">CHANNEL SETUP</p><h2 className="text-2xl font-bold mt-1">Connect a YouTube channel</h2></div><button onClick={()=>setShowAdd(false)} className="text-gray-500">✕</button></div><div className="grid gap-3 mt-5"><input className="bg-black/40 border border-white/10 rounded-xl p-3" placeholder="Channel name" value={form.channel_name} onChange={e=>setForm({...form,channel_name:e.target.value})}/><input className="bg-black/40 border border-white/10 rounded-xl p-3" placeholder="@handle (optional)" value={form.handle} onChange={e=>setForm({...form,handle:e.target.value})}/><input className="bg-black/40 border border-white/10 rounded-xl p-3" placeholder="YouTube channel ID (optional)" value={form.channel_id} onChange={e=>setForm({...form,channel_id:e.target.value})}/><input className="bg-black/40 border border-white/10 rounded-xl p-3" placeholder="Niche, e.g. AI tools" value={form.niche} onChange={e=>setForm({...form,niche:e.target.value})}/><select className="bg-black/40 border border-white/10 rounded-xl p-3" value={form.monetization_status} onChange={e=>setForm({...form,monetization_status:e.target.value})}><option>NOT_MONETIZED</option><option>ELIGIBLE</option><option>MONETIZED</option></select><button disabled={!!busy} onClick={async()=>{const j=await call("add_channel",form);if(j?.ok)setShowAdd(false)}} className="py-3 rounded-xl bg-white text-black font-bold disabled:opacity-50">{busy==="add_channel"?"CONNECTING…":"CONNECT CHANNEL"}</button></div><p className="text-xs text-gray-600 mt-4">This registers the channel in Solvix. YouTube OAuth/upload credentials are kept server-side and are not entered into this form.</p></div></div>}
 </main>
}