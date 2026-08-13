"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import type {
    Listing,
    ListingCreate,
    ListingUpdate,
} from "@/lib/types";

const AMENITIES = [
    { id: 1, name: "Wifi" },
    { id: 2, name: "Kitchen" },
    { id: 3, name: "Free parking" },
    { id: 4, name: "Pool" },
    { id: 5, name: "Air conditioning" },
    { id: 6, name: "Washer" },
    { id: 7, name: "TV" },
    { id: 8, name: "Dedicated workspace" },
    { id: 9, name: "Hot tub" },
    { id: 10, name: "Fireplace" },
];

const PROPERTY_TYPES = [
    "Apartment",
    "House",
    "Villa",
    "Cabin",
    "Loft",
    "Condo",
    "Guesthouse",
    "Hotel",
];

interface ListingFormProps {
    mode: "create" | "edit";
    listing?: Listing;
    hostId: number;
    onSubmit: (
        data: ListingCreate | ListingUpdate
    ) => Promise<void>;
}

export default function ListingForm({
    mode,
    listing,
    hostId,
    onSubmit,
}: ListingFormProps) {
    // ------------------------------------------------------------
    // Basic listing information
    // ------------------------------------------------------------

    const [title, setTitle] = useState(
        listing?.title || ""
    );

    const [description, setDescription] = useState(
        listing?.description || ""
    );

    const [propertyType, setPropertyType] = useState(
        listing?.property_type || "Apartment"
    );

    const [price, setPrice] = useState(
        listing?.price_per_night?.toString() || ""
    );

    // ------------------------------------------------------------
    // Location
    // ------------------------------------------------------------

    const [city, setCity] = useState(
        listing?.location_city || ""
    );

    const [country, setCountry] = useState(
        listing?.location_country || ""
    );

    // ------------------------------------------------------------
    // Capacity
    // ------------------------------------------------------------

    const [maxGuests, setMaxGuests] = useState(
        listing?.max_guests?.toString() || "2"
    );

    const [bedrooms, setBedrooms] = useState(
        listing?.bedrooms?.toString() || "1"
    );

    const [beds, setBeds] = useState(
        listing?.beds?.toString() || "1"
    );

    const [bathrooms, setBathrooms] = useState(
        listing?.bathrooms?.toString() || "1"
    );

    // ------------------------------------------------------------
    // Amenities
    // ------------------------------------------------------------

    const [amenities, setAmenities] = useState<number[]>(
        listing?.amenities?.map(
            (amenity) => amenity.id
        ) || []
    );

    // ------------------------------------------------------------
    // Photos
    //
    // IMPORTANT:
    // Existing photos are loaded when editing.
    // The user does NOT have to enter a new photo URL
    // just to change something like the price.
    // ------------------------------------------------------------

    const [photos, setPhotos] = useState<string[]>(
        listing?.photos
            ? [...listing.photos]
                .sort(
                    (a, b) =>
                        a.sort_order - b.sort_order
                )
                .map((photo) => photo.url)
            : []
    );

    const [photoInput, setPhotoInput] =
        useState("");

    // ------------------------------------------------------------
    // Form state
    // ------------------------------------------------------------

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    // ------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------

    function toggleAmenity(id: number) {
        setAmenities((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (amenityId) => amenityId !== id
                );
            }

            return [...current, id];
        });
    }

    function addPhoto() {
        const url = photoInput.trim();

        if (!url) {
            return;
        }

        setPhotos((current) => [
            ...current,
            url,
        ]);

        setPhotoInput("");
    }

    function removePhoto(index: number) {
        setPhotos((current) =>
            current.filter(
                (_, photoIndex) =>
                    photoIndex !== index
            )
        );
    }

    // ------------------------------------------------------------
    // Submit
    // ------------------------------------------------------------

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        // -----------------------------
        // Validation
        // -----------------------------

        if (!title.trim()) {
            setError("Please enter a title.");
            return;
        }

        if (!description.trim()) {
            setError("Please enter a description.");
            return;
        }

        if (!city.trim() || !country.trim()) {
            setError(
                "Please enter both city and country."
            );
            return;
        }

        if (
            !price ||
            Number(price) <= 0
        ) {
            setError(
                "Price must be greater than zero."
            );
            return;
        }

        if (
            !maxGuests ||
            Number(maxGuests) <= 0
        ) {
            setError(
                "Maximum guests must be greater than zero."
            );
            return;
        }

        if (
            !beds ||
            Number(beds) <= 0
        ) {
            setError(
                "Beds must be greater than zero."
            );
            return;
        }

        if (
            !bathrooms ||
            Number(bathrooms) <= 0
        ) {
            setError(
                "Bathrooms must be greater than zero."
            );
            return;
        }

        // Only CREATE requires at least one photo.
        //
        // In EDIT mode:
        // - Existing photos are already loaded.
        // - The user can simply change the price/title/etc.
        // - They do NOT need to enter a new photo URL.
        if (
            mode === "create" &&
            photos.length === 0
        ) {
            setError(
                "Please add at least one photo URL."
            );
            return;
        }

        // ------------------------------------------------------------
        // Build common data
        // ------------------------------------------------------------

        const photoData = photos.map(
            (url, index) => ({
                url,
                sort_order: index + 1,
            })
        );

        const baseData = {
            title: title.trim(),
            description: description.trim(),
            property_type: propertyType,

            price_per_night: Number(price),

            location_city: city.trim(),
            location_country: country.trim(),

            max_guests: Number(maxGuests),
            bedrooms: Number(bedrooms),
            beds: Number(beds),
            bathrooms: Number(bathrooms),

            amenities,

            photos: photoData,
        };

        // ------------------------------------------------------------
        // Send request
        // ------------------------------------------------------------

        try {
            setSubmitting(true);

            if (mode === "create") {
                // CREATE needs host_id.
                await onSubmit({
                    ...baseData,
                    host_id: hostId,
                } as ListingCreate);
            } else {
                // EDIT does NOT need host_id.
                //
                // Existing photos are sent back unchanged unless
                // the user intentionally added/removed photos.
                await onSubmit(
                    baseData as ListingUpdate
                );
            }
        } catch (error) {
            console.error(
                "Listing save error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to save listing."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // ------------------------------------------------------------
    // Tailwind input style
    // ------------------------------------------------------------

    const inputClass =
        "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#222] focus:ring-1 focus:ring-[#222]";

    // ------------------------------------------------------------
    // UI
    // ------------------------------------------------------------

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {/* Error */}
            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* ========================================================
          BASIC INFORMATION
      ======================================================== */}

            <section>
                <h2 className="text-xl font-semibold">
                    Basic information
                </h2>

                <div className="mt-5 space-y-5">
                    {/* Title */}
                    <label className="block">
                        <span className="font-medium">
                            Title
                        </span>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Cozy apartment in the heart of Paris"
                            className={inputClass}
                        />
                    </label>

                    {/* Description */}
                    <label className="block">
                        <span className="font-medium">
                            Description
                        </span>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            rows={5}
                            placeholder="Tell guests what makes your place special..."
                            className={inputClass}
                        />
                    </label>

                    {/* Property type */}
                    <label className="block">
                        <span className="font-medium">
                            Property type
                        </span>

                        <select
                            value={propertyType}
                            onChange={(e) =>
                                setPropertyType(
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        >
                            {PROPERTY_TYPES.map(
                                (type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                )
                            )}
                        </select>
                    </label>
                </div>
            </section>

            {/* ========================================================
          PRICE AND CAPACITY
      ======================================================== */}

            <section>
                <h2 className="text-xl font-semibold">
                    Price and capacity
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Price */}
                    <label>
                        <span className="font-medium">
                            Price / night
                        </span>

                        <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) =>
                                setPrice(
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </label>

                    {/* Guests */}
                    <label>
                        <span className="font-medium">
                            Max guests
                        </span>

                        <input
                            type="number"
                            min="1"
                            value={maxGuests}
                            onChange={(e) =>
                                setMaxGuests(
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </label>

                    {/* Bedrooms */}
                    <label>
                        <span className="font-medium">
                            Bedrooms
                        </span>

                        <input
                            type="number"
                            min="0"
                            value={bedrooms}
                            onChange={(e) =>
                                setBedrooms(
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </label>

                    {/* Beds */}
                    <label>
                        <span className="font-medium">
                            Beds
                        </span>

                        <input
                            type="number"
                            min="1"
                            value={beds}
                            onChange={(e) =>
                                setBeds(
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </label>

                    {/* Bathrooms */}
                    <label>
                        <span className="font-medium">
                            Bathrooms
                        </span>

                        <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={bathrooms}
                            onChange={(e) =>
                                setBathrooms(
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </label>
                </div>
            </section>

            {/* ========================================================
          LOCATION
      ======================================================== */}

            <section>
                <h2 className="text-xl font-semibold">
                    Location
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {/* City */}
                    <label>
                        <span className="font-medium">
                            City
                        </span>

                        <input
                            type="text"
                            value={city}
                            onChange={(e) =>
                                setCity(
                                    e.target.value
                                )
                            }
                            placeholder="Paris"
                            className={inputClass}
                        />
                    </label>

                    {/* Country */}
                    <label>
                        <span className="font-medium">
                            Country
                        </span>

                        <input
                            type="text"
                            value={country}
                            onChange={(e) =>
                                setCountry(
                                    e.target.value
                                )
                            }
                            placeholder="France"
                            className={inputClass}
                        />
                    </label>
                </div>
            </section>

            {/* ========================================================
          AMENITIES
      ======================================================== */}

            <section>
                <h2 className="text-xl font-semibold">
                    Amenities
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {AMENITIES.map(
                        (amenity) => (
                            <label
                                key={amenity.id}
                                className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={amenities.includes(
                                        amenity.id
                                    )}
                                    onChange={() =>
                                        toggleAmenity(
                                            amenity.id
                                        )
                                    }
                                    className="h-4 w-4 accent-[#FF385C]"
                                />

                                <span>
                                    {amenity.name}
                                </span>
                            </label>
                        )
                    )}
                </div>
            </section>

            {/* ========================================================
          PHOTOS
      ======================================================== */}

            <section>
                <h2 className="text-xl font-semibold">
                    Photos
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Add image URLs for your listing.
                </p>

                {/* Add photo */}
                <div className="mt-5 flex gap-2">
                    <input
                        type="url"
                        value={photoInput}
                        onChange={(e) =>
                            setPhotoInput(
                                e.target.value
                            )
                        }
                        placeholder="https://example.com/photo.jpg"
                        className={inputClass.replace(
                            "mt-2",
                            "mt-0"
                        )}
                    />

                    <button
                        type="button"
                        onClick={addPhoto}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-black px-5 text-white hover:bg-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Existing photos */}
                {photos.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {photos.map(
                            (photo, index) => (
                                <div
                                    key={`${photo}-${index}`}
                                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                                >
                                    <span className="min-w-0 flex-1 truncate text-sm text-gray-600">
                                        {photo}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removePhoto(index)
                                        }
                                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                                        aria-label="Remove photo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Helpful edit-mode message */}
                {mode === "edit" &&
                    photos.length > 0 && (
                        <p className="mt-3 text-sm text-gray-500">
                            Existing photos are kept automatically.
                            You only need to change them if you want
                            to add or remove photos.
                        </p>
                    )}
            </section>

            {/* ========================================================
          SUBMIT
      ======================================================== */}

            <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] py-4 font-semibold text-white transition hover:bg-[#e31c5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                )}

                {submitting
                    ? "Saving..."
                    : mode === "create"
                        ? "Create listing"
                        : "Save changes"}
            </button>
        </form>
    );
}