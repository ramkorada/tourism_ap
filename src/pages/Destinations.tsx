import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { destinations, type Category } from "@/data/destinations";
import DestinationCard from "@/components/DestinationCard";
import Navbar from "@/components/Navbar";
import GlowCard from "@/components/GlowCard";

const categories: (Category | "All")[] = ["All", "Eco", "Cultural", "Coastal"];

const categoryStyles: Record<string, { active: string; dot: string }> = {
  All: { active: "bg-white text-black", dot: "bg-white" },
  Eco: { active: "bg-eco text-white", dot: "bg-eco" },
  Cultural: { active: "bg-cultural text-white", dot: "bg-cultural" },
  Coastal: { active: "bg-coastal text-white", dot: "bg-coastal" },
};

const Destinations = () => {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      const matchCategory =
        activeCategory === "All" || d.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07071a] text-white font-body">
      <Navbar />

      {/* Page-wide cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(100,220,200,0.05), transparent 45%)`,
        }}
      />

      {/* Hero banner */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-10 left-[20%] w-72 h-72 bg-primary/25 rounded-full blur-[100px] pointer-events-none animate-blob" />
        <div className="absolute top-10 right-[10%] w-56 h-56 bg-secondary/20 rounded-full blur-[90px] pointer-events-none animate-blob animation-delay-2000" />

        <div className="container mx-auto relative z-10">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/80 mb-3">
            Explore Andhra Pradesh
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-white mb-3 tracking-tight">
            All Destinations
          </h1>
          <p className="text-white/50 text-lg font-light">
            Discover {destinations.length} incredible places across Andhra Pradesh
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-12">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
            <input
              type="text"
              placeholder="Search destinations, districts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap items-center">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isActive
                      ? `${categoryStyles[cat].active} border-transparent shadow-lg`
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {!isActive && (
                    <span className={`w-2 h-2 rounded-full ${categoryStyles[cat].dot} opacity-70`} />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-white/35 uppercase tracking-widest font-medium mb-6">
          {filtered.length} destination{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Results grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((dest, i) => (
              <GlowCard
                key={dest.id}
                className="rounded-2xl border border-white/10 bg-white/4 shadow-xl overflow-hidden"
              >
                <DestinationCard destination={dest} index={i} />
              </GlowCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-5">🔍</div>
            <p className="text-white/40 text-lg font-light">
              No destinations found for &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
