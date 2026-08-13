from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Listing, User
from ..schemas import (
    BookingCreate,
    BookingOut,
    BookingPriceBreakdown,
    MyBookingOut,
    BookingListingSummary,
    HostBookingOut,
)


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


# ============================================================
# Helper: calculate booking price
# ============================================================

def calculate_price(
    price_per_night: float,
    check_in: date,
    check_out: date,
):
    nights = (check_out - check_in).days

    subtotal = price_per_night * nights

    # Keep the same simple pricing structure
    # used by the frontend.
    cleaning_fee = 0

    service_fee = round(subtotal * 0.12)

    total_price = (
        subtotal
        + cleaning_fee
        + service_fee
    )

    return (
        nights,
        subtotal,
        cleaning_fee,
        service_fee,
        total_price,
    )


# ============================================================
# POST /bookings
# Create a booking
# ============================================================

@router.post(
    "",
    response_model=BookingOut,
)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check listing
    # --------------------------------------------------------

    listing = (
        db.query(Listing)
        .filter(Listing.id == data.listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # --------------------------------------------------------
    # Check guest
    # --------------------------------------------------------

    guest = (
        db.query(User)
        .filter(User.id == data.guest_id)
        .first()
    )

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )

    # Host should not book their own listing
    if listing.host_id == guest.id:
        raise HTTPException(
            status_code=400,
            detail="Hosts cannot book their own listing",
        )

    # --------------------------------------------------------
    # Validate dates
    # --------------------------------------------------------

    if data.check_in >= data.check_out:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in",
        )

    if data.check_in < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in date cannot be in the past",
        )

    # --------------------------------------------------------
    # Validate number of guests
    # --------------------------------------------------------

    if data.num_guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=(
                f"This listing allows up to "
                f"{listing.max_guests} guests"
            ),
        )

    # --------------------------------------------------------
    # Check overlapping bookings
    #
    # Existing:
    #   check_in < new_check_out
    #   AND
    #   check_out > new_check_in
    #
    # means the dates overlap.
    # --------------------------------------------------------

    overlapping_booking = (
        db.query(Booking)
        .filter(
            Booking.listing_id == data.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in,
        )
        .first()
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=400,
            detail="The listing is already booked for these dates",
        )

    # --------------------------------------------------------
    # Calculate price
    # --------------------------------------------------------

    (
        nights,
        subtotal,
        cleaning_fee,
        service_fee,
        total_price,
    ) = calculate_price(
        listing.price_per_night,
        data.check_in,
        data.check_out,
    )

    if nights <= 0:
        raise HTTPException(
            status_code=400,
            detail="Booking must be at least one night",
        )

    # --------------------------------------------------------
    # Create booking
    # --------------------------------------------------------

    booking = Booking(
        listing_id=data.listing_id,
        guest_id=data.guest_id,
        check_in=data.check_in,
        check_out=data.check_out,
        num_guests=data.num_guests,
        total_price=total_price,
        status="confirmed",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # --------------------------------------------------------
    # Return booking + price breakdown
    # --------------------------------------------------------

    return BookingOut(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        num_guests=booking.num_guests,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        price_breakdown=BookingPriceBreakdown(
            nights=nights,
            price_per_night=listing.price_per_night,
            subtotal=subtotal,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=total_price,
        ),
    )


# ============================================================
# GET /bookings/me
# Get guest's bookings
# ============================================================

@router.get(
    "/me",
    response_model=list[MyBookingOut],
)
def get_my_bookings(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    bookings = (
        db.query(Booking)
        .filter(Booking.guest_id == user_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []

    for booking in bookings:
        listing = booking.listing

        cover_photo = None

        if listing.photos:
            cover_photo = listing.photos[0].url

        result.append(
            MyBookingOut(
                id=booking.id,
                listing_id=booking.listing_id,
                guest_id=booking.guest_id,
                check_in=booking.check_in,
                check_out=booking.check_out,
                num_guests=booking.num_guests,
                total_price=booking.total_price,
                status=booking.status,
                created_at=booking.created_at,
                listing=BookingListingSummary(
                    id=listing.id,
                    title=listing.title,
                    cover_photo=cover_photo,
                    location_city=listing.location_city,
                    location_country=listing.location_country,
                ),
            )
        )

    return result


# ============================================================
# GET /bookings/{booking_id}
# Get one booking
# ============================================================

@router.get(
    "/{booking_id}",
    response_model=BookingOut,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    listing = booking.listing

    nights = (
        booking.check_out - booking.check_in
    ).days

    subtotal = listing.price_per_night * nights
    cleaning_fee = 0
    service_fee = round(subtotal * 0.12)

    return BookingOut(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        num_guests=booking.num_guests,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        price_breakdown=BookingPriceBreakdown(
            nights=nights,
            price_per_night=listing.price_per_night,
            subtotal=subtotal,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=booking.total_price,
        ),
    )


# ============================================================
# DELETE /bookings/{booking_id}
# Cancel booking
# ============================================================

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled",
        )

    booking.status = "cancelled"

    db.commit()

    return {
        "message": "Booking cancelled successfully"
    }


# ============================================================
# GET /bookings/host/{host_id}
# Host bookings
#
# NOTE:
# Your frontend currently expects:
# /host/{host_id}/bookings
#
# So the separate host route below is provided there as well.
# ============================================================