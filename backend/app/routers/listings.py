from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import (
    Amenity,
    Booking,
    Listing,
    ListingPhoto,
    Review,
)
from ..schemas import (
    AmenityOut,
    HostSummary,
    ListingCreate,
    ListingOut,
    ListingSummary,
    ListingUpdate,
    PhotoOut,
    ReviewOut,
)

router = APIRouter(
    prefix="/listings",
    tags=["Listings"],
)


# ============================================================
# Helper functions
# ============================================================

def get_average_rating(db: Session, listing_id: int) -> float:
    """
    Calculate the average rating for a listing.
    Returns 0 when the listing has no reviews.
    """

    average = (
        db.query(func.avg(Review.rating))
        .filter(Review.listing_id == listing_id)
        .scalar()
    )

    return round(float(average), 1) if average is not None else 0


def get_review_count(db: Session, listing_id: int) -> int:
    return (
        db.query(func.count(Review.id))
        .filter(Review.listing_id == listing_id)
        .scalar()
        or 0
    )


def listing_to_summary(
    db: Session,
    listing: Listing,
) -> ListingSummary:
    """
    Convert a Listing ORM object into the lightweight
    response used by listing cards.
    """

    IMAGE_BY_LISTING = {
    3: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    4: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    5: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
    6: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    7: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
    8: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    9: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    10: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    11: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    12: "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
    13: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",
    14: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    }

    cover_photo = IMAGE_BY_LISTING.get(
        listing.id,
        listing.photos[0].url if listing.photos else None
    )

    return ListingSummary(
        id=listing.id,
        title=listing.title,
        property_type=listing.property_type,
        price_per_night=listing.price_per_night,
        location_city=listing.location_city,
        location_country=listing.location_country,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        cover_photo=cover_photo,
        average_rating=get_average_rating(db, listing.id),
        review_count=get_review_count(db, listing.id),
    )


# ============================================================
# GET /listings
# ============================================================

