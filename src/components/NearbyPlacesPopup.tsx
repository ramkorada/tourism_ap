import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  X, MapPin, Navigation, Clock, Landmark, Waves, Mountain,
  TreePine, Castle, BookOpen, ParkingSquare, Fish, Droplets, Compass,
  Sparkles, ChevronRight,
} from "lucide-react";
import { nearbyFamousPlaces, getDistanceKm, type NearbyPlace } from "@/data/nearbyPlaces";

/* ── Icon / color map by place type ── */
const typeConfig: Record<string, { icon: typeof MapPin; color: string; bg: string; glow: string }> = {
  temple:    { icon: Landmark,       color: "text-amber-400",   bg: "bg-amber-500/10",  glow: "rgba(245,158,11,0.15)" },
  beach:     { icon: Waves,          color: "text-cyan-400",    bg: "bg-cyan-500/10",   glow: "rgba(6,182,212,0.15)" },
  waterfall: { icon: Droplets,       color: "text-blue-400",    bg: "bg-blue-500/10",   glow: "rgba(59,130,246,0.15)" },
  hill:      { icon: Mountain,       color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "rgba(16,185,129,0.15)" },
  monument:  { icon: BookOpen,       color: "text-violet-400",  bg: "bg-violet-500/10", glow: "rgba(139,92,246,0.15)" },
  lake:      { icon: Fish,           color: "text-teal-400",    bg: "bg-teal-500/10",   glow: "rgba(20,184,166,0.15)" },
  wildlife:  { icon: TreePine,       color: "text-green-400",   bg: "bg-green-500/10",  glow: "rgba(34,197,94,0.15)" },
  fort:      { icon: Castle,         color: "text-orange-400",  bg: "bg-orange-500/10", glow: "rgba(249,115,22,0.15)" },
  museum:    { icon: BookOpen,       color: "text-pink-400",    bg: "bg-pink-500/10",   glow: "rgba(236,72,153,0.15)" },
  park:      { icon: ParkingSquare,  color: "text-lime-400",    bg: "bg-lime-500/10",   glow: "rgba(132,204,22,0.15)" },
};

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
function fmtDrive(km: number): string {
  const mins = Math.round((km / 40) * 60);
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

interface PlaceWithDist extends NearbyPlace { distance: number; }

/* ── Individual Place Card with its own mouse glow ── */
const PlaceCard = ({
  place, index, coords, onDismiss,
}: {
  place: PlaceWithDist; index: number; coords: { lat: number; lng: number } | null; onDismiss: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 });
  const cfg = typeConfig[place.type] || typeConfig.monument;
  const Icon = cfg.icon;

  const directionsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${place.lat},${place.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setGlow({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 });
  };
  const onLeave = () => setGlow((p) => ({ ...p, opacity: 0 }));

  const inner = (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative group rounded-2xl border border-white/[0.07] overflow-hidden
                 transition-all duration-300 cursor-pointer
                 hover:border-white/[0.15] hover:shadow-lg hover:shadow-primary/5
                 hover:translate-y-[-2px]"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      {/* Mouse-tracking glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(320px circle at ${glow.x}px ${glow.y}px, ${cfg.glow}, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-start gap-4 p-5">
        {/* Icon with rank */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl ${cfg.bg} backdrop-blur-sm
                          flex items-center justify-center
                          border border-white/[0.08]
                          group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-5 w-5 ${cfg.color}`} />
          </div>
          <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full
                           bg-gradient-to-br from-primary to-secondary
                           flex items-center justify-center
                           text-[10px] font-bold text-white shadow-lg shadow-primary/30
                           border border-white/20">
            {index + 1}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="font-display text-[15px] font-semibold text-white/90
                           group-hover:text-white transition-colors leading-tight">
              {place.name}
            </h3>
            <span className="text-[11px] font-bold text-primary/90
                            bg-primary/10 border border-primary/15
                            px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0
                            backdrop-blur-sm">
              {fmtDist(place.distance)}
            </span>
          </div>

          <p className="text-[12px] text-white/35 leading-relaxed mb-3 line-clamp-2
                        group-hover:text-white/45 transition-colors">
            {place.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-white/25 flex items-center gap-1.5
                            group-hover:text-white/40 transition-colors">
              <MapPin className="h-3 w-3" /> {place.city}
            </span>
            <span className="text-[11px] text-white/25 flex items-center gap-1.5
                            group-hover:text-white/40 transition-colors">
              <Clock className="h-3 w-3" /> {fmtDrive(place.distance)}
            </span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto text-[11px] text-primary/70 font-semibold
                         flex items-center gap-1
                         hover:text-primary transition-colors"
            >
              <Navigation className="h-3 w-3" /> Directions
              <ChevronRight className="h-3 w-3 opacity-50" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return place.destId ? (
    <Link to={`/destination/${place.destId}`} onClick={onDismiss}>{inner}</Link>
  ) : (
    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
  );
};


/* ═══════════════════════════════════════════════════════════════════
   Main Popup
   ═══════════════════════════════════════════════════════════════════ */
const NearbyPlacesPopup = () => {
  const [phase, setPhase] = useState<"idle" | "asking" | "loading" | "show" | "denied" | "dismissed">("idle");
  const [places, setPlaces] = useState<PlaceWithDist[]>([]);
  const [userCity, setUserCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hasLocationData, setHasLocationData] = useState(false);

  // Mouse glow for the whole popup container
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelGlow, setPanelGlow] = useState({ x: 0, y: 0, opacity: 0 });

  const onPanelMove = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    setPanelGlow({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 });
  }, []);
  const onPanelLeave = useCallback(() => {
    setPanelGlow((p) => ({ ...p, opacity: 0 }));
  }, []);

  /* ── Auto-show on first visit ── */
  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem("nearby-dismissed");
    if (alreadyDismissed) { setPhase("dismissed"); return; }
    const timer = setTimeout(() => {
      if (!navigator.geolocation) { setPhase("dismissed"); return; }
      setPhase("asking");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  /* ── Listen for re-open event from Navbar ── */
  useEffect(() => {
    const handleReopen = () => {
      if (hasLocationData) { setPhase("show"); }
      else { setPhase("asking"); }
    };
    window.addEventListener("reopen-nearby", handleReopen);
    return () => window.removeEventListener("reopen-nearby", handleReopen);
  }, [hasLocationData]);

  /* ── Geolocation handler ── */
  const requestLocation = () => {
    setPhase("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12`,
            { headers: { "User-Agent": "AndhraTrails/1.0" } }
          );
          const data = await res.json();
          setUserCity(
            data?.address?.city || data?.address?.town || data?.address?.village ||
            data?.address?.county || data?.address?.state_district || ""
          );
        } catch { setUserCity(""); }

        const withDist = nearbyFamousPlaces
          .map((p) => ({ ...p, distance: getDistanceKm(lat, lng, p.lat, p.lng) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 8);
        setPlaces(withDist);
        setHasLocationData(true);
        setPhase("show");
      },
      () => { setPhase("denied"); setTimeout(() => setPhase("dismissed"), 4000); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const dismiss = () => {
    setPhase("dismissed");
    sessionStorage.setItem("nearby-dismissed", "1");
  };

  if (phase === "dismissed" || phase === "idle") return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* ── Popup Container ── */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={panelRef}
          onMouseMove={onPanelMove}
          onMouseLeave={onPanelLeave}
          className="pointer-events-auto w-full max-w-[520px] max-h-[88vh]
                     rounded-[28px] overflow-hidden
                     shadow-[0_32px_100px_-12px_rgba(0,0,0,0.7)]
                     border border-white/[0.08]
                     animate-in slide-in-from-bottom-8 zoom-in-95 duration-500
                     relative"
          style={{
            background: "linear-gradient(168deg, rgba(18,18,42,0.92) 0%, rgba(10,10,28,0.96) 50%, rgba(8,8,22,0.98) 100%)",
            backdropFilter: "blur(40px) saturate(1.8)",
          }}
        >
          {/* Panel-level mouse glow */}
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 rounded-[28px]"
            style={{
              opacity: panelGlow.opacity * 0.6,
              background: `radial-gradient(600px circle at ${panelGlow.x}px ${panelGlow.y}px,
                rgba(100,200,220,0.08), transparent 50%)`,
            }}
          />

          {/* Decorative gradient orbs inside the panel */}
          <div className="pointer-events-none absolute top-0 right-0 w-60 h-60 bg-primary/8 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 bg-secondary/6 rounded-full blur-[70px] translate-y-1/3 -translate-x-1/4" />

          {/* ── Header ── */}
          <div className="relative z-10 px-7 pt-7 pb-2">
            <button
              onClick={dismiss}
              className="absolute top-5 right-5 p-2 rounded-xl
                         bg-white/[0.05] backdrop-blur-sm border border-white/[0.06]
                         hover:bg-white/[0.12] hover:border-white/[0.12]
                         text-white/40 hover:text-white
                         transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl
                             bg-gradient-to-br from-primary/90 to-secondary/90
                             flex items-center justify-center
                             shadow-xl shadow-primary/20
                             border border-white/10">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  {phase === "asking"  && "Discover Near You"}
                  {phase === "loading" && "Finding you…"}
                  {phase === "denied"  && "Location denied"}
                  {phase === "show"    && "Near You"}
                </h2>
                {phase === "show" && userCity && (
                  <p className="text-[12px] text-white/40 flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-primary/60" />
                    Based on your location in
                    <span className="text-primary font-semibold">{userCity}</span>
                  </p>
                )}
                {phase === "asking" && (
                  <p className="text-[12px] text-white/35 mt-1">Temples • Beaches • Waterfalls • Forts</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="relative z-10 mx-7 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-3" />

          {/* ── Asking State ── */}
          {phase === "asking" && (
            <div className="relative z-10 px-7 pb-7 pt-3">
              <p className="text-sm text-white/40 leading-relaxed mb-6">
                Allow location access to discover famous attractions near your
                current location — powered by real GPS data.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={requestLocation}
                  className="flex-1 flex items-center justify-center gap-2.5
                             px-6 py-3.5 rounded-2xl
                             bg-gradient-to-r from-primary to-primary/80
                             text-white font-semibold text-sm
                             hover:brightness-110 hover:shadow-lg hover:shadow-primary/25
                             active:scale-[0.98]
                             transition-all duration-200"
                >
                  <Navigation className="h-4 w-4" /> Allow Location
                </button>
                <button
                  onClick={dismiss}
                  className="px-6 py-3.5 rounded-2xl
                             border border-white/[0.08] bg-white/[0.03]
                             text-white/40 text-sm font-medium
                             hover:bg-white/[0.07] hover:text-white/60 hover:border-white/[0.12]
                             transition-all duration-200"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* ── Loading State ── */}
          {phase === "loading" && (
            <div className="relative z-10 px-7 pb-10 pt-6 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 bg-primary/10 rounded-full blur-lg animate-pulse" />
              </div>
              <p className="text-sm text-white/35 font-light">Locating you on the map…</p>
            </div>
          )}

          {/* ── Denied State ── */}
          {phase === "denied" && (
            <div className="relative z-10 px-7 pb-7 pt-3">
              <p className="text-sm text-white/40 leading-relaxed">
                Location access was denied. Enable it in browser settings to see nearby attractions.
              </p>
            </div>
          )}

          {/* ── Results ── */}
          {phase === "show" && (
            <div className="relative z-10 px-5 pb-5 overflow-y-auto max-h-[calc(88vh-160px)]
                           no-scrollbar">
              {/* Subtle label */}
              <div className="flex items-center gap-2 px-2 mb-4">
                <Sparkles className="h-3 w-3 text-primary/50" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-semibold">
                  {places.length} places found nearby
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/[0.05] to-transparent" />
              </div>

              {/* Place cards */}
              <div className="space-y-3">
                {places.map((place, i) => (
                  <PlaceCard
                    key={place.name}
                    place={place}
                    index={i}
                    coords={coords}
                    onDismiss={dismiss}
                  />
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-4 border-t border-white/[0.05]">
                <Link
                  to="/destinations"
                  onClick={dismiss}
                  className="flex items-center justify-center gap-2.5
                             w-full px-5 py-3.5 rounded-2xl
                             bg-white/[0.03] border border-white/[0.06]
                             text-white/45 text-sm font-medium
                             hover:bg-white/[0.07] hover:text-white/70 hover:border-white/[0.1]
                             transition-all duration-200"
                >
                  <Compass className="h-4 w-4" /> Explore All Destinations
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NearbyPlacesPopup;
