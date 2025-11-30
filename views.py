from flask import Blueprint, render_template

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
