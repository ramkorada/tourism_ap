import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { destinations } from "@/data/destinations";
import { destinationDetails } from "@/data/destinationDetails";
import { destinationImages } from "@/data/destinationImages";
import Navbar from "@/components/Navbar";
import GlowCard from "@/components/GlowCard";
import {
  Plus, X, MapPin, IndianRupee, Calendar,
  ArrowRight, Route, Clock, CheckCircle2,
} from "lucide-react";

const TripPlanner = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const selectedDests = selected.map((id) => ({
    dest: destinations.find((d) => d.id === id)!,
    detail: destinationDetails[id],
  }));

  const parseBudget = (range: string) => {
    const match = range.match(/[\d,]+/g);
    if (!match) return 0;
    return parseInt(match[0].replace(",", ""));
  };

  const totalDays = selectedDests.reduce((sum, { detail }) => {
    const match = detail.travelInfo.idealDuration.match(/\d+/);
    return sum + (match ? parseInt(match[0]) : 1);
  }, 0);
  const totalBudget = selectedDests.reduce(
    (sum, { detail }) => sum + parseBudget(detail.travelInfo.estimatedDailyCost.budget), 0
  );
  const totalMid = selectedDests.reduce(
    (sum, { detail }) => sum + parseBudget(detail.travelInfo.estimatedDailyCost.mid), 0
  );
  const totalLuxury = selectedDests.reduce(
    (sum, { detail }) => sum + parseBudget(detail.travelInfo.estimatedDailyCost.luxury), 0
  );

  let dayCounter = 0;
  const itinerary = selectedDests.map(({ dest, detail }) => {
    const daysMatch = detail.travelInfo.idealDuration.match(/\d+/);
    const days = daysMatch ? parseInt(daysMatch[0]) : 1;
    const startDay = dayCounter + 1;
    dayCounter += days;
    return { dest, detail, startDay, endDay: dayCounter, days };
  });

  return (
    <div className="min-h-screen bg-[#07071a] text-white font-body">
      <Navbar />

      {/* Page-wide cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(100,200,255,0.04), transparent 45%)`,
        }}
      />

      {/* Hero banner */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-10 left-[15%] w-80 h-80 bg-secondary/20 rounded-full blur-[110px] pointer-events-none animate-blob" />
        <div className="absolute top-5 right-[15%] w-60 h-60 bg-primary/20 rounded-full blur-[90px] pointer-events-none animate-blob animation-delay-2000" />
        <div className="container mx-auto relative z-10">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-secondary/80 mb-3">
            Build Your Adventure
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-white mb-3 tracking-tight">
            Trip Planner
          </h1>
          <p className="text-white/50 text-lg font-light">
            Select destinations to build your custom Andhra Pradesh itinerary
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-12">

        {/* ── Destination selector ── */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/35 font-semibold mb-5">
            Choose destinations ({selected.length} selected)
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map((dest) => {
              const isSelected = selected.includes(dest.id);
              const images = destinationImages[dest.id] || [dest.image];
              return (
                <GlowCard
                  key={dest.id}
                  className={`rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/40 shadow-lg shadow-primary/10"
                      : "border-white/10 bg-white/4 hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => toggle(dest.id)}
                    className="flex items-center gap-3 p-4 w-full text-left relative z-10"
                  >
                    <img
                      src={images[0]}
                      alt={dest.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-semibold text-white truncate mb-0.5">
                        {dest.name}
                      </h3>
                      <span className="text-xs text-white/45 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {dest.district}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Plus className="h-5 w-5 text-white/30" />
                      )}
                    </div>
                  </button>
                </GlowCard>
              );
            })}
          </div>
        </div>

        {/* ── Itinerary ── */}
        {selected.length === 0 ? (
          <div className="text-center py-24 mt-8">
            <div className="inline-flex p-6 rounded-full bg-white/4 border border-white/8 mb-6">
              <Route className="h-12 w-12 text-white/20" />
            </div>
            <p className="text-white/35 text-lg font-light">
              Tap destinations above to start planning your trip
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {/* Itinerary list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-white flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-primary" /> Your Itinerary
              </h2>
              {itinerary.map(({ dest, detail, startDay, endDay, days }, i) => (
                <GlowCard
                  key={dest.id}
                  className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden"
                >
                  <div className="p-5 relative z-10">
                    {i < itinerary.length - 1 && (
                      <div className="absolute left-[2.2rem] bottom-0 translate-y-full h-4 w-px bg-white/10 z-20" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-lg shadow-primary/30">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <h3 className="font-display text-lg font-semibold text-white">
                            {dest.name}
                          </h3>
                          <span className="text-xs border border-white/10 bg-white/5 text-white/50 px-3 py-1 rounded-full">
                            Day {startDay}{endDay > startDay ? `–${endDay}` : ""} · {days}d
                          </span>
                        </div>
                        <p className="text-sm text-white/45 font-light mb-3 leading-relaxed">
                          {dest.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/40 mb-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-primary/70" />
                            Best: {detail.travelInfo.bestTimeToVisit}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IndianRupee className="h-3 w-3 text-primary/70" />
                            {detail.travelInfo.estimatedDailyCost.budget}/day
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {detail.guideInfo.mustVisitSpots.slice(0, 4).map((spot) => (
                            <span key={spot} className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary/80 rounded-full border border-primary/20">
                              {spot}
                            </span>
                          ))}
                          {detail.guideInfo.mustVisitSpots.length > 4 && (
                            <span className="text-[10px] px-2.5 py-1 bg-white/5 text-white/35 rounded-full border border-white/10">
                              +{detail.guideInfo.mustVisitSpots.length - 4} more
                            </span>
                          )}
                        </div>
                        <Link to={`/destination/${dest.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1">
                          View full details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>

            {/* Summary sidebar */}
            <div>
              <GlowCard className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden sticky top-24">
                <div className="p-6 relative z-10">
                  <h3 className="font-display text-lg font-semibold text-white mb-5">
                    Trip Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/8">
                      <span className="text-white/45">Destinations</span>
                      <span className="font-semibold text-white">{selected.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/8">
                      <span className="text-white/45">Total Duration</span>
                      <span className="font-semibold text-white">{totalDays} days</span>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">
                        Estimated Total Cost
                      </p>
                      {[
                        { label: "Budget", total: totalBudget * totalDays, color: "bg-eco" },
                        { label: "Mid-Range", total: totalMid * totalDays, color: "bg-coastal" },
                        { label: "Luxury", total: totalLuxury * totalDays, color: "bg-cultural" },
                      ].map(({ label, total, color }) => (
                        <div key={label} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color}`} />
                            <span className="text-white/60">{label}</span>
                          </div>
                          <span className="font-semibold text-white">
                            ₹{total.toLocaleString("en-IN")}+
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/8">
                      <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">Route Order</p>
                      <div className="space-y-2">
                        {itinerary.map(({ dest }, i) => (
                          <div key={dest.id} className="flex items-center gap-2 text-xs text-white/55">
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            {dest.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selected.length >= 2 && (
                      <a
                        href={`https://www.google.com/maps/dir/${selectedDests
                          .map(({ dest }) => encodeURIComponent(dest.name + " Andhra Pradesh"))
                          .join("/")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-all w-full mt-4 shadow-lg shadow-primary/20"
                      >
                        <Route className="h-4 w-4" /> View Route on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </GlowCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
