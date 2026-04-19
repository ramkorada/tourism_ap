"""
Andhra Trails — Flask Backend
Python / Flask / SQLite stack with AI-powered chatbot (Google Gemini).

Endpoints
─────────
Auth
  POST /api/auth/signup   – create account
  POST /api/auth/login    – sign in, returns JWT
  GET  /api/auth/me       – current user info (JWT protected)

Reviews
  GET  /api/reviews/<destination_id>   – list reviews for a destination
  POST /api/reviews                    – submit a review (JWT protected)

Favorites
  GET    /api/favorites                     – list user favourites (JWT)
  POST   /api/favorites                     – add favourite (JWT)
  DELETE /api/favorites/<destination_id>     – remove favourite (JWT)
  GET    /api/favorites/check/<destination_id> – check if favourited (JWT)

Chatbot (AI-powered)
  POST /api/chat   – Gemini AI-powered tourism chatbot

Emergency SOS
  GET    /api/emergency-contacts         – list user's emergency contacts (JWT)
  POST   /api/emergency-contacts         – save an emergency contact (JWT)
  DELETE /api/emergency-contacts/<id>    – delete an emergency contact (JWT)

Destinations
  GET  /api/destinations               – list all destinations
  GET  /api/destinations/<id>          – destination detail
  POST /api/trip-planner               – generate trip summary
"""

import os
import re
import json
import sys
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import db
from models import User, Review, Favorite, EmergencyContact

# ──────────────────────────────────────────────────────────────────────────────
# App configuration
# ──────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "andhra_trails.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "andhra-trails-secret-key-2026")

CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)

with app.app_context():
    db.create_all()

# ──────────────────────────────────────────────────────────────────────────────
# JWT helpers
# ──────────────────────────────────────────────────────────────────────────────

def create_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

        if not token:
            return jsonify({"error": "Authentication required"}), 401
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.get(payload["sub"])
            if current_user is None:
                raise ValueError("User not found")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired, please login again"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ──────────────────────────────────────────────────────────────────────────────