@router.get("")
def get_listings(
    location: str | None = Query(default=None),
    check_in: date | None = Query(default=None),
    check_out: date | None = Query(default=None),
    guests: int | None = Query(default=None, gt=0),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    property_type: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search and filter listings with pagination.
    """

    query = db.query(Listing).options(
        joinedload(Listing.photos),
        joinedload(Listing.amenities),
        joinedload(Listing.host),
    )

    # ---------------------------------------------------------
    # Location filter
    # ---------------------------------------------------------
    if location:
        search = f"%{location}%"

        query = query.filter(
            or_(
                Listing.location_city.ilike(search),
                Listing.location_country.ilike(search),
            )
        )

    # ---------------------------------------------------------
    # Guest capacity
    # ---------------------------------------------------------
    if guests is not None:
        query = query.filter(
            Listing.max_guests >= guests
        )

    # ---------------------------------------------------------
    # Price filters
    # ---------------------------------------------------------
    if min_price is not None:
        query = query.filter(
            Listing.price_per_night >= min_price
        )

    if max_price is not None:
        query = query.filter(
            Listing.price_per_night <= max_price
        )

    # ---------------------------------------------------------
    # Property type
    # ---------------------------------------------------------
    if property_type:
        query = query.filter(
            Listing.property_type.ilike(property_type)
        )

    # ---------------------------------------------------------
    # Date availability
    # ---------------------------------------------------------
    if check_in and check_out:

        if check_out <= check_in:
            raise HTTPException(
                status_code=400,
                detail="check_out must be after check_in",
            )

        # Two date ranges overlap when:
        #
        # existing.check_in < requested.check_out
        # AND
        # existing.check_out > requested.check_in
        #
        # Therefore, a listing is available only when there is
        # NO confirmed booking satisfying those conditions.
        #
        # Example:
        #
        # Existing:  Aug 10 -> Aug 15
        # Requested: Aug 12 -> Aug 18
        #
        # 10 < 18  ✓
        # 15 > 12  ✓
        #
        # Both are true, so the ranges overlap and the listing
        # must be excluded.
        #
        # We use NOT EXISTS so listings with no conflicting
        # confirmed bookings remain available.

        conflicting_booking = (
            db.query(Booking.id)
            .filter(
                Booking.listing_id == Listing.id,
                Booking.status == "confirmed",
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .exists()
        )

        query = query.filter(
            ~conflicting_booking
        )

    # ---------------------------------------------------------
    # Count before pagination
    # ---------------------------------------------------------
    total = query.count()

    # ---------------------------------------------------------
    # Pagination
    # ---------------------------------------------------------
    offset = (page - 1) * page_size

    listings = (
        query
        .order_by(Listing.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    results = [
        listing_to_summary(db, listing)
        for listing in listings
    ]

    return {
        "items": results,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
        ),
    }


# ============================================================
# GET /listings/{id}
# ============================================================

@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.photos),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
            joinedload(Listing.reviews)
            .joinedload(Review.guest),
        )
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    average_rating = get_average_rating(
        db,
        listing.id,
    )

    review_count = get_review_count(
        db,
        listing.id,
    )

    return ListingOut(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        price_per_night=listing.price_per_night,
        location_city=listing.location_city,
        location_country=listing.location_country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        photos=[
            PhotoOut.model_validate(photo)
            for photo in listing.photos
        ],
        amenities=[
            AmenityOut.model_validate(amenity)
            for amenity in listing.amenities
        ],
        host=HostSummary.model_validate(
            listing.host
        ),
        average_rating=average_rating,
        review_count=review_count,
        reviews=[
            ReviewOut.model_validate(review)
            for review in listing.reviews
        ],
    )


# ============================================================
# GET /listings/{id}/availability
# ============================================================

@router.get("/{listing_id}/availability")
def get_listing_availability(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
        )
        .order_by(Booking.check_in)
        .all()
    )

    return {
        "listing_id": listing_id,
        "blocked_dates": [
            {
                "check_in": booking.check_in,
                "check_out": booking.check_out,
            }
            for booking in bookings
        ],
    }


# ============================================================
# POST /listings
# ============================================================

@router.post("", response_model=ListingOut, status_code=201)
def create_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
):
    # Verify host exists.
    from ..models import User

    host = (
        db.query(User)
        .filter(
            User.id == listing_data.host_id,
            User.role == "host",
        )
        .first()
    )

    if not host:
        raise HTTPException(
            status_code=400,
            detail="Valid host user not found",
        )

    listing = Listing(
        host_id=listing_data.host_id,
        title=listing_data.title,
        description=listing_data.description,
        property_type=listing_data.property_type,
        price_per_night=listing_data.price_per_night,
        location_city=listing_data.location_city,
        location_country=listing_data.location_country,
        latitude=listing_data.latitude,
        longitude=listing_data.longitude,
        max_guests=listing_data.max_guests,
        bedrooms=listing_data.bedrooms,
        beds=listing_data.beds,
        bathrooms=listing_data.bathrooms,
    )

    # Attach amenities.
    if listing_data.amenity_ids:
        amenities = (
            db.query(Amenity)
            .filter(
                Amenity.id.in_(listing_data.amenity_ids)
            )
            .all()
        )

        listing.amenities = amenities

    db.add(listing)
    db.flush()

    # Add photos.
    for index, url in enumerate(
        listing_data.photo_urls
    ):
        photo = ListingPhoto(
            listing_id=listing.id,
            url=url,
            sort_order=index,
        )

        db.add(photo)

    db.commit()
    db.refresh(listing)

    return get_listing(
        listing.id,
        db,
    )


# ============================================================
# PUT /listings/{id}
# ============================================================

@router.put(
    "/{listing_id}",
    response_model=ListingOut,
)
def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    update_data = listing_data.model_dump(
        exclude_unset=True
    )

    photo_urls = update_data.pop(
        "photo_urls",
        None,
    )

    amenity_ids = update_data.pop(
        "amenity_ids",
        None,
    )

    # Update normal listing fields.
    for field, value in update_data.items():
        setattr(listing, field, value)

    # Replace photos when photo_urls is provided.
    if photo_urls is not None:
        listing.photos.clear()

        for index, url in enumerate(photo_urls):
            listing.photos.append(
                ListingPhoto(
                    url=url,
                    sort_order=index,
                )
            )

    # Replace amenities when amenity_ids is provided.
    if amenity_ids is not None:
        amenities = (
            db.query(Amenity)
            .filter(
                Amenity.id.in_(amenity_ids)
            )
            .all()
        )

        listing.amenities = amenities

    db.commit()
    db.refresh(listing)

    return get_listing(
        listing.id,
        db,
    )


# ============================================================
# DELETE /listings/{id}
# ============================================================

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    db.delete(listing)
    db.commit()

    return {
        "message": "Listing deleted successfully"
    }