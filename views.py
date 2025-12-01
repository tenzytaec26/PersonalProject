from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, current_user
from extensions import db, limiter
from models import User


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

# ---- auth ----

@bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10/minute")
def login():
  if current_user.is_authenticated:
    return redirect(url_for("main.home"))

  if request.method == "POST":
    email = (request.form.get("email") or "").strip().lower()
    password = request.form.get("password") or ""

    user = User.query.filter_by(email=email).first()

    # Avoid account enumeration: same message for "no user" vs "bad password"
    if not user or not user.check_password(password):
      flash("Invalid email or password.", "error")
      return render_template("pages/login.html"), 401

    login_user(user, remember=True)
    return redirect(url_for("main.home"))

  return render_template("pages/login.html")


@bp.route("/signup", methods=["GET", "POST"])
@limiter.limit("5/minute")
def signup():
  if current_user.is_authenticated:
    return redirect(url_for("main.home"))

  if request.method == "POST":
    email = (request.form.get("email") or "").strip().lower()
    password = request.form.get("password") or ""
    confirm = request.form.get("confirm_password") or ""
    first = (request.form.get("first_name") or "").strip()
    last = (request.form.get("last_name") or "").strip()

    # basic validation
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