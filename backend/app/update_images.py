from .database import SessionLocal
from .models import Listing, ListingPhoto


# Different house / apartment / villa images
IMAGE_SETS = {
    1: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    ],
    2: [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    ],
    3: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    ],
    4: [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    ],
    5: [
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    ],
    6: [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    ],
    7: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
    ],
    8: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    ],
    9: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    ],
    10: [
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    ],
    11: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
    ],
    12: [
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
        "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    ],
    13: [
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    ],
    14: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    ],
}


def update_images():
    db = SessionLocal()

    try:
        listings = db.query(Listing).all()

        for listing in listings:
            urls = IMAGE_SETS.get(listing.id)

            if not urls:
                continue

            # Delete old photos
            db.query(ListingPhoto).filter(
                ListingPhoto.listing_id == listing.id
            ).delete()

            # Add new photos
            for index, url in enumerate(urls):
                photo = ListingPhoto(
                    listing_id=listing.id,
                    url=url,
                    sort_order=index,
                )

                db.add(photo)

            print(
                f"Updated listing {listing.id}: "
                f"{listing.title}"
            )

        db.commit()

        print("\nAll listing images updated successfully!")

    except Exception as e:
        db.rollback()
        print("Error:", e)

    finally:
        db.close()


if __name__ == "__main__":
    update_images()