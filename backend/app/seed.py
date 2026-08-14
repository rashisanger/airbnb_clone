from datetime import date, timedelta

from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import (
    Amenity,
    Booking,
    Favorite,
    Listing,
    ListingPhoto,
    Review,
    User,
)


# ============================================================
# Property Images
# ============================================================

HOUSE_IMAGES = [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    "https://images.unsplash.com/photo-1600607688960-e095ff83135c",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
    "https://images.unsplash.com/photo-1600047509358-9dc75507daeb",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
]


def seed_database():
    db: Session = SessionLocal()

    try:
        # Check if data already exists
        existing_listings = db.query(Listing).count()
        if existing_listings > 0:
            print(f"✅ Database already has {existing_listings} listings. Skipping seed.")
            return

        # ========================================================
        # 1. Clear existing data
        # ========================================================

        db.query(Review).delete()
        db.query(Favorite).delete()
        db.query(Booking).delete()
        db.query(ListingPhoto).delete()

        db.execute(
            Listing.__table__.metadata.tables[
                "listing_amenity"
            ].delete()
        )

        db.query(Listing).delete()
        db.query(Amenity).delete()
        db.query(User).delete()

        db.commit()

        # ========================================================
        # 2. Create users
        # ========================================================

        users = [
            User(
                name="Emma Wilson",
                email="emma@example.com",
                role="host",
                avatar_url="https://i.pravatar.cc/150?img=1",
            ),
            User(
                name="Liam Carter",
                email="liam@example.com",
                role="host",
                avatar_url="https://i.pravatar.cc/150?img=2",
            ),
            User(
                name="Sophia Miller",
                email="sophia@example.com",
                role="host",
                avatar_url="https://i.pravatar.cc/150?img=3",
            ),
            User(
                name="Noah Anderson",
                email="noah@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=4",
            ),
            User(
                name="Olivia Brown",
                email="olivia@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=5",
            ),
        ]

        db.add_all(users)
        db.flush()

        # ========================================================
        # 3. Create amenities
        # ========================================================

        amenity_names = [
            "Wifi",
            "Kitchen",
            "Free parking",
            "Pool",
            "Air conditioning",
            "Washer",
            "TV",
            "Dedicated workspace",
            "Hot tub",
            "Fireplace",
        ]

        amenities = {
            name: Amenity(name=name)
            for name in amenity_names
        }

        db.add_all(amenities.values())
        db.flush()

        # ========================================================
        # 4. Create listings
        # ========================================================

        listings_data = [

            {
                "host": users[0],
                "title": "Cozy Studio in the Heart of Paris",
                "description": (
                    "A charming studio tucked away in a quiet street, "
                    "just minutes from cafes, galleries, and the Seine. "
                    "Perfect for a relaxing city escape."
                ),
                "property_type": "Apartment",
                "price": 145,
                "city": "Paris",
                "country": "France",
                "lat": 48.8566,
                "lng": 2.3522,
                "guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                ],
            },

            {
                "host": users[0],
                "title": "Modern Loft with Skyline Views",
                "description": (
                    "Wake up to incredible city views in this bright "
                    "and spacious loft. Designed for comfortable stays "
                    "with an open living area and dedicated workspace."
                ),
                "property_type": "Loft",
                "price": 210,
                "city": "New York",
                "country": "United States",
                "lat": 40.7128,
                "lng": -74.0060,
                "guests": 4,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Dedicated workspace",
                ],
            },

            {
                "host": users[0],
                "title": "Sunny Beach House Near the Ocean",
                "description": (
                    "A relaxed coastal retreat with plenty of natural light, "
                    "a private outdoor area, and easy access to the beach."
                ),
                "property_type": "House",
                "price": 285,
                "city": "Miami",
                "country": "United States",
                "lat": 25.7617,
                "lng": -80.1918,
                "guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 2,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Pool",
                    "Air conditioning",
                    "Washer",
                    "TV",
                ],
            },

            {
                "host": users[0],
                "title": "Elegant Flat Steps from the Thames",
                "description": (
                    "Enjoy a stylish stay in this elegant central flat, "
                    "close to London's best restaurants, museums, and parks."
                ),
                "property_type": "Apartment",
                "price": 175,
                "city": "London",
                "country": "United Kingdom",
                "lat": 51.5074,
                "lng": -0.1278,
                "guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Washer",
                    "TV",
                    "Dedicated workspace",
                ],
            },

            {
                "host": users[0],
                "title": "Mountain Cabin with a Private Fireplace",
                "description": (
                    "Slow down and enjoy mountain mornings from this cozy "
                    "cabin surrounded by nature. Curl up by the fireplace "
                    "after a day outdoors."
                ),
                "property_type": "Cabin",
                "price": 195,
                "city": "Aspen",
                "country": "United States",
                "lat": 39.1911,
                "lng": -106.8175,
                "guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Fireplace",
                    "Hot tub",
                    "Free parking",
                    "TV",
                ],
            },

            {
                "host": users[1],
                "title": "Bright Apartment in Central Rome",
                "description": (
                    "A welcoming apartment in the center of Rome, "
                    "perfectly located for exploring historic streets, "
                    "local markets, and iconic landmarks."
                ),
                "property_type": "Apartment",
                "price": 125,
                "city": "Rome",
                "country": "Italy",
                "lat": 41.9028,
                "lng": 12.4964,
                "guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                ],
            },

            {
                "host": users[1],
                "title": "Quiet Garden Villa in Bali",
                "description": (
                    "Escape to a peaceful private villa surrounded by "
                    "lush greenery. Spend your days by the pool and "
                    "evenings enjoying the tropical air."
                ),
                "property_type": "Villa",
                "price": 320,
                "city": "Bali",
                "country": "Indonesia",
                "lat": -8.3405,
                "lng": 115.0920,
                "guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Pool",
                    "Air conditioning",
                    "Washer",
                    "TV",
                ],
            },

            {
                "host": users[1],
                "title": "Minimalist City Apartment",
                "description": (
                    "A clean and comfortable apartment in a lively "
                    "neighborhood, with excellent transport links and "
                    "everything you need for a city stay."
                ),
                "property_type": "Apartment",
                "price": 95,
                "city": "Barcelona",
                "country": "Spain",
                "lat": 41.3874,
                "lng": 2.1686,
                "guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                ],
            },

            {
                "host": users[1],
                "title": "Lakefront Retreat with Mountain Views",
                "description": (
                    "Relax beside the lake in this peaceful retreat "
                    "with wide-open views, cozy interiors, and plenty "
                    "of space for families."
                ),
                "property_type": "House",
                "price": 240,
                "city": "Queenstown",
                "country": "New Zealand",
                "lat": -45.0312,
                "lng": 168.6626,
                "guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Free parking",
                    "Fireplace",
                    "Washer",
                ],
            },

            {
                "host": users[1],
                "title": "Historic Home Near the Old Town",
                "description": (
                    "Stay in a beautifully restored historic home close "
                    "to the old town, with original details and modern comforts."
                ),
                "property_type": "House",
                "price": 155,
                "city": "Lisbon",
                "country": "Portugal",
                "lat": 38.7223,
                "lng": -9.1393,
                "guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Washer",
                    "TV",
                    "Air conditioning",
                ],
            },

            {
                "host": users[2],
                "title": "Luxury Penthouse Above the City",
                "description": (
                    "Make yourself at home in this spacious penthouse "
                    "with panoramic views, stylish interiors, and "
                    "everything you need for a memorable stay."
                ),
                "property_type": "Penthouse",
                "price": 395,
                "city": "Dubai",
                "country": "United Arab Emirates",
                "lat": 25.2048,
                "lng": 55.2708,
                "guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Pool",
                    "Air conditioning",
                    "Hot tub",
                    "TV",
                ],
            },

            {
                "host": users[2],
                "title": "Charming Cottage in the Countryside",
                "description": (
                    "A peaceful countryside cottage surrounded by green "
                    "fields and walking trails. Ideal for a quiet weekend away."
                ),
                "property_type": "Cottage",
                "price": 110,
                "city": "Edinburgh",
                "country": "United Kingdom",
                "lat": 55.9533,
                "lng": -3.1883,
                "guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Fireplace",
                    "Free parking",
                    "TV",
                ],
            },

            {
                "host": users[2],
                "title": "Stylish Loft in the Arts District",
                "description": (
                    "A character-filled loft surrounded by galleries, "
                    "coffee shops, and independent restaurants. "
                    "Bright, creative, and comfortable."
                ),
                "property_type": "Loft",
                "price": 185,
                "city": "Melbourne",
                "country": "Australia",
                "lat": -37.8136,
                "lng": 144.9631,
                "guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Dedicated workspace",
                    "TV",
                    "Washer",
                ],
            },

            {
                "host": users[2],
                "title": "Peaceful Villa with a Private Pool",
                "description": (
                    "Unwind in this beautiful villa with a private pool, "
                    "sunny outdoor spaces, and comfortable rooms for "
                    "a relaxing getaway."
                ),
                "property_type": "Villa",
                "price": 350,
                "city": "Santorini",
                "country": "Greece",
                "lat": 36.3932,
                "lng": 25.4615,
                "guests": 5,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2,
                "amenities": [
                    "Wifi",
                    "Kitchen",
                    "Pool",
                    "Air conditioning",
                    "Hot tub",
                    "TV",
                ],
            },
        ]

        listings = []

        for index, data in enumerate(
            listings_data,
            start=1,
        ):

            listing = Listing(
                host=data["host"],
                title=data["title"],
                description=data["description"],
                property_type=data["property_type"],
                price_per_night=data["price"],
                location_city=data["city"],
                location_country=data["country"],
                latitude=data["lat"],
                longitude=data["lng"],
                max_guests=data["guests"],
                bedrooms=data["bedrooms"],
                beds=data["beds"],
                bathrooms=data["bathrooms"],
            )

            # ----------------------------------------------------
            # Amenities
            # ----------------------------------------------------

            listing.amenities = [
                amenities[name]
                for name in data["amenities"]
            ]

            db.add(listing)
            db.flush()

            # ----------------------------------------------------
            # 4 different property images per listing
            # ----------------------------------------------------

            for photo_number in range(1, 5):

                image_url = HOUSE_IMAGES[
                    (
                        (index - 1) * 4
                        + (photo_number - 1)
                    )
                    % len(HOUSE_IMAGES)
                ]

                photo = ListingPhoto(
                    listing_id=listing.id,
                    url=(
                        f"{image_url}"
                        "?auto=format&fit=crop&w=1200&q=80"
                    ),
                    sort_order=photo_number,
                )

                db.add(photo)

            listings.append(listing)

        db.flush()

        # ========================================================
        # 5. Create bookings
        # ========================================================

        today = date.today()

        booking_data = [

            {
                "listing": listings[0],
                "guest": users[3],
                "check_in": today - timedelta(days=30),
                "check_out": today - timedelta(days=26),
                "guests": 2,
                "status": "completed",
            },

            {
                "listing": listings[1],
                "guest": users[4],
                "check_in": today - timedelta(days=45),
                "check_out": today - timedelta(days=40),
                "guests": 2,
                "status": "completed",
            },

            {
                "listing": listings[2],
                "guest": users[3],
                "check_in": today - timedelta(days=20),
                "check_out": today - timedelta(days=15),
                "guests": 4,
                "status": "completed",
            },

            {
                "listing": listings[3],
                "guest": users[4],
                "check_in": today - timedelta(days=60),
                "check_out": today - timedelta(days=56),
                "guests": 2,
                "status": "completed",
            },

            {
                "listing": listings[4],
                "guest": users[3],
                "check_in": today - timedelta(days=15),
                "check_out": today - timedelta(days=11),
                "guests": 3,
                "status": "completed",
            },

            {
                "listing": listings[5],
                "guest": users[4],
                "check_in": today + timedelta(days=10),
                "check_out": today + timedelta(days=14),
                "guests": 2,
                "status": "confirmed",
            },

            {
                "listing": listings[6],
                "guest": users[3],
                "check_in": today + timedelta(days=20),
                "check_out": today + timedelta(days=26),
                "guests": 5,
                "status": "confirmed",
            },

            {
                "listing": listings[7],
                "guest": users[4],
                "check_in": today + timedelta(days=7),
                "check_out": today + timedelta(days=11),
                "guests": 2,
                "status": "confirmed",
            },

            {
                "listing": listings[8],
                "guest": users[3],
                "check_in": today + timedelta(days=30),
                "check_out": today + timedelta(days=35),
                "guests": 4,
                "status": "confirmed",
            },

            {
                "listing": listings[9],
                "guest": users[4],
                "check_in": today + timedelta(days=15),
                "check_out": today + timedelta(days=19),
                "guests": 3,
                "status": "confirmed",
            },
        ]

        bookings = []

        for data in booking_data:

            nights = (
                data["check_out"]
                - data["check_in"]
            ).days

            total_price = (
                nights
                * data["listing"].price_per_night
            )

            booking = Booking(
                listing_id=data["listing"].id,
                guest_id=data["guest"].id,
                check_in=data["check_in"],
                check_out=data["check_out"],
                num_guests=data["guests"],
                total_price=total_price,
                status=data["status"],
            )

            db.add(booking)
            bookings.append(booking)

        db.flush()

        # ========================================================
        # 6. Create reviews
        # ========================================================

        review_data = [

            {
                "booking": bookings[0],
                "listing": listings[0],
                "guest": users[3],
                "rating": 5,
                "comment": "Beautiful place and a perfect location.",
            },

            {
                "booking": bookings[1],
                "listing": listings[1],
                "guest": users[4],
                "rating": 4,
                "comment": "Great views and very comfortable stay.",
            },

            {
                "booking": bookings[2],
                "listing": listings[2],
                "guest": users[3],
                "rating": 5,
                "comment": "The house was spacious and exactly as pictured.",
            },

            {
                "booking": bookings[3],
                "listing": listings[3],
                "guest": users[4],
                "rating": 4,
                "comment": "Lovely apartment in a convenient neighborhood.",
            },

            {
                "booking": bookings[4],
                "listing": listings[4],
                "guest": users[3],
                "rating": 5,
                "comment": "A peaceful getaway with an amazing fireplace.",
            },
        ]

        for data in review_data:

            review = Review(
                listing_id=data["listing"].id,
                booking_id=data["booking"].id,
                guest_id=data["guest"].id,
                rating=data["rating"],
                comment=data["comment"],
            )

            db.add(review)

        # ========================================================
        # 7. Favorites
        # ========================================================

        favorites = [
            Favorite(
                user_id=users[3].id,
                listing_id=listings[0].id,
            ),
            Favorite(
                user_id=users[3].id,
                listing_id=listings[6].id,
            ),
            Favorite(
                user_id=users[4].id,
                listing_id=listings[2].id,
            ),
            Favorite(
                user_id=users[4].id,
                listing_id=listings[11].id,
            ),
        ]

        db.add_all(favorites)

        # ========================================================
        # 8. Commit
        # ========================================================

        db.commit()

        print("Database seeded successfully!")
        print("Created:")
        print("- 5 users")
        print("- 15 listings")
        print("- 10 amenities")
        print("- 60 listing photos")
        print("- 10 bookings")
        print("- 5 reviews")
        print("- 4 favorites")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()