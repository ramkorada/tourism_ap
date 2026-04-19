import React, { useState, useRef, useEffect } from "react";
import heroImage from "@/assets/hero-andhra.jpg";
import { Link } from "react-router-dom";
import {
  ArrowRight, Leaf, Waves, Map, Compass, Sparkles,
  ChevronDown, MapPin, Search
} from "lucide-react";
import { destinations } from "@/data/destinations";
import DestinationCard from "@/components/DestinationCard";
import Navbar from "@/components/Navbar";
import GlowCard from "@/components/GlowCard";


/* ─── Floating animated orb ────────────────────────────────────── */
const Orb = ({ color, size, style }: { color: string; size: number; style?: React.CSSProperties }) => (
  <div className="pointer-events-none absolute rounded-full animate-blob"
    style={{ width: size, height: size, background: color, filter: `blur(${size * 0.3}px)`, mixBlendMode: "screen", ...style }} />
);

/* ─── Animated counter ─────────────────────────────────────────── */
function AnimCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = () => {
        start += Math.ceil(target / 60);
        if (start >= target) { setV(target); return; }
        setV(start); requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <div ref={ref}>{v}{suffix}</div>;
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function Index() {
  const featured = destinations.slice(0, 3);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [heroQuery, setHeroQuery] = useState("");

  useEffect(() => {
    const h = (e: globalThis.MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const quickLinks = destinations.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#07071a] text-white overflow-x-hidden font-body">
      <Navbar />

      {/* ── Subtle page glow following cursor ── */}
      <div className="pointer-events-none fixed inset-0 z-50 transition-none"
        style={{ background: `radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(100,220,200,0.05), transparent 45%)` }} />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Background photo at low opacity */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20"
            style={{ transform: `translate(${mouse.x * -0.006}px, ${mouse.y * -0.006}px) scale(1.05)`, transition: "transform 0.15s ease-out" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07071a]/70 via-[#07071a]/60 to-[#07071a]" />
        </div>

        {/* Vivid floating orbs — clearly visible */}
        <Orb color="hsl(160 60% 50% / 0.55)" size={480}
          style={{ top: "8%", left: "5%", animationDuration: "8s" }} />
        <Orb color="hsl(195 70% 55% / 0.45)" size={380}
          style={{ top: "20%", right: "6%", animationDuration: "10s", animationDelay: "2s" }} />
        <Orb color="hsl(25 80% 58% / 0.35)" size={300}
          style={{ bottom: "15%", left: "40%", animationDuration: "12s", animationDelay: "4s" }} />

        {/* ── Hero content ── */}
        <div className="flex-1 flex items-center relative z-10">
          <div className="container mx-auto px-6 md:px-10 pt-24 pb-4">

            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-md mb-7 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium tracking-[0.18em] uppercase text-white/75">Discover Andhra Pradesh</span>
            </div>

            {/* headline */}
            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.08] tracking-tight text-white max-w-4xl mb-5 opacity-0 animate-fade-in"
              style={{ animationDelay: "180ms", animationFillMode: "forwards" }}>
              Where Nature Meets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%] animate-pulse">
                Ancient Culture
              </span>
            </h1>

            <p className="text-white/55 text-lg font-light max-w-xl leading-relaxed mb-10 opacity-0 animate-fade-in"
              style={{ animationDelay: "340ms", animationFillMode: "forwards" }}>
              Explore pristine valleys, sacred temples, and sun-kissed coastlines through sustainable, responsible tourism.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-4 mb-16 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
              <Link to="/destinations" id="hero-explore-btn"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold hover:brightness-110 hover:scale-[1.03] transition-all duration-200 shadow-lg shadow-primary/30">
                Explore Destinations <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/trip-planner" id="hero-plan-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 bg-white/6 backdrop-blur-md text-white/80 font-medium hover:bg-white/12 hover:border-white/30 hover:text-white transition-all duration-200">
                <Map className="w-4 h-4" /> Plan a Trip
              </Link>
            </div>

            {/* ── Interactive Search Widget ── */}
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "680ms", animationFillMode: "forwards" }}>
              <GlowCard className="rounded-2xl border border-white/12 bg-white/6 backdrop-blur-2xl p-6 max-w-2xl shadow-2xl">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45 font-semibold mb-4">Quick Search</p>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-white/8 border border-white/12 rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
                    <Search className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      value={heroQuery}
                      onChange={e => setHeroQuery(e.target.value)}
                      placeholder="Search a destination, temple, beach…"
                      className="bg-transparent outline-none text-white placeholder-white/30 text-sm font-light w-full"
                    />
                  </div>
                  <Link to={`/destinations${heroQuery ? `?q=${heroQuery}` : ""}`}
                    className="px-5 py-3 bg-primary rounded-xl text-white font-semibold text-sm hover:brightness-110 transition-all whitespace-nowrap">
                    Search
                  </Link>
                </div>
                {/* quick-link chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {quickLinks.map(d => (
                    <Link key={d.id} to={`/destination/${d.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/60 border border-white/10 bg-white/5 hover:bg-white/12 hover:border-primary/40 hover:text-white transition-all">
                      <MapPin className="w-3 h-3" />{d.name}
                    </Link>
                  ))}
                </div>
              </GlowCard>
            </div>
          </div>
        </div>

        {/* scroll cue — at the bottom, isolated */}
        <div className="pb-8 flex justify-center relative z-10 opacity-0 animate-fade-in"
          style={{ animationDelay: "950ms", animationFillMode: "forwards" }}>
          <a href="#destinations" className="group flex flex-col items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 group-hover:text-white/60 transition-colors font-medium">Scroll</span>
            <ChevronDown className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors animate-bounce" />
          </a>
        </div>
      </section>

      {/* ═══════════ QUICK ACCESS — All Destinations ═══════════ */}
      <section id="destinations" className="py-20 bg-[#07071a] border-t border-white/5">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80 mb-3">All Destinations</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">Quick Access</h2>
            <p className="text-white/45 font-light">Tap any destination to explore details, nearby places, and plan your trip</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map((dest, i) => (
              <GlowCard key={dest.id} className="rounded-2xl border border-white/10 bg-white/4 shadow-xl overflow-hidden">
                <DestinationCard destination={dest} index={i} compact />
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED DESTINATIONS ═══════════ */}
      <section className="py-28 bg-[#080815] border-t border-white/5">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80 mb-3">Handpicked for You</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight">Featured Destinations</h2>
            </div>
            <Link to="/destinations" className="group flex items-center gap-1.5 text-sm font-medium text-white/45 hover:text-white uppercase tracking-widest transition-colors">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {featured.map((dest, i) => (
              <GlowCard key={dest.id} className="rounded-2xl border border-white/10 bg-white/4 shadow-xl overflow-hidden">
                <DestinationCard destination={dest} index={i} />
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ INTERACTIVE CATEGORY TILES ═══════════ */}
      <section className="py-28 bg-[#080815] border-t border-white/5 overflow-hidden relative">
        {/* section background orb */}
        <Orb color="hsl(160 55% 45% / 0.18)" size={700}
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", animationDuration: "14s", filter: "blur(180px)" }} />

        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-secondary/70 text-center mb-3">Explore by Theme</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-center text-white mb-14 tracking-tight">Choose Your Journey</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf,     label: "Eco Tourism",       desc: "Forests, valleys & wildlife",    grad: "from-[#0d2e1d] to-[#091a10]", ring: "hover:ring-eco/40",     iconBg: "bg-eco/15",     badge: "32 Trails" },
              { icon: Compass,  label: "Cultural Heritage",  desc: "Temples, history & art",         grad: "from-[#2e1a06] to-[#180e02]", ring: "hover:ring-cultural/40", iconBg: "bg-cultural/15", badge: "120+ Temples" },
              { icon: Waves,    label: "Coastal Escapes",    desc: "Beaches, water sports & sun",    grad: "from-[#061d2e] to-[#03101a]", ring: "hover:ring-coastal/40",  iconBg: "bg-coastal/15",  badge: "12 Beaches" },
            ].map((cat) => (
              <GlowCard key={cat.label} className={`rounded-2xl bg-gradient-to-br ${cat.grad} ring-1 ring-white/10 ${cat.ring} transition-all duration-300 cursor-pointer`}>
                <Link to="/destinations" className="flex flex-col p-9 relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`p-4 rounded-xl ${cat.iconBg} border border-white/10`}>
                      <cat.icon className="h-7 w-7 text-white/85" />
                    </div>
                    <span className="text-xs font-semibold border border-white/15 text-white/55 px-3 py-1 rounded-full bg-white/5">
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white mb-2 tracking-tight">{cat.label}</h3>
                  <p className="text-white/45 text-sm font-light leading-relaxed mb-6">{cat.desc}</p>
                  <div className="flex items-center gap-1.5 text-sm text-white/50 font-medium group-hover:text-white/80 transition-colors">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ANIMATED STATS ═══════════ */}
      <section className="py-20 bg-[#07071a] border-t border-white/5">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/8">
            {[
              { target: 30,  suffix: "+", label: "Eco Trails" },
              { target: 500, suffix: "+", label: "Ancient Temples" },
              { target: 12,  suffix: "",  label: "Hidden Beaches" },
              { target: 24,  suffix: "/7", label: "AI Assistance" },
            ].map((s, i) => (
              <div key={i} className="text-center px-4 group">
                <div className="font-display text-5xl md:text-6xl font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                  <AnimCounter target={s.target} suffix={s.suffix} />
                </div>
                <div className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ECO TEASER ═══════════ */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #07071a 0%, #0a1f14 100%)" }}>
        <Orb color="hsl(140 50% 40% / 0.22)" size={500}
          style={{ top: "50%", left: "60%", transform: "translate(-50%,-50%)", filter: "blur(130px)", animationDuration: "11s" }} />
        <div className="container mx-auto px-6 md:px-10 text-center max-w-xl relative z-10">
          <div className="inline-flex p-4 rounded-2xl bg-primary/15 border border-primary/20 mb-6">
            <Leaf className="h-8 w-8 text-primary/90" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">Travel Responsibly</h2>
          <p className="text-white/50 text-lg font-light leading-relaxed mb-8">
            Preserve the beauty of Andhra Pradesh for future generations. Every step you take can make a difference.
          </p>
          <Link to="/eco-awareness" id="eco-learn-more"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-primary/40 text-primary font-semibold hover:bg-primary/12 hover:border-primary/60 transition-all duration-200">
            Learn More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#04040f] border-t border-white/5 py-14 px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="font-display text-xl font-semibold text-white tracking-widest mb-5 opacity-70">ANDHRA TRAILS</p>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {[{ to: "/destinations", l: "Explore" }, { to: "/trip-planner", l: "Plan a Trip" }, { to: "/eco-awareness", l: "Sustainability" }].map(x => (
              <Link key={x.to} to={x.to} className="text-sm text-white/30 hover:text-white uppercase tracking-widest font-medium transition-colors">{x.l}</Link>
            ))}
          </div>
          <div className="w-12 h-px bg-white/10 mx-auto mb-7" />
          <p className="text-white/20 text-xs tracking-wider font-mono">© 2026 Smart Digital Platform for Eco & Cultural Tourism</p>
        </div>
      </footer>
    </div>
  );
}
