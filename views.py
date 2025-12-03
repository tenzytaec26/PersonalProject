# views.py
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, current_user, login_required
from extensions import db, limiter
from models import User, Event, Category
from flask import jsonify
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload

bp = Blueprint("main", __name__)

@bp.get("/")
def home():
  return render_template("layout.html", page="pages/home.html", active="home")

@bp.get("/about")
def about():
  return render_template("layout.html", page="pages/about.html", active="about")

@bp.get("/plan")
def plan():
  return render_template("layout.html", page="pages/plan.html", active="plan")

@bp.get("/things")
def things():
  return render_template("layout.html", page="pages/things.html", active="things")

@bp.get("/calendar")
def calendar():
  return render_template("layout.html", page="pages/calendar.html", active="calendar")

@bp.get("/offers")
def offers():
  return render_template("layout.html", page="pages/offers.html", active="offers")


# DASHBOARD (protected)
@bp.get("/dashboard")
@login_required
def dashboard():
  return render_template("layout.html", page="pages/dashboard.html", active="dashboard")


# ---- auth ----

@bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10/minute")
def login():
  if current_user.is_authenticated:
    return redirect(url_for("main.dashboard"))  # go to dashboard

  if request.method == "POST":
    # print("LOGIN POST RAW:", dict(request.form))
    email = (request.form.get("email") or "").strip().lower()
    password = request.form.get("password") or ""

    user = User.query.filter_by(email=email).first()

    # print("FOUND USER:", bool(user))
    if not user or not user.check_password(password):
      flash("Invalid email or password.", "error")
      return render_template("pages/login.html"), 401

    login_user(user, remember=True)

    # support redirecting back to protected page
    next_url = request.args.get("next")
    return redirect(next_url or url_for("main.dashboard"))

  return render_template("pages/login.html")


@bp.route("/signup", methods=["GET", "POST"])
@limiter.limit("5/minute")
def signup():
  if current_user.is_authenticated:
    return redirect(url_for("main.dashboard"))

  if request.method == "POST":
    # print("SIGNUP POST RAW:", dict(request.form))
    email = (request.form.get("email") or "").strip().lower()
    password = request.form.get("password") or ""
    confirm = request.form.get("confirm_password") or ""
    first = (request.form.get("first_name") or "").strip()
    last = (request.form.get("last_name") or "").strip()

    # print("SIGNUP POST:", request.form)

    if not email or "@" not in email:
      flash("Please enter a valid email.", "error")
      return render_template("pages/signup.html"), 400
    if len(password) < 8:
      flash("Password must be at least 8 characters.", "error")
      return render_template("pages/signup.html"), 400
    if password != confirm:
      flash("Passwords do not match.", "error")
      return render_template("pages/signup.html"), 400
    if User.query.filter_by(email=email).first():
      flash("An account with that email already exists.", "error")
      return render_template("pages/signup.html"), 409

    user = User(email=email, first_name=first, last_name=last)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    flash("Account created! Please log in.", "success")
    return redirect(url_for("main.login"))

  return render_template("pages/signup.html")



@bp.post("/logout")
def logout():
  logout_user()
  return redirect(url_for("main.home"))


# ----------------------------
# Events API (backend for explorer filters)
# ----------------------------

def _parse_iso_date(s: str):
  """
  Accepts:
    - "YYYY-MM-DD"
    - full ISO "YYYY-MM-DDTHH:MM:SS"
  Returns datetime or None.
  """
  try:
    if not s:
      return None
    if len(s) == 10:
      return datetime.fromisoformat(s + "T00:00:00")
    return datetime.fromisoformat(s)
  except Exception:
    return None


def _window_from_preset(preset: str):
  now = datetime.utcnow()

  if preset == "today":
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end

  if preset == "week":
    return now, now + timedelta(days=7)

  if preset == "next30":
    return now, now + timedelta(days=30)

  if preset == "next3m":
    return now, now + timedelta(days=90)

  if preset == "next6m":
    return now, now + timedelta(days=180)

  return None, None


@bp.get("/api/categories")
def api_categories():
  cats = Category.query.order_by(Category.name.asc()).all()
  return jsonify({"categories": [c.to_dict() for c in cats]})


@bp.get("/api/events")
def api_events():
  """
  Query params:
    category=<slug>&category=<slug>
    type=all|free|paid
    date=all|today|week|next30|next3m|next6m
    start=YYYY-MM-DD (optional)
    end=YYYY-MM-DD   (optional)
    q=search text (title/desc/location)
    page=1
    per_page=12 (max 48)
  """
  category_slugs = request.args.getlist("category")
  type_filter = (request.args.get("type") or "all").lower()
  date_preset = (request.args.get("date") or "all").lower()
  q = (request.args.get("q") or "").strip()

  page = max(int(request.args.get("page", 1)), 1)
  per_page = min(max(int(request.args.get("per_page", 12)), 1), 48)

  # Date logic: either explicit start/end OR preset window
  start = None
  end = None

  if request.args.get("start") or request.args.get("end"):
    start = _parse_iso_date(request.args.get("start") or "")
    end = _parse_iso_date(request.args.get("end") or "")
  else:
    start, end = _window_from_preset(date_preset)

  query = (
    Event.query
      .options(joinedload(Event.categories), joinedload(Event.images))
  )

  # Theme/category filter
  if category_slugs:
    query = (
      query.join(Event.categories)
           .filter(Category.slug.in_(category_slugs))
           .distinct()
    )

  # Free/paid filter
  if type_filter == "free":
    query = query.filter(Event.is_free.is_(True))
  elif type_filter == "paid":
    query = query.filter(Event.is_free.is_(False))

  # Time overlap filter:
  # An event overlaps [start, end) if:
  #   (no end_at and start_at in window) OR
  #   (end_at >= start and start_at < end)
  if start and end:
    query = query.filter(
      db.or_(
        db.and_(Event.end_at.is_(None), Event.start_at >= start, Event.start_at < end),
        db.and_(Event.end_at.isnot(None), Event.end_at >= start, Event.start_at < end),
      )
    )
  elif start and not end:
    query = query.filter(Event.start_at >= start)
  elif end and not start:
    query = query.filter(Event.start_at < end)

  # Search
  if q:
    like = f"%{q}%"
    query = query.filter(
      db.or_(
        Event.title.ilike(like),
        Event.description.ilike(like),
        Event.location.ilike(like),
      )
    )

  query = query.order_by(Event.start_at.asc(), Event.id.asc())
  pagination = query.paginate(page=page, per_page=per_page, error_out=False)

  return jsonify({
    "page": page,
    "per_page": per_page,
    "total": pagination.total,
    "pages": pagination.pages,
    "events": [e.to_dict() for e in pagination.items],
  })


@bp.get("/api/events/<int:event_id>")
def api_event_detail(event_id: int):
  e = (
    Event.query.options(joinedload(Event.categories), joinedload(Event.images))
    .filter_by(id=event_id)
    .first_or_404()
  )
  return jsonify({"event": e.to_dict()})


# Optional: persist theme interests for logged-in users
@bp.post("/api/me/themes")
@login_required
def api_save_my_themes():
  data = request.get_json(silent=True) or {}
  slugs = data.get("categories") or []

  cats = Category.query.filter(Category.slug.in_(slugs)).all()
  current_user.theme_categories = cats
  db.session.commit()

  return jsonify({"ok": True, "categories": [c.to_dict() for c in cats]})