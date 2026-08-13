from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# Nested / reusable schemas
# ============================================================

class PhotoOut(BaseModel):
    id: int
    url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class AmenityOut(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class HostSummary(BaseModel):
    id: int
    name: str
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ReviewOut(BaseModel):
    id: int
    guest_id: int
    rating: int
    comment: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# Listing schemas
# ============================================================

class ListingSummary(BaseModel):
    """
    Lightweight listing representation used by the
    explore/search grid.
    """

    id: int
    title: str
    property_type: str
    price_per_night: float
    location_city: str
    location_country: str
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float

    # First/main photo displayed on the listing card.
    cover_photo: str | None = None

    # Average rating displayed on the listing card.
    average_rating: float = 0
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ListingOut(BaseModel):
    """
    Complete listing response used by the listing detail page.
    """

    id: int
    host_id: int

    title: str
    description: str
    property_type: str
    price_per_night: float

    location_city: str
    location_country: str
    latitude: float | None = None
    longitude: float | None = None

    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float

    created_at: datetime
    updated_at: datetime

    photos: list[PhotoOut] = []
    amenities: list[AmenityOut] = []
    host: HostSummary

    average_rating: float = 0
    review_count: int = 0
    reviews: list[ReviewOut] = []

    model_config = ConfigDict(from_attributes=True)


class ListingCreate(BaseModel):
    """
    Data required when creating a listing.
    """

    host_id: int
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    property_type: str = Field(min_length=1, max_length=50)

    price_per_night: float = Field(gt=0)

    location_city: str = Field(min_length=1, max_length=100)
    location_country: str = Field(min_length=1, max_length=100)

    latitude: float | None = None
    longitude: float | None = None

    max_guests: int = Field(gt=0)
    bedrooms: int = Field(ge=0)
    beds: int = Field(ge=0)
    bathrooms: float = Field(gt=0)

    # Optional photos and amenities.
    # We keep this simple because authentication and file uploads
    # are mocked for this assignment.
    photo_urls: list[str] = []
    amenity_ids: list[int] = []


class ListingUpdate(BaseModel):
    """
    All fields are optional so PUT can update only the fields
    supplied by the client.
    """

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None
    property_type: str | None = None

    price_per_night: float | None = Field(
        default=None,
        gt=0,
    )

    location_city: str | None = None
    location_country: str | None = None

    latitude: float | None = None
    longitude: float | None = None

    max_guests: int | None = Field(
        default=None,
        gt=0,
    )

    bedrooms: int | None = Field(
        default=None,
        ge=0,
    )

    beds: int | None = Field(
        default=None,
        ge=0,
    )

    bathrooms: float | None = Field(
        default=None,
        gt=0,
    )

    photo_urls: list[str] | None = None
    amenity_ids: list[int] | None = None
    
class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    num_guests: int = Field(gt=0)


class BookingPriceBreakdown(BaseModel):
    nights: int
    price_per_night: float
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total_price: float


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    num_guests: int
    total_price: float
    status: str
    created_at: datetime
    price_breakdown: BookingPriceBreakdown

    model_config = ConfigDict(from_attributes=True)


class BookingListingSummary(BaseModel):
    id: int
    title: str
    cover_photo: str | None = None
    location_city: str
    location_country: str


class MyBookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    num_guests: int
    total_price: float
    status: str
    created_at: datetime
    listing: BookingListingSummary


class HostListingOut(BaseModel):
    id: int
    title: str
    price_per_night: float
    location_city: str
    location_country: str
    property_type: str
    max_guests: int
    cover_photo: str | None = None


class HostBookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    num_guests: int
    total_price: float
    status: str
    created_at: datetime
    listing_title: str
    guest_name: str