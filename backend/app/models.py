from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


# Many-to-many join table between Listing and Amenity.
# One listing can have many amenities, and one amenity can belong to many listings.
listing_amenity = Table(
    "listing_amenity",
    Base.metadata,
    Column(
        "listing_id",
        Integer,
        ForeignKey("listings.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "amenity_id",
        Integer,
        ForeignKey("amenities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False, default="guest")
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # A host can own multiple listings.
    # Listing.host_id points back to this User.
    listings = relationship(
        "Listing",
        back_populates="host",
        foreign_keys="Listing.host_id",
    )

    # A guest can make multiple bookings.
    # Booking.guest_id points back to this User.
    bookings = relationship(
        "Booking",
        back_populates="guest",
        foreign_keys="Booking.guest_id",
    )

    # A guest can write multiple reviews.
    # Review.guest_id points back to this User.
    reviews = relationship(
        "Review",
        back_populates="guest",
        foreign_keys="Review.guest_id",
    )

    # A user can favorite multiple listings.
    favorites = relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)

    # Each listing belongs to one host.
    # host_id is the foreign key connecting Listing -> User.
    host_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False)
    price_per_night = Column(Float, nullable=False)

    location_city = Column(String(100), nullable=False)
    location_country = Column(String(100), nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    max_guests = Column(Integer, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    beds = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Listing.host gives us the User who owns this listing.
    # User.listings gives us all listings owned by that host.
    host = relationship(
        "User",
        back_populates="listings",
        foreign_keys=[host_id],
    )

    # One listing can have multiple photos.
    # ListingPhoto.listing_id points back to this listing.
    photos = relationship(
        "ListingPhoto",
        back_populates="listing",
        cascade="all, delete-orphan",
        order_by="ListingPhoto.sort_order",
    )

    # Many-to-many relationship between listings and amenities.
    # SQLAlchemy uses listing_amenity as the join table.
    amenities = relationship(
        "Amenity",
        secondary=listing_amenity,
        back_populates="listings",
    )

    # One listing can have many bookings.
    # Booking.listing_id points back to this listing.
    bookings = relationship(
        "Booking",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    # One listing can have many reviews.
    # Review.listing_id points back to this listing.
    reviews = relationship(
        "Review",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    # A listing can be favorited by many users.
    favorites = relationship(
        "Favorite",
        back_populates="listing",
        cascade="all, delete-orphan",
    )


class ListingPhoto(Base):
    __tablename__ = "listing_photos"

    id = Column(Integer, primary_key=True, index=True)

    # Every photo belongs to one listing.
    # listing_id connects ListingPhoto -> Listing.
    listing_id = Column(
        Integer,
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    url = Column(String(500), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    # Allows photo.listing to access its parent listing.
    listing = relationship(
        "Listing",
        back_populates="photos",
    )


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    # An amenity can belong to multiple listings.
    # The listing_amenity table connects both sides.
    listings = relationship(
        "Listing",
        secondary=listing_amenity,
        back_populates="amenities",
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    # The listing being booked.
    # Booking.listing_id -> Listing.id.
    listing_id = Column(
        Integer,
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # The user making the booking.
    # Booking.guest_id -> User.id.
    guest_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    num_guests = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="confirmed",
    )

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Allows booking.listing to access the booked property.
    listing = relationship(
        "Listing",
        back_populates="bookings",
    )

    # Allows booking.guest to access the user who made the booking.
    guest = relationship(
        "User",
        back_populates="bookings",
        foreign_keys=[guest_id],
    )

    # A booking can have one review.
    # Review.booking_id points back to this booking.
    review = relationship(
        "Review",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    # Review belongs to the listing being reviewed.
    listing_id = Column(
        Integer,
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Review is associated with the booking that produced it.
    booking_id = Column(
        Integer,
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    # Review is written by a guest.
    guest_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Allows review.listing to access the reviewed listing.
    listing = relationship(
        "Listing",
        back_populates="reviews",
    )

    # Allows review.booking to access the booking that generated it.
    booking = relationship(
        "Booking",
        back_populates="review",
    )

    # Allows review.guest to access the person who wrote the review.
    guest = relationship(
        "User",
        back_populates="reviews",
        foreign_keys=[guest_id],
    )


class Favorite(Base):
    __tablename__ = "favorites"

    # Composite primary key means the same user cannot favorite
    # the same listing more than once.
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Allows favorite.user to access the user.
    user = relationship(
        "User",
        back_populates="favorites",
    )

    # Allows favorite.listing to access the listing.
    listing = relationship(
        "Listing",
        back_populates="favorites",
    )