from flask_login import UserMixin
from app import db, bcrypt

class User(db.Model, UserMixin):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(320), unique=True, nullable=False, index=True)
  password_hash = db.Column(db.String(255), nullable=False)

  first_name = db.Column(db.String(80), nullable=True)
  last_name = db.Column(db.String(80), nullable=True)

  def set_password(self, password: str) -> None:
    self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

  def check_password(self, password: str) -> bool:
    return bcrypt.check_password_hash(self.password_hash, password)
