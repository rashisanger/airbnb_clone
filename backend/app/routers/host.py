from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Listing, User
from ..schemas import HostBookingOut, HostListingOut


router = APIRouter(
    prefix="/host",
    tags=["Host"],
)


# ============================================================
# GET /host/{host_id}/listings
# ============================================================

@router.get(
    "/{host_id}/listings",
    response_model=list[HostListingOut],
)
def get_host_listings(
    host_id: int,
    db: Session = Depends(get_db),
):
    host = (
        db.query(User)
        .filter(User.id == host_id)
        .first()
    )

    if not host:
        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    listings = (
        db.query(Listing)
        .filter(Listing.host_id == host_id)
        .order_by(Listing.created_at.desc())
        .all()
    )

    result = []

    for listing in listings:
        cover_photo = None

        if listing.photos:
            cover_photo = listing.photos[0].url

        result.append(
            HostListingOut(
                id=listing.id,
                title=listing.title,
                price_per_night=listing.price_per_night,
                location_city=listing.location_city,
                location_country=listing.location_country,
                property_type=listing.property_type,
                max_guests=listing.max_guests,
                cover_photo=cover_photo,
            )
        )

    return result


# ============================================================
# GET /host/{host_id}/bookings
# ============================================================

@router.get(
    "/{host_id}/bookings",
    response_model=list[HostBookingOut],
)
def get_host_bookings(
    host_id: int,
    db: Session = Depends(get_db),
):
    host = (
        db.query(User)
        .filter(User.id == host_id)
        .first()
    )

    if not host:
        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    bookings = (
        db.query(Booking)
        .join(Listing)
        .filter(Listing.host_id == host_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []

    for booking in bookings:
        result.append(
            HostBookingOut(
                id=booking.id,
                listing_id=booking.listing_id,
                guest_id=booking.guest_id,
                check_in=booking.check_in,
                check_out=booking.check_out,
                num_guests=booking.num_guests,
                total_price=booking.total_price,
                status=booking.status,
                created_at=booking.created_at,
                listing_title=booking.listing.title,
                guest_name=booking.guest.name,
            )
        )

    return result