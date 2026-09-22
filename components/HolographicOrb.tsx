'use client';
import { useEffect, useState } from 'react';
import { Briefcase, Cpu, Radio, Shield, TrendingUp, Wallet } from 'lucide-react';

const services = [
  { icon: TrendingUp, title: 'Forex Control Room', desc: 'Broker-connected workflows with explicit risk gates and human control.', color: '#00f0ff', glow: 'rgba(0,240,255,.28)', stat: 'RISK GATED' },
  { icon: Briefcase, title: 'Opportunity Engine', desc: 'Discover legitimate opportunities, manage submissions and verify revenue.', color: '#a855f7', glow: 'rgba(168,85,247,.28)', stat: 'PROOF FIRST' },
  { icon: Cpu, title: 'AI Agent Fleet', desc: 'Specialized agents for discovery, execution support, repair and monitoring.', color: '#22d3ee', glow: 'rgba(34,211,238,.28)', stat: 'CONTROLLED' },
  { icon: Wallet, title: 'Verified Wallet', desc: 'Separate projected, pending and verified money with auditable records.', color: '#34d399', glow: 'rgba(52,211,153,.28)', stat: 'AUDIT READY' },
  { icon: Radio, title: 'Signal Intelligence', desc: 'Time-sensitive intelligence designed around controlled access and expiry.', color: '#fbbf24', glow: 'rgba(251,191,36,.28)', stat: 'TIME LIMITED' },
  { icon: Shield, title: 'Zero-Trust Security', desc: 'Authentication, row-level authorization and server-side payment verification.', color: '#f472b6', glow: 'rgba(244,114,182,.28)', stat: 'RLS + AUTH' },
];

export default function HolographicOrb() {
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const angle = 360 / services.length;

  useEffect(() => {
    const move = (e: MouseEvent) => setMouse({
      x: (e.clientX / window.innerWidth - .5) * 18,
      y: (e.clientY / window.innerHeight - .5) * 18,
    });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="relative w-full h-[620px] md:h-[760px] overflow-hidden flex items-center justify-center" style={{ perspective: '1200px' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); setActive(null); }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,.05) 1px,transparent 1px)', backgroundSize: '60px 60px', transform: 'rotateX(60deg) translateZ(-100px)' }} />
      <div className="absolute w-[460px] h-[460px] rounded-full blur-[110px] opacity-30" style={{ background: 'radial-gradient(circle,rgba(0,240,255,.35),transparent 70%)', transform: 'translate(' + mouse.x * .5 + 'px,' + mouse.y * .5 + 'px)' }} />
      <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(' + -mouse.y * .3 + 'deg) rotateY(' + mouse.x * .3 + 'deg)', animation: 'solvix-float 6s ease-in-out infinite' }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-cyan-400/30 flex items-center justify-center" style={{ animation: paused ? 'none' : 'solvix-spin 20s linear infinite', boxShadow: '0 0 60px rgba(0,240,255,.2),inset 0 0 60px rgba(0,240,255,.1)' }}>
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-purple-400/40 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle,rgba(0,240,255,.8),rgba(168,85,247,.6))', boxShadow: '0 0 80px rgba(0,240,255,.5),0 0 120px rgba(168,85,247,.3)', animation: 'solvix-pulse 3s ease-in-out infinite' }}><span className="text-2xl md:text-3xl font-black text-black font-mono">S</span></div>
            </div>
          </div>
          <div className="absolute inset-[-80px] rounded-full border border-cyan-400/10" style={{ transform: 'rotateX(75deg)', animation: paused ? 'none' : 'solvix-spin 30s linear infinite' }} />
          <div className="absolute inset-[-120px] rounded-full border border-purple-400/10" style={{ transform: 'rotateX(75deg) rotateZ(60deg)', animation: paused ? 'none' : 'solvix-reverse 25s linear infinite' }} />
        </div>
        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d', transform: 'translate(-50%,-50%)', animation: paused ? 'none' : 'solvix-orbit 30s linear infinite' }}>
          {services.map((service, i) => {
            const Icon = service.icon;
            const isActive = active === i;
            return <div key={service.title} className="absolute left-0 top-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(' + i * angle + 'deg) translateZ(270px)' }} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              <div className="w-[190px] md:w-[230px] p-5 rounded-2xl backdrop-blur-xl transition-all duration-300" style={{ background: isActive ? 'linear-gradient(135deg,' + service.glow + ',rgba(15,15,25,.95))' : 'rgba(15,15,25,.72)', border: '1px solid ' + (isActive ? service.color : 'rgba(255,255,255,.08)'), boxShadow: isActive ? '0 0 40px ' + service.glow : '0 10px 40px rgba(0,0,0,.3)', transform: isActive ? 'scale(1.08) translateZ(30px)' : 'scale(1)', animation: paused ? 'none' : 'solvix-counter 30s linear infinite' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: service.glow }}><Icon className="w-5 h-5" style={{ color: service.color }} /></div>
                <h3 className="text-sm font-bold text-white mb-1">{service.title}</h3><p className="text-xs text-gray-400 leading-relaxed mb-3">{service.desc}</p>
                <span className="inline-block px-2 py-1 rounded text-[10px] font-mono font-bold" style={{ background: service.glow, color: service.color, border: '1px solid ' + service.color + '40' }}>{service.stat}</span>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: service.color, boxShadow: '0 0 8px ' + service.color }} /><span className="text-[10px] font-mono" style={{ color: service.color }}>AVAILABLE</span></div>
              </div>
            </div>;
          })}
        </div>
      </div>
      <style jsx>{'@keyframes solvix-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}} @keyframes solvix-orbit{from{transform:translate(-50%,-50%) rotateY(0)}to{transform:translate(-50%,-50%) rotateY(360deg)}} @keyframes solvix-counter{from{transform:rotateY(0)}to{transform:rotateY(-360deg)}} @keyframes solvix-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes solvix-reverse{from{transform:rotate(360deg)}to{transform:rotate(0)}} @keyframes solvix-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'}</style>
    </div>
  );
}
