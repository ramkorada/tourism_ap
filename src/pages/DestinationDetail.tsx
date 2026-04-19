import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Star, Heart, Clock, IndianRupee, Car, Hotel, UtensilsCrossed, Landmark, Wine, Navigation, Calendar, ExternalLink, CheckCircle, AlertTriangle, Backpack, Users, Map, Phone, Globe, Shield } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { destinations } from "@/data/destinations";
import { destinationDetails } from "@/data/destinationDetails";
import { destinationImages } from "@/data/destinationImages";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import ReviewSection from "@/components/ReviewSection";
import WeatherWidget from "@/components/WeatherWidget";
import { GlowCard } from "@/components/GlowCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const typeIcons: Record<string, any> = {
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  pub: Wine,
  attraction: Landmark,
  transport: Car,
};

const typeLabels: Record<string, string> = {
  hotel: "Hotels",
  restaurant: "Restaurants",
  pub: "Cafés & Pubs",
  attraction: "Attractions",
  transport: "Transport",
};

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dest = destinations.find((d) => d.id === id);
  const detail = id ? destinationDetails[id] : null;
  const images = id ? destinationImages[id] || [] : [];
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (user && id) {
      apiFetch<{ is_favorite: boolean }>(`/favorites/check/${id}`).then(({ data }) => {
        setIsFav(data?.is_favorite ?? false);
      });
    }
  }, [user, id]);

  const toggleFav = async () => {
    if (!user) { toast({ title: "Sign in to save favorites", variant: "destructive" }); return; }
    if (isFav) {
      await apiFetch(`/favorites/${id!}`, { method: "DELETE" });
      setIsFav(false);
      toast({ title: "Removed from favorites" });
    } else {
      await apiFetch("/favorites", {
        method: "POST",
        body: JSON.stringify({ destination_id: id! }),
      });
      setIsFav(true);
      toast({ title: "Added to favorites ❤️" });
    }
  };

  if (!dest || !detail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-foreground mb-4">Destination not found</p>
          <Link to="/destinations" className="text-primary font-semibold hover:underline">← Back to Destinations</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "guide", label: "Travel Guide" },
    { id: "nearby", label: "Nearby Places" },
    { id: "travel", label: "Travel & Costs" },
    { id: "reviews", label: "Reviews" },
  ];

  const nearbyGroups = Object.entries(
    detail.nearbyPlaces.reduce((acc, p) => {
      (acc[p.type] = acc[p.type] || []).push(p);
      return acc;
    }, {} as Record<string, typeof detail.nearbyPlaces>)
  );

  return (
    <div className="min-h-screen bg-[#07071a] text-white">
      <Navbar />

      {/* Hero Image Carousel */}
      <div className="relative h-[50vh] min-h-[350px]">
        {images.length > 1 ? (
          <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="absolute inset-0 h-full"
          >
            <CarouselContent className="h-full -ml-0">
              {images.map((img, i) => (
                <CarouselItem key={i} className="h-full pl-0">
                  <img src={img} alt={`${dest.name} - ${i + 1}`} className="w-full h-[50vh] min-h-[350px] object-cover" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 z-20 bg-background/50 backdrop-blur-sm border-0 hover:bg-background/70" />
            <CarouselNext className="right-4 z-20 bg-background/50 backdrop-blur-sm border-0 hover:bg-background/70" />
          </Carousel>
        ) : (
          <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="hero-gradient-overlay absolute inset-0 z-10 pointer-events-none" />
        <div className="relative z-20 h-full flex flex-col justify-end container mx-auto px-4 pb-8">
          <Link to="/destinations" className="inline-flex items-center gap-1 text-primary-foreground/70 text-sm mb-4 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Destinations
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`${dest.category === "Eco" ? "category-eco" : dest.category === "Cultural" ? "category-cultural" : "category-coastal"} px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block`}>
                {dest.category}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">{dest.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-primary-foreground/80">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {dest.district}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" /> {dest.rating} ({dest.reviewCount.toLocaleString()})</span>
              </div>
            </div>
            <button onClick={toggleFav} className="mt-2 bg-primary-foreground/20 backdrop-blur-sm p-3 rounded-full hover:bg-primary-foreground/30 transition-colors">
              <Heart className={`h-6 w-6 ${isFav ? "fill-red-500 text-red-500" : "text-primary-foreground"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-2 space-y-6">
              <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="font-display text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  About {dest.name}
                </h2>
                <p className="text-white/70 leading-relaxed leading-7">{dest.description}</p>
              </GlowCard>

              <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="font-display text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  History
                </h2>
                <p className="text-white/70 leading-relaxed leading-7">{detail.history}</p>
              </GlowCard>

              <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="font-display text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  Culture & Traditions
                </h2>
                <p className="text-white/70 leading-relaxed leading-7">{detail.culture}</p>
              </GlowCard>
            </div>

            <div className="space-y-6">
              <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="font-display text-lg font-bold mb-4 text-white">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Best time to visit</span>
                      <span className="text-sm text-white/80">{detail.travelInfo.bestTimeToVisit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Ideal Duration</span>
                      <span className="text-sm text-white/80">{detail.travelInfo.idealDuration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">Daily Budget</span>
                      <span className="text-sm text-white/80">{detail.travelInfo.estimatedDailyCost.budget} / day</span>
                    </div>
                  </div>
                </div>
              </GlowCard>

              <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-primary" /> Best For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detail.guideInfo.bestFor.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-primary/15 text-primary border border-primary/20 text-xs font-semibold rounded-full uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlowCard>

              <div className="space-y-3">
                <a href={dest.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-4 rounded-2xl font-bold hover:brightness-110 transition-all w-full shadow-lg shadow-primary/20">
                  <Navigation className="h-4 w-4" /> View Map
                </a>
                {userLocation && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(dest.name + " Andhra Pradesh")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white px-5 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all w-full"
                  >
                    <Car className="h-4 w-4" /> Get Directions
                  </a>
                )}
              </div>

              <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-1 overflow-hidden">
                <WeatherWidget destinationId={dest.id} />
              </GlowCard>
            </div>
          </div>
               {activeTab === "guide" && (
          <div className="grid lg:grid-cols-2 gap-6 relative z-10">
            {/* Must Visit */}
            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-accent fill-accent" /> Must-Visit Spots
              </h2>
              <ul className="space-y-4">
                {detail.guideInfo.mustVisitSpots.map((spot, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/70">
                    <CheckCircle className="h-5 w-5 text-eco mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{spot}</span>
                  </li>
                ))}
              </ul>
            </GlowCard>

            {/* Local Tips */}
            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Local Tips
              </h2>
              <ul className="space-y-4">
                {detail.guideInfo.localTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-white/70">
                    <span className="text-primary font-bold flex-shrink-0 text-lg">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </GlowCard>

            {/* Safety Tips */}
            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" /> Safety First
              </h2>
              <ul className="space-y-4">
                {detail.guideInfo.safetyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-red-400/5 border border-red-400/10 text-sm text-white/70">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </GlowCard>

            {/* What to Carry */}
            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Backpack className="h-5 w-5 text-primary" /> What to Carry
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {detail.guideInfo.whatToCarry.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white/80">
                    <CheckCircle className="h-4 w-4 text-primary" /> {item}
                  </div>
                ))}
              </div>
            </GlowCard>

            {/* Travel Guide Contacts */}
            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 lg:col-span-2 shadow-2xl" id="guide-contacts">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" /> Local Contacts & Helplines
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {detail.guideContacts.map((contact, i) => {
                  const typeColors: Record<string, string> = {
                    helpline: "text-eco bg-eco/20 border-eco/30",
                    tour_operator: "text-coastal bg-coastal/20 border-coastal/30",
                    local_guide: "text-cultural bg-cultural/20 border-cultural/30",
                    emergency: "text-destructive bg-destructive/20 border-destructive/30",
                    temple: "text-accent bg-accent/20 border-accent/30",
                    tourism_office: "text-primary bg-primary/20 border-primary/30",
                  };
                  return (
                    <div key={i} className="flex flex-col gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-white text-sm">{contact.name}</p>
                          <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block border font-bold ${typeColors[contact.type] || "bg-white/10 text-white/50 border-white/10"}`}>
                            {contact.type.replace("_", " ")}
                          </span>
                        </div>
                        {contact.type === "emergency" && <Shield className="h-4 w-4 text-red-400" />}
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed italic">"{contact.description}"</p>
                      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                          <Phone className="h-3 w-3" /> {contact.phone}
                        </a>
                        {contact.website && (
                          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 text-xs hover:text-primary transition-colors">
                            <Globe className="h-3 w-3" /> Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlowCard>
          </div>
        )}

        )}

        {activeTab === "nearby" && (
          <div className="space-y-12 relative z-10">
            {nearbyGroups.map(([type, places]) => {
              const Icon = typeIcons[type] || Landmark;
              return (
                <div key={type}>
                  <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Icon className="h-7 w-7 text-primary" /> {typeLabels[type] || type}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {places.map((place, i) => (
                      <GlowCard key={i} className="bg-white/4 border-white/10 rounded-2xl p-5 shadow-2xl">
                        <h3 className="font-bold text-white text-lg mb-2">{place.name}</h3>
                        <div className="space-y-2 text-sm text-white/60">
                          <p className="flex items-center gap-2">📍 {place.distance} away</p>
                          <p className="flex items-center gap-2">💰 {place.priceRange}</p>
                          <div className="flex items-center gap-1 text-accent font-bold">
                            <Star className="h-4 w-4 fill-accent" />
                            <span>{place.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                          {place.bookingUrl && (
                            <a href={place.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold hover:bg-primary/20 transition-colors">
                              Book Now
                            </a>
                          )}
                          {place.mapUrl && (
                            <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white transition-colors">
                              <Map className="h-4 w-4 inline mr-1" /> Map
                            </a>
                          )}
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                </div>
            </div>
        )}

        {activeTab === "travel" && (
          <div className="grid lg:grid-cols-2 gap-8 relative z-10">
            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" /> How to Get There
              </h2>
              <div className="space-y-3">
                {[
                  { city: "Hyderabad", info: detail.travelInfo.fromHyderabad },
                  { city: "Visakhapatnam", info: detail.travelInfo.fromVisakhapatnam },
                  { city: "Vijayawada", info: detail.travelInfo.fromVijayawada },
                ].map(({ city, info }) => (
                  <div key={city} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-bold text-white text-sm">From {city}</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{info.mode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-sm">{info.distance}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{info.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>

            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" /> Estimated Daily Cost
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Budget Explorer", range: detail.travelInfo.estimatedDailyCost.budget, color: "bg-eco", desc: "Basic dorms & street food" },
                  { label: "Comfort Traveler", range: detail.travelInfo.estimatedDailyCost.mid, color: "bg-coastal", desc: "AC rooms & local restaurants" },
                  { label: "Luxury Escapist", range: detail.travelInfo.estimatedDailyCost.luxury, color: "bg-cultural", desc: "Top resorts & private tours" },
                ].map(({ label, range, color, desc }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${color}`} />
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{label}</span>
                        <span className="text-[10px] text-white/40">{desc}</span>
                      </div>
                    </div>
                    <span className="font-black text-white text-sm">{range}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <p className="text-sm text-white/80">Ideal trip duration: <strong className="text-white text-lg ml-1 font-display tracking-tight">{detail.travelInfo.idealDuration}</strong></p>
              </div>
            </GlowCard>

            <GlowCard className="bg-white/4 border-white/10 rounded-2xl p-6 lg:col-span-2 shadow-2xl">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" /> Trusted Cab Services
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {detail.cabServices.map((cab, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/8 transition-all">
                    <div className="flex flex-col gap-1">
                      <p className="font-bold text-white text-sm">{cab.name}</p>
                      <a href={`tel:${cab.contact}`} className="text-xs text-primary font-bold hover:underline">{cab.contact}</a>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-white">{cab.pricePerKm}</span>
                       <p className="text-[9px] text-white/30 uppercase tracking-widest">per km</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>
        )}

        {activeTab === "reviews" && <ReviewSection destinationId={dest.id} />}
      </div>
    </div>
  );
};

export default DestinationDetail;
