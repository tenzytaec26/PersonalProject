import os
from flask import Flask
from extensions import db, login_manager, csrf, bcrypt, limiter, migrate

def create_app():
  app = Flask(__name__)

  app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-me")
  app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
  # if database_url.startswith("postgres://"):
  #   database_url = database_url.replace("postgres://", "postgresql://", 1)
  app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

  is_prod = os.environ.get("ENV", "development") == "production"
  app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=is_prod,
    REMEMBER_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_SAMESITE="Lax",
    REMEMBER_COOKIE_SECURE=is_prod,
  )

  db.init_app(app)
  migrate.init_app(app, db) 

  login_manager.init_app(app)
  csrf.init_app(app)
  bcrypt.init_app(app)
  limiter.init_app(app)

  login_manager.login_view = "main.login"

  from models import User

  @login_manager.user_loader
  def load_user(user_id: str):
    return User.query.get(int(user_id))

  from views import bp as main_bp
  app.register_blueprint(main_bp)

  return app

if __name__ == "__main__":
  create_app().run(debug=True)
