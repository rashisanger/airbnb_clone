from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Favorite, Listing
from ..routers.listings import listing_to_summary
from ..schemas import ListingSummary


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
)


# ============================================================
# Schemas
# ============================================================

class FavoriteRequest(BaseModel):
    user_id: int
    listing_id: int


# ============================================================
# POST /favorites
# ============================================================

@router.post("")
def add_favorite(
    data: FavoriteRequest,
    db: Session = Depends(get_db),
):
    """
    Add a listing to the user's wishlist.

    The composite primary key on Favorite means the same
    listing cannot be added twice for the same user.
    We also check manually so the endpoint is idempotent.
    """

    # Verify listing exists.
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

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == data.user_id,
            Favorite.listing_id == data.listing_id,
        )
        .first()
    )

    # Already favorited → simply return success.
    if existing:
        return {
            "message": "Listing already in favorites"
        }

    favorite = Favorite(
        user_id=data.user_id,
        listing_id=data.listing_id,
    )

    db.add(favorite)
    db.commit()

    return {
        "message": "Listing added to favorites"
    }


# ============================================================
# DELETE /favorites
# ============================================================

@router.delete("")
def remove_favorite(
    data: FavoriteRequest,
    db: Session = Depends(get_db),
):
    """
    Remove a listing from the user's wishlist.
    """

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == data.user_id,
            Favorite.listing_id == data.listing_id,
        )
        .first()
    )

    if not favorite:
        return {
            "message": "Listing was not in favorites"
        }

    db.delete(favorite)
    db.commit()

    return {
        "message": "Listing removed from favorites"
    }


# ============================================================
# GET /favorites/me
# ============================================================

@router.get(
    "/me",
    response_model=list[ListingSummary],
)
def get_my_favorites(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Return all listings favorited by the user.
    """

    listings = (
        db.query(Listing)
        .join(
            Favorite,
            Favorite.listing_id == Listing.id,
        )
        .options(
            joinedload(Listing.photos),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(
            Favorite.user_id == user_id
        )
        .order_by(
            Listing.created_at.desc()
        )
        .all()
    )

    return [
        listing_to_summary(db, listing)
        for listing in listings
    ]