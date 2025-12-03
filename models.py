# models.py
from datetime import datetime
from flask_login import UserMixin
from sqlalchemy import func

from extensions import db, bcrypt

# ----------------------------
# Association tables
# ----------------------------

event_categories = db.Table(
  "event_categories",
  db.Column("event_id", db.Integer, db.ForeignKey("events.id"), primary_key=True),
  db.Column("category_id", db.Integer, db.ForeignKey("categories.id"), primary_key=True),
)

event_tags = db.Table(
  "event_tags",
  db.Column("event_id", db.Integer, db.ForeignKey("events.id"), primary_key=True),
  db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)

# Optional: store user interest themes
user_theme_categories = db.Table(
  "user_theme_categories",
  db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
  db.Column("category_id", db.Integer, db.ForeignKey("categories.id"), primary_key=True),
)

# ----------------------------
# User
# ----------------------------

class User(db.Model, UserMixin):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(255), unique=True, nullable=False, index=True)
  first_name = db.Column(db.String(80), nullable=True)
  last_name = db.Column(db.String(80), nullable=True)
  password_hash = db.Column(db.String(255), nullable=False)

  # Optional: saved theme interests (checkboxes)
  theme_categories = db.relationship("Category", secondary=user_theme_categories, lazy="joined")

  def set_password(self, password: str) -> None:
    self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

  def check_password(self, password: str) -> bool:
    return bcrypt.check_password_hash(self.password_hash, password)


# ----------------------------
# Categories (themes) + Tags
# ----------------------------

class Category(db.Model):
  __tablename__ = "categories"
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(80), nullable=False, unique=True)
  slug = db.Column(db.String(80), nullable=False, unique=True, index=True)

  def to_dict(self):
    return {"id": self.id, "name": self.name, "slug": self.slug}


class Tag(db.Model):
  __tablename__ = "tags"
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(80), nullable=False, unique=True)
  slug = db.Column(db.String(80), nullable=False, unique=True, index=True)

  def to_dict(self):
    return {"id": self.id, "name": self.name, "slug": self.slug}


# ----------------------------
# Events
# ----------------------------

class Event(db.Model):
  __tablename__ = "events"
  id = db.Column(db.Integer, primary_key=True)

  title = db.Column(db.String(160), nullable=False, index=True)
  description = db.Column(db.Text, nullable=True)
  location = db.Column(db.String(160), nullable=True, index=True)

  # free / paid
  is_free = db.Column(db.Boolean, nullable=False, default=True, index=True)
  price_cents = db.Column(db.Integer, nullable=True)

  # date window
  start_at = db.Column(db.DateTime, nullable=False, index=True)
  end_at = db.Column(db.DateTime, nullable=True, index=True)  # if None => single-day/event moment

  timezone = db.Column(db.String(64), nullable=False, default="Asia/Thimphu")

  created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())
  updated_at = db.Column(db.DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

  categories = db.relationship("Category", secondary=event_categories, lazy="joined")
  tags = db.relationship("Tag", secondary=event_tags, lazy="joined")

  images = db.relationship(
    "EventImage",
    backref="event",
    lazy="joined",
    cascade="all, delete-orphan",
    order_by="EventImage.sort_order.asc()",
  )

  def to_dict(self):
    cover = next((img for img in self.images if img.kind == "cover"), None)
    gallery = [img.to_dict() for img in self.images if img.kind in ("gallery", "past")]

    return {
      "id": self.id,
      "title": self.title,
      "description": self.description or "",
      "location": self.location or "",
      "is_free": self.is_free,
      "price_cents": self.price_cents,
      "start_at": self.start_at.isoformat(),
      "end_at": (self.end_at or self.start_at).isoformat(),
      "timezone": self.timezone,
      "categories": [c.to_dict() for c in self.categories],
      "tags": [t.to_dict() for t in self.tags],
      "cover_image": cover.to_dict() if cover else None,
      "gallery": gallery,
    }


class EventImage(db.Model):
  __tablename__ = "event_images"
  id = db.Column(db.Integer, primary_key=True)
  event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False, index=True)

  url = db.Column(db.Text, nullable=False)
  alt_text = db.Column(db.String(180), nullable=True)

  # "cover" | "gallery" | "past"
  kind = db.Column(db.String(20), nullable=False, default="cover", index=True)

  sort_order = db.Column(db.Integer, nullable=False, default=0)

  def to_dict(self):
    return {
      "id": self.id,
      "url": self.url,
      "alt_text": self.alt_text or "",
      "kind": self.kind,
      "sort_order": self.sort_order,
    }