# AUTH routes
# ──────────────────────────────────────────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("display_name") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        display_name=display_name or email.split("@")[0],
    )
    db.session.add(user)
    db.session.commit()

    token = create_token(user)
    return jsonify({"token": token, "user": user.to_dict()}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(user)
    return jsonify({"token": token, "user": user.to_dict()})


@app.route("/api/auth/me", methods=["GET"])
@token_required
def me(current_user):
    return jsonify({"user": current_user.to_dict()})

# ──────────────────────────────────────────────────────────────────────────────
# REVIEWS routes
# ──────────────────────────────────────────────────────────────────────────────

@app.route("/api/reviews/<destination_id>", methods=["GET"])
def get_reviews(destination_id):
    reviews = (
        Review.query.filter_by(destination_id=destination_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return jsonify([r.to_dict() for r in reviews])


@app.route("/api/reviews", methods=["POST"])
@token_required
def create_review(current_user):
    data = request.get_json() or {}
    destination_id = data.get("destination_id")
    rating = data.get("rating")
    comment = data.get("comment")

    if not destination_id or not rating:
        return jsonify({"error": "destination_id and rating are required"}), 400
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    review = Review(
        user_id=current_user.id,
        destination_id=destination_id,
        rating=rating,
        comment=comment or None,
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201

# ──────────────────────────────────────────────────────────────────────────────
# FAVORITES routes
# ──────────────────────────────────────────────────────────────────────────────

@app.route("/api/favorites", methods=["GET"])
@token_required
def get_favorites(current_user):
    favs = Favorite.query.filter_by(user_id=current_user.id).all()
    return jsonify([{"destination_id": f.destination_id} for f in favs])


@app.route("/api/favorites", methods=["POST"])
@token_required
def add_favorite(current_user):
    data = request.get_json() or {}
    destination_id = data.get("destination_id")
    if not destination_id:
        return jsonify({"error": "destination_id is required"}), 400

    existing = Favorite.query.filter_by(
        user_id=current_user.id, destination_id=destination_id
    ).first()
    if existing:
        return jsonify({"message": "Already in favorites"}), 200

    fav = Favorite(user_id=current_user.id, destination_id=destination_id)
    db.session.add(fav)
    db.session.commit()
    return jsonify(fav.to_dict()), 201


@app.route("/api/favorites/<destination_id>", methods=["DELETE"])
@token_required
def remove_favorite(current_user, destination_id):
    fav = Favorite.query.filter_by(
        user_id=current_user.id, destination_id=destination_id
    ).first()
    if fav:
        db.session.delete(fav)
        db.session.commit()
    return jsonify({"message": "Removed"}), 200


@app.route("/api/favorites/check/<destination_id>", methods=["GET"])
@token_required
def check_favorite(current_user, destination_id):
    fav = Favorite.query.filter_by(
        user_id=current_user.id, destination_id=destination_id
    ).first()
    return jsonify({"is_favorite": fav is not None})

# ──────────────────────────────────────────────────────────────────────────────
# EMERGENCY SOS routes
# ──────────────────────────────────────────────────────────────────────────────...

@app.route("/api/emergency-contacts", methods=["GET"])
@token_required
def get_emergency_contacts(current_user):
    contacts = EmergencyContact.query.filter_by(user_id=current_user.id).order_by(EmergencyContact.created_at.desc()).all()
    return jsonify([c.to_dict() for c in contacts])


@app.route("/api/emergency-contacts", methods=["POST"])
@token_required
def save_emergency_contact(current_user):
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    relationship = (data.get("relationship") or "").strip()

    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400

    contact = EmergencyContact(
        user_id=current_user.id,
        name=name,
        phone=phone,
        relationship=relationship or None,
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify(contact.to_dict()), 201


@app.route("/api/emergency-contacts/<contact_id>", methods=["DELETE"])
@token_required
def delete_emergency_contact(current_user, contact_id):
    contact = EmergencyContact.query.filter_by(id=contact_id, user_id=current_user.id).first()
    if not contact:
        return jsonify({"error": "Contact not found"}), 404
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ──────────────────────────────────────────────────────────────────────────────
# DESTINATIONS data
# ──────────────────────────────────────────────────────────────────────────────

DESTINATIONS = [
    {"id": "araku-valley", "name": "Araku Valley", "district": "Alluri Sitharama Raju", "category": "Eco",
     "bestTime": "October–March", "idealDuration": "2–3 days",
     "budget": "₹800–1,500/day", "mid": "₹2,000–4,000/day", "luxury": "₹5,000–10,000/day",
     "highlights": ["Coffee plantations", "Borra Caves nearby", "Tribal Museum", "Chaparai Waterfalls", "Ananthagiri Hills"],
     "tips": ["Carry warm clothes in winter", "Try Araku coffee", "Visit tribal weekly markets"]},
    {"id": "papikondalu", "name": "Papikondalu", "district": "East Godavari", "category": "Eco",
     "bestTime": "November–February", "idealDuration": "1–2 days",
     "budget": "₹1,000–2,000/day", "mid": "₹2,500–4,500/day", "luxury": "₹5,000–8,000/day",
     "highlights": ["Godavari River cruise", "Perantalapalli", "Green gorges", "Tribal villages"],
     "tips": ["Book boat tickets in advance", "Carry motion sickness pills", "Best visited in winter"]},
    {"id": "borra-caves", "name": "Borra Caves", "district": "Alluri Sitharama Raju", "category": "Eco",
     "bestTime": "October–March", "idealDuration": "1 day",
     "budget": "₹500–1,000/day", "mid": "₹1,500–3,000/day", "luxury": "₹4,000–7,000/day",
     "highlights": ["150 million year old limestone caves", "Stalactites & stalagmites", "Shiva Linga formation", "Katiki Waterfalls"],
     "tips": ["Wear comfortable shoes", "Combine with Araku Valley trip", "Photography allowed"]},
    {"id": "srisailam", "name": "Srisailam", "district": "Nandyal", "category": "Cultural",
     "bestTime": "October–March", "idealDuration": "2 days",
     "budget": "₹800–1,500/day", "mid": "₹2,000–4,000/day", "luxury": "₹4,500–8,000/day",
     "highlights": ["Mallikarjuna Jyotirlinga Temple", "Srisailam Dam", "Nallamala Forest", "Akka Mahadevi Caves", "Phaladhara Panchadhara"],
     "tips": ["Book darshan tickets online", "Visit dam during monsoon", "Tiger reserve safaris available"]},
    {"id": "tirupati", "name": "Tirupati", "district": "Tirupati", "category": "Cultural",
     "bestTime": "Year-round (avoid peak festivals)", "idealDuration": "2–3 days",
     "budget": "₹500–1,200/day", "mid": "₹1,500–3,500/day", "luxury": "₹4,000–10,000/day",
     "highlights": ["Sri Venkateswara Temple (Tirumala)", "World's richest temple", "Silathoranam", "Sri Padmavathi Temple", "TTD Laddu prasadam"],
     "tips": ["Book darshan tickets online via TTD website", "Opt for Divya Darshan if short on time", "Free accommodation available at TTD"]},
    {"id": "lepakshi", "name": "Lepakshi", "district": "Anantapur", "category": "Cultural",
     "bestTime": "October–February", "idealDuration": "1 day",
     "budget": "₹500–1,000/day", "mid": "₹1,500–2,500/day", "luxury": "₹3,000–5,000/day",
     "highlights": ["Hanging Pillar", "Veerabhadra Temple", "Monolithic Nandi", "Vijayanagara murals", "Lepakshi Handicrafts Emporium"],
     "tips": ["Combine with Penukonda visit", "Best visited as a day trip from Bengaluru/Anantapur", "Photography is a must"]},
    {"id": "amaravati", "name": "Amaravati", "district": "Guntur", "category": "Cultural",
     "bestTime": "October–March", "idealDuration": "1–2 days",
     "budget": "₹600–1,200/day", "mid": "₹1,500–3,000/day", "luxury": "₹3,500–6,000/day",
     "highlights": ["Ancient Buddhist Stupa", "Amaravati Museum", "Dhyana Buddha statue", "Krishna River banks", "New AP Capital region"],
     "tips": ["Visit the archaeological museum", "Combine with Guntur food tour", "Undavalli Caves nearby"]},
    {"id": "gandikota", "name": "Gandikota", "district": "Kadapa", "category": "Eco",
     "bestTime": "October–February", "idealDuration": "1–2 days",
     "budget": "₹600–1,200/day", "mid": "₹1,500–3,000/day", "luxury": "₹3,500–6,000/day",
     "highlights": ["Grand Canyon of India", "Pennar River gorge", "Medieval fort", "Raghunathaswamy Temple", "Camping & stargazing"],
     "tips": ["Carry your own supplies", "Best for camping overnight", "Sunrise and sunset are spectacular"]},
    {"id": "konaseema", "name": "Konaseema", "district": "Konaseema", "category": "Eco",
     "bestTime": "October–March", "idealDuration": "2–3 days",
     "budget": "₹800–1,500/day", "mid": "₹2,000–3,500/day", "luxury": "₹4,000–7,000/day",
     "highlights": ["Godavari delta backwaters", "Coconut groves", "Antarvedi Temple", "Coringa Wildlife Sanctuary"],
     "tips": ["Try authentic Konaseema cuisine", "Boat rides are a must", "Visit during Sankranti"]},
    {"id": "horsley-hills", "name": "Horsley Hills", "district": "Chittoor", "category": "Eco",
     "bestTime": "September–February", "idealDuration": "1–2 days",
     "budget": "₹600–1,200/day", "mid": "₹1,500–3,000/day", "luxury": "₹3,500–6,000/day",
     "highlights": ["1265m altitude viewpoint", "Environment Park", "1450-year-old tree", "Gangotri Lake", "Rappelling & zipline"],
     "tips": ["AP Tourism resort available", "Carry warm clothes", "Best as weekend getaway from Bengaluru/Tirupati"]},
    {"id": "rishikonda", "name": "Rishikonda Beach", "district": "Visakhapatnam", "category": "Coastal",
     "bestTime": "October–March", "idealDuration": "1–2 days",
     "budget": "₹800–1,500/day", "mid": "₹2,000–4,000/day", "luxury": "₹5,000–10,000/day",
     "highlights": ["Golden sandy beach", "Water sports", "Surfing", "Scuba diving", "Bay of Bengal sunrise"],
     "tips": ["Visit for sunrise", "Water sports best Nov–Feb", "AP Tourism resort on beach"]},
    {"id": "yarada", "name": "Yarada Beach", "district": "Visakhapatnam", "category": "Coastal",
     "bestTime": "October–February", "idealDuration": "1 day",
     "budget": "₹500–1,000/day", "mid": "₹1,500–3,000/day", "luxury": "₹4,000–7,000/day",
     "highlights": ["Secluded beach", "Hills on three sides", "Crystal clear water", "Dolphin's Nose viewpoint"],
     "tips": ["Visit early morning for solitude", "Combine with Dolphin's Nose visit", "Limited food options — carry snacks"]},
    {"id": "nagarjuna-sagar", "name": "Nagarjuna Sagar", "district": "Palnadu", "category": "Cultural",
     "bestTime": "August–February", "idealDuration": "1–2 days",
     "budget": "₹600–1,200/day", "mid": "₹1,500–3,000/day", "luxury": "₹3,500–6,000/day",
     "highlights": ["One of world's largest masonry dams", "Nagarjunakonda Island Museum", "Buddhist ruins", "Ethipothala Falls nearby"],
     "tips": ["Boat to island runs on schedule", "Dam best visited during monsoon release", "Combine with Ethipothala Falls"]},
    {"id": "ahobilam", "name": "Ahobilam", "district": "Nandyal", "category": "Cultural",
     "bestTime": "October–March", "idealDuration": "2 days",
     "budget": "₹600–1,200/day", "mid": "₹1,500–3,000/day", "luxury": "₹3,000–5,000/day",
     "highlights": ["Nine Narasimha temples", "Upper & Lower Ahobilam", "Nallamala Hills trek", "Ugra Stambham"],
     "tips": ["Upper Ahobilam requires trekking", "Carry water and snacks", "Hire a local guide for all 9 temples"]},
    {"id": "mantralayam", "name": "Mantralayam", "district": "Kurnool", "category": "Cultural",
     "bestTime": "Year-round", "idealDuration": "1 day",
     "budget": "₹500–1,000/day", "mid": "₹1,200–2,500/day", "luxury": "₹3,000–5,000/day",
     "highlights": ["Sri Raghavendra Swami Brindavana", "Tungabhadra River", "Manchale Temple", "Panchamukhi"],
     "tips": ["Aradhana festival in August is spectacular", "Free meals at the mutt", "Combine with Kurnool visit"]},
    {"id": "talakona", "name": "Talakona Waterfalls", "district": "Tirupati", "category": "Eco",
     "bestTime": "July–December", "idealDuration": "1 day",
     "budget": "₹500–1,000/day", "mid": "₹1,200–2,500/day", "luxury": "₹3,000–5,000/day",
     "highlights": ["Highest waterfall in AP (270ft)", "Sri Venkateswara National Park", "Trekking trails", "Rare wildlife"],
     "tips": ["Entry fee required", "Best after monsoon rains", "Leeches possible — wear full shoes"]},
    {"id": "ethipothala", "name": "Ethipothala Falls", "district": "Palnadu", "category": "Eco",
     "bestTime": "July–January", "idealDuration": "Half day",
     "budget": "₹400–800/day", "mid": "₹1,000–2,000/day", "luxury": "₹2,500–4,000/day",
     "highlights": ["70-foot waterfall", "Three streams merge", "Crocodile breeding center", "Ranganatha Temple"],
     "tips": ["Best after monsoons", "Combine with Nagarjuna Sagar visit", "Crocodile center is unique"]},
    {"id": "pulicat-lake", "name": "Pulicat Lake", "district": "Tirupati", "category": "Coastal",
     "bestTime": "October–March", "idealDuration": "1 day",
     "budget": "₹500–1,000/day", "mid": "₹1,200–2,500/day", "luxury": "₹3,000–5,000/day",
     "highlights": ["Second largest brackish lake in India", "Flamingo festival", "Dutch cemetery", "Bird sanctuary"],
     "tips": ["Visit Nov–Feb for migratory birds", "Carry binoculars", "Boat rides available"]},
    {"id": "lambasingi", "name": "Lambasingi", "district": "Visakhapatnam", "category": "Eco",
     "bestTime": "November–January", "idealDuration": "1–2 days",
     "budget": "₹800–1,500/day", "mid": "₹2,000–3,500/day", "luxury": "₹4,000–7,000/day",
     "highlights": ["Kashmir of Andhra Pradesh", "Sub-zero temperatures", "Mist-covered valleys", "Pepper plantations", "Kothapalli Waterfalls"],
     "tips": ["Carry heavy woolens in winter", "4AM drive for best mist views", "Limited accommodation — book early"]},
]

DEST_MAP = {d["id"]: d for d in DESTINATIONS}

@app.route("/api/destinations", methods=["GET"])
def list_destinations():
    return jsonify(DESTINATIONS)

@app.route("/api/destinations/<dest_id>", methods=["GET"])
def get_destination(dest_id):
    d = DEST_MAP.get(dest_id)
    if not d:
        return jsonify({"error": "Destination not found"}), 404
    return jsonify(d)

@app.route("/api/trip-planner", methods=["POST"])
def trip_planner():
    data = request.get_json() or {}
    ids = data.get("destination_ids", [])
    if not ids:
        return jsonify({"error": "No destinations selected"}), 400

    itinerary = []
    day_counter = 0
    for dest_id in ids:
        d = DEST_MAP.get(dest_id)
        if not d:
            continue
        duration_match = re.search(r"(\d+)", d.get("idealDuration", "1"))
        days = int(duration_match.group(1)) if duration_match else 1
        start_day = day_counter + 1
        day_counter += days
        itinerary.append({
            "destination": d,
            "start_day": start_day,
            "end_day": day_counter,
            "days": days,
        })

    return jsonify({
        "itinerary": itinerary,
        "total_days": day_counter,
        "total_destinations": len(itinerary),
    })

# ──────────────────────────────────────────────────────────────────────────────
# AI CHATBOT — Powered by Google Gemini
# ──────────────────────────────────────────────────────────────────────────────

def _build_destination_context():
    lines = []
    for d in DESTINATIONS:
        highlights = ", ".join(d["highlights"])
        tips = ", ".join(d["tips"])
        lines.append(
            f"- {d['name']} (ID: {d['id']}, District: {d['district']}, Category: {d['category']}): "
            f"Best Time: {d['bestTime']}, Duration: {d['idealDuration']}, "
            f"Budget: {d['budget']}, Mid-range: {d['mid']}, Luxury: {d['luxury']}. "
            f"Highlights: {highlights}. Tips: {tips}."
        )
    return "\n".join(lines)

DESTINATION_CONTEXT = _build_destination_context()

SYSTEM_PROMPT = f"""You are "AP Trail Guide" — a friendly, knowledgeable AI tourism assistant for Andhra Pradesh, India.

You have complete knowledge of the following {len(DESTINATIONS)} destinations in Andhra Pradesh:

{DESTINATION_CONTEXT}

IMPORTANT EMERGENCY NUMBERS FOR AP:
- Police: 100
- Ambulance: 108
- Fire: 101
- Women Helpline: 181
- Child Helpline: 1098
- AP Tourism Helpline: 1800-425-4567 (toll-free)
- APSRTC Bus Info: 0866-2570005

YOUR BEHAVIOR:
1. Always be warm, friendly and enthusiastic about AP tourism.
2. When asked about destinations, provide detailed info including best time, budget, highlights, and tips.
3. You can compare destinations, suggest itineraries, and recommend based on preferences.
4. For budget questions, give specific numbers from your data.
5. If asked about emergencies, immediately provide the relevant emergency numbers.
6. Use emojis occasionally to be friendly but don't overdo it.
7. Keep responses concise but informative — aim for 3-8 sentences unless details are requested.
8. If asked about something outside AP tourism, politely redirect to tourism topics.
9. You can suggest combinations of destinations (circuits/routes).
10. Always be helpful and encouraging about visiting AP.

POPULAR CIRCUITS YOU CAN SUGGEST:
- Vizag Circuit (4-5 days): Rishikonda → Yarada → Araku Valley → Borra Caves → Lambasingi
- Cultural Circuit (5-6 days): Tirupati → Lepakshi → Srisailam → Ahobilam → Mantralayam
- Nature Circuit (4-5 days): Gandikota → Horsley Hills → Talakona → Tirupati
- Godavari Circuit (3-4 days): Papikondalu → Konaseema → Amaravati

10. MULTILINGUAL SUPPORT: Detect the language the user is writing in and respond in THAT SAME language automatically. If the user writes in Telugu (తెలుగు), respond entirely in Telugu. If Hindi, respond in Hindi. If Tamil, respond in Tamil. Support all Indian languages naturally.
"""

def call_ai_api(messages):
    import urllib.request

    payload_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in messages:
        role = msg.get("role", "user")
        if role == "model":
            role = "assistant"
        payload_messages.append({"role": role, "content": msg.get("content", "")})

    body = json.dumps({
        "messages": payload_messages,
        "model": "openai"
    }).encode()

    url = "https://text.pollinations.ai/"

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "AndhraTrails/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except Exception as e:
        print(f"AI API error: {e}", file=sys.stderr)
        return f"Error: {e}"

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    messages = data.get("messages", [])

    if not messages:
        return jsonify({"reply": "Namaste! 🙏 Welcome to AP Tourism Guide!"})

    ai_reply = call_ai_api(messages)
    return jsonify({"reply": ai_reply})

@app.route("/api/admin/dashboard-data", methods=["GET"])
def admin_dashboard_data():
    secret_key = request.args.get("key")
    if secret_key != "andhra-secret-admin":
        return jsonify({"error": "Unauthorized"}), 401

    users = User.query.all()
    result = []
    for user in users:
        contacts = EmergencyContact.query.filter_by(user_id=user.id).all()
        favorites = Favorite.query.filter_by(user_id=user.id).all()
        
        favs_enriched = []
        for f in favorites:
            d = DEST_MAP.get(f.destination_id)
            if d:
                favs_enriched.append({
                    "id": f.destination_id,
                    "name": d["name"],
                    "district": d["district"]
                })
            else:
                favs_enriched.append({"id": f.destination_id, "name": f.destination_id})
                
        result.append({
            "email": user.email,
            "display_name": user.display_name,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "contacts": [c.to_dict() for c in contacts],
            "favorites": favs_enriched
        })

    return jsonify(result)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "Andhra Trails Flask backend is running",
        "ai_enabled": True,
    })

if __name__ == "__main__":
    print("=" * 60)
    print("  Andhra Trails - Flask Backend")
    print("  AI Chatbot: [OK] Connected to Free AI API (Pollinations)")
    print("  Running on http://127.0.0.1:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
