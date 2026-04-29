/**
 * Nearby famous places across Andhra Pradesh with GPS coordinates.
 * Used by the NearbyPlacesPopup to show location-based suggestions.
 */

export interface NearbyPlace {
  name: string;
  lat: number;
  lng: number;
  type: "temple" | "beach" | "waterfall" | "hill" | "monument" | "lake" | "wildlife" | "fort" | "museum" | "park";
  city: string;
  district: string;
  description: string;
  image?: string;
  /** Link to a destination detail page if this place matches an app destination */
  destId?: string;
}

export const nearbyFamousPlaces: NearbyPlace[] = [
  // ── Vijayawada / Guntur / Mangalagiri Region ──
  { name: "Kanaka Durga Temple", lat: 16.5175, lng: 80.6095, type: "temple", city: "Vijayawada", district: "NTR", description: "Ancient temple atop Indrakeeladri hill dedicated to Goddess Durga, overlooking the Krishna River." },
  { name: "Panakala Narasimha Swamy Temple", lat: 16.4307, lng: 80.5682, type: "temple", city: "Mangalagiri", district: "Guntur", description: "Famous temple where jaggery water (panakam) offered to the deity disappears — a unique marvel." },
  { name: "Undavalli Caves", lat: 16.4960, lng: 80.5810, type: "monument", city: "Undavalli", district: "Guntur", description: "4th–5th century rock-cut caves with a magnificent reclining Vishnu statue carved from a single granite block." },
  { name: "Prakasam Barrage", lat: 16.5097, lng: 80.6210, type: "monument", city: "Vijayawada", district: "NTR", description: "Iconic barrage across the Krishna River offering beautiful sunset views and evening lights." },
  { name: "Bhavani Island", lat: 16.5060, lng: 80.5960, type: "park", city: "Vijayawada", district: "NTR", description: "One of the largest river islands in India, a popular recreation and picnic spot on the Krishna." },
  { name: "Amaravati Stupa", lat: 16.5730, lng: 80.3570, type: "monument", city: "Amaravati", district: "Guntur", description: "Ancient 2000-year-old Buddhist stupa, one of the largest in India with exquisite marble carvings.", destId: "amaravati" },
  { name: "Kondapalli Fort", lat: 16.6170, lng: 80.5390, type: "fort", city: "Kondapalli", district: "NTR", description: "14th-century hilltop fort known for Kondapalli toys — a GI-tagged wooden toy craft." },
  { name: "Mogalrajpuram Caves", lat: 16.5040, lng: 80.6330, type: "monument", city: "Vijayawada", district: "NTR", description: "5th-century rock-cut cave temples with rare Ardhanarishvara sculpture." },

  // ── Tirupati / Chittoor Region ──
  { name: "Sri Venkateswara Temple (Tirumala)", lat: 13.6833, lng: 79.3474, type: "temple", city: "Tirumala", district: "Tirupati", description: "World's richest and most visited Hindu temple dedicated to Lord Venkateswara.", destId: "tirupati" },
  { name: "Sri Padmavathi Temple", lat: 13.6288, lng: 79.4192, type: "temple", city: "Tiruchanur", district: "Tirupati", description: "Sacred temple dedicated to Goddess Padmavathi, consort of Lord Venkateswara." },
  { name: "Talakona Waterfalls", lat: 13.6680, lng: 79.1160, type: "waterfall", city: "Talakona", district: "Tirupati", description: "Highest waterfall in AP at 270 feet inside the Sri Venkateswara National Park.", destId: "talakona" },
  { name: "Horsley Hills", lat: 13.6600, lng: 78.3960, type: "hill", city: "Horsley Hills", district: "Chittoor", description: "Scenic hill station at 1265m with a 1450-year-old Eucalyptus tree and panoramic views.", destId: "horsley-hills" },
  { name: "Chandragiri Fort", lat: 13.5870, lng: 79.3190, type: "fort", city: "Chandragiri", district: "Tirupati", description: "Historic Vijayanagara-era fort with a palace housing a museum of archaeological artefacts." },
  { name: "Sri Kalahasti Temple", lat: 13.7497, lng: 79.6983, type: "temple", city: "Srikalahasti", district: "Tirupati", description: "One of the Pancha Bhoota Sthalams representing wind (Vayu), known for Rahu-Ketu puja." },
  { name: "Pulicat Lake", lat: 13.4170, lng: 80.3170, type: "lake", city: "Pulicat", district: "Tirupati", description: "Second largest brackish water lagoon in India, famous for flamingos and migratory birds.", destId: "pulicat-lake" },

  // ── Visakhapatnam Region ──
  { name: "Rishikonda Beach", lat: 17.7730, lng: 83.3840, type: "beach", city: "Visakhapatnam", district: "Visakhapatnam", description: "Golden sandy beach known as 'Jewel of the East Coast' with water sports and surfing.", destId: "rishikonda" },
  { name: "Yarada Beach", lat: 17.6570, lng: 83.2720, type: "beach", city: "Visakhapatnam", district: "Visakhapatnam", description: "Secluded beach surrounded by hills on three sides with crystal-clear waters.", destId: "yarada" },
  { name: "Kailasagiri", lat: 17.7560, lng: 83.3720, type: "park", city: "Visakhapatnam", district: "Visakhapatnam", description: "Hilltop park with giant Shiva-Parvati statues and panoramic views of the city and Bay of Bengal." },
  { name: "Submarine Museum (INS Kurusura)", lat: 17.7150, lng: 83.3280, type: "museum", city: "Visakhapatnam", district: "Visakhapatnam", description: "India's first submarine museum — walk through a decommissioned INS Kurusura submarine." },
  { name: "Araku Valley", lat: 18.3270, lng: 82.8750, type: "hill", city: "Araku", district: "Alluri Sitharama Raju", description: "Pristine hill station with coffee plantations, tribal culture, and lush Eastern Ghats scenery.", destId: "araku-valley" },
  { name: "Borra Caves", lat: 18.2830, lng: 83.0360, type: "monument", city: "Borra", district: "Alluri Sitharama Raju", description: "150-million-year-old limestone caves with spectacular stalactite and stalagmite formations.", destId: "borra-caves" },
  { name: "Lambasingi", lat: 17.9420, lng: 82.6540, type: "hill", city: "Lambasingi", district: "Visakhapatnam", description: "The 'Kashmir of Andhra Pradesh' known for sub-zero temperatures and misty valleys.", destId: "lambasingi" },
  { name: "Simhachalam Temple", lat: 17.7670, lng: 83.2510, type: "temple", city: "Visakhapatnam", district: "Visakhapatnam", description: "11th-century Varaha Narasimha Swamy temple on Simhachalam hill with rich Chola architecture." },

  // ── East Godavari / Konaseema Region ──
  { name: "Papikondalu", lat: 17.3470, lng: 81.2680, type: "hill", city: "Papikondalu", district: "East Godavari", description: "Majestic hills along the Godavari with breathtaking boat cruises through lush green gorges.", destId: "papikondalu" },
  { name: "Konaseema Backwaters", lat: 16.7330, lng: 81.7580, type: "lake", city: "Amalapuram", district: "Konaseema", description: "Tropical paradise of coconut groves and Godavari delta backwaters.", destId: "konaseema" },
  { name: "Antarvedi Temple", lat: 16.3290, lng: 81.7310, type: "temple", city: "Antarvedi", district: "Konaseema", description: "Sacred temple at the confluence of Godavari and Bay of Bengal with a towering gopuram." },
  { name: "Coringa Wildlife Sanctuary", lat: 16.8000, lng: 82.2600, type: "wildlife", city: "Kakinada", district: "East Godavari", description: "Second largest mangrove forest in India, home to fishing cats and olive ridley turtles." },
  { name: "Draksharamam Temple", lat: 16.7920, lng: 82.0640, type: "temple", city: "Draksharamam", district: "East Godavari", description: "One of the Pancharama Kshetras — ancient Shiva temple with Vijayanagara-era architecture." },

  // ── Kadapa / Anantapur / Kurnool Region ──
  { name: "Gandikota Fort", lat: 15.2480, lng: 78.2870, type: "fort", city: "Gandikota", district: "Kadapa", description: "India's Grand Canyon — dramatic gorge carved by the Pennar River with a medieval fort.", destId: "gandikota" },
  { name: "Lepakshi Temple", lat: 15.5830, lng: 77.6070, type: "temple", city: "Lepakshi", district: "Anantapur", description: "16th-century Vijayanagara temple with the famous hanging pillar and monolithic Nandi.", destId: "lepakshi" },
  { name: "Mantralayam Temple", lat: 15.9810, lng: 77.3750, type: "temple", city: "Mantralayam", district: "Kurnool", description: "Sacred Brindavana of Sri Raghavendra Swami on the banks of the Tungabhadra.", destId: "mantralayam" },
  { name: "Belum Caves", lat: 15.1040, lng: 78.1070, type: "monument", city: "Belum", district: "Kurnool", description: "Second longest cave system in India with stunning stalactite formations and underground streams." },
  { name: "Yaganti Temple", lat: 15.5300, lng: 78.1380, type: "temple", city: "Yaganti", district: "Kurnool", description: "Ancient Shiva temple with a miraculous growing Nandi idol, set amidst Nallamala Hills." },

  // ── Srisailam / Nandyal Region ──
  { name: "Srisailam Temple", lat: 15.8510, lng: 78.8690, type: "temple", city: "Srisailam", district: "Nandyal", description: "One of the twelve Jyotirlinga temples amidst dense Nallamala forests with the mighty Krishna River.", destId: "srisailam" },
  { name: "Ahobilam Temples", lat: 15.1310, lng: 78.7360, type: "temple", city: "Ahobilam", district: "Nandyal", description: "Nine sacred Narasimha temples in the Nallamala Hills requiring adventurous treks.", destId: "ahobilam" },
  { name: "Srisailam Dam", lat: 15.8480, lng: 78.8980, type: "monument", city: "Srisailam", district: "Nandyal", description: "Massive dam on the Krishna River offering stunning views, especially during monsoon water releases." },
  { name: "Nagarjuna Sagar Dam", lat: 16.5760, lng: 79.3120, type: "monument", city: "Nagarjuna Sagar", district: "Palnadu", description: "One of the world's largest masonry dams with Buddhist island museum.", destId: "nagarjuna-sagar" },
  { name: "Ethipothala Falls", lat: 16.5320, lng: 79.2980, type: "waterfall", city: "Ethipothala", district: "Palnadu", description: "70-foot waterfall where three streams merge, with a crocodile breeding center.", destId: "ethipothala" },

  // ── Nellore / Ongole Region ──
  { name: "Penchalakona Waterfalls", lat: 15.3260, lng: 79.4890, type: "waterfall", city: "Penchalakona", district: "Nellore", description: "Scenic waterfall with a Narasimha Swamy temple in the Penchalakona Hills, a popular pilgrimage." },
  { name: "Mypad Beach", lat: 14.3560, lng: 80.1380, type: "beach", city: "Mypad", district: "Nellore", description: "Pristine and secluded beach on the coast of Nellore, perfect for a peaceful getaway." },
  { name: "Nelapattu Bird Sanctuary", lat: 13.7810, lng: 79.9650, type: "wildlife", city: "Nelapattu", district: "Nellore", description: "Important bird sanctuary known for spot-billed pelicans and painted storks." },
];

/** Haversine distance in km between two coordinates */
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
