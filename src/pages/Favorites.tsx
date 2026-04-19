import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";
import { destinations } from "@/data/destinations";
import DestinationCard from "@/components/DestinationCard";
import Navbar from "@/components/Navbar";
import GlowCard from "@/components/GlowCard";

const Favorites = () => {
  const { user } = useAuth();
  const [favIds, setFavIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    apiFetch<{ destination_id: string }[]>("/favorites").then(({ data }) => {
      setFavIds(data?.map((f) => f.destination_id) || []);
      setLoading(false);
    });
  }, [user]);

  const favDestinations = destinations.filter((d) => favIds.includes(d.id));

  return (
    <div className="min-h-screen bg-[#07071a] text-white font-body">
      <Navbar />

      {/* Page-wide cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(220,100,130,0.05), transparent 45%)`,
        }}
      />

      {/* Hero banner */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-white/5">
        {/* Decorative orbs */}
        <div className="absolute top-10 left-[20%] w-72 h-72 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none animate-blob" />
        <div className="absolute top-10 right-[15%] w-56 h-56 bg-primary/20 rounded-full blur-[90px] pointer-events-none animate-blob animation-delay-2000" />

        <div className="container mx-auto relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/20">
              <Heart className="h-8 w-8 text-rose-400 fill-rose-400" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-rose-400/80 mb-1">
                Your Collection
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-semibold text-white tracking-tight">
                My Favourites
              </h1>
            </div>
          </div>

          {user && !loading && favDestinations.length > 0 && (
            <p className="text-white/45 text-lg font-light mt-3">
              {favDestinations.length} saved destination{favDestinations.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-14">

        {/* ── Not logged in ── */}
        {!user ? (
          <GlowCard className="rounded-2xl border border-white/10 bg-white/4 max-w-md mx-auto">
            <div className="p-12 text-center relative z-10">
              <div className="inline-flex p-5 rounded-full bg-rose-500/10 border border-rose-500/15 mb-6">
                <Heart className="h-10 w-10 text-rose-400/60" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-white mb-3">Sign in to save favourites</h2>
              <p className="text-white/45 font-light mb-6">
                Create an account or sign in to keep track of your favourite destinations across devices.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-4 h-4" /> Sign In
              </Link>
            </div>
          </GlowCard>

        /* ── Loading ── */
        ) : loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-white/4 h-64 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>

        /* ── No favourites ── */
        ) : favDestinations.length === 0 ? (
          <GlowCard className="rounded-2xl border border-white/10 bg-white/4 max-w-md mx-auto">
            <div className="p-12 text-center relative z-10">
              <div className="inline-flex p-5 rounded-full bg-white/5 border border-white/10 mb-6">
                <Heart className="h-10 w-10 text-white/20" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-white mb-3">No favourites yet</h2>
              <p className="text-white/45 font-light mb-6">
                Explore destinations and tap the ♥ icon to save them here.
              </p>
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-white/15 bg-white/6 text-white font-semibold hover:bg-white/12 hover:border-white/30 transition-all"
              >
                Browse Destinations →
              </Link>
            </div>
          </GlowCard>

        /* ── Favourites grid ── */
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favDestinations.map((dest, i) => (
              <GlowCard
                key={dest.id}
                className="rounded-2xl border border-white/10 bg-white/4 shadow-xl overflow-hidden"
              >
                <DestinationCard destination={dest} index={i} />
              </GlowCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
