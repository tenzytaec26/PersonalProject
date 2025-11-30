from flask import Flask
from views import bp as main_bp

def create_app():
  app = Flask(__name__)
  app.register_blueprint(main_bp)

  # (optional) nice cache busting in dev
  app.config["TEMPLATES_AUTO_RELOAD"] = True

  return app

if __name__ == "__main__":
  app = create_app()
  app.run(debug=True)
