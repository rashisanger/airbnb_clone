"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  Star,
  Heart,
  Loader2,
} from "lucide-react";

import {
  getListing,
  getAvailability,
  createBooking,
  toggleFavorite,
  removeFavorite,
  getFavorites,
} from "@/lib/api";

import { getCurrentUserId } from "@/lib/auth";

import type {
  Listing,
  AvailabilityRange,
} from "@/lib/types";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [availability, setAvailability] =
    useState<AvailabilityRange[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        if (!Number.isInteger(id) || id <= 0) {
          throw new Error("Invalid listing ID.");
        }

        const userId = await getCurrentUserId();

        const [listingData, availabilityData, favorites] =
          await Promise.all([
            getListing(id),
            getAvailability(id),
            getFavorites(userId),
          ]);

        setListing(listingData);
        setAvailability(availabilityData);

        setIsFavorite(
          favorites.some((fav) => fav.id === id)
        );
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load listing."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      setFavoritesLoading(true);

      const userId = await getCurrentUserId();

      if (isFavorite) {
        await removeFavorite(userId, id);
        setIsFavorite(false);
      } else {
        await toggleFavorite(userId, id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update wishlist."
      );
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!listing) return;

    if (!checkIn || !checkOut) {
      alert(
        "Please select check-in and check-out dates."
      );
      return;
    }

    if (checkOut <= checkIn) {
      alert(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (
      guests < 1 ||
      guests > listing.max_guests
    ) {
      alert(
        `Guests must be between 1 and ${listing.max_guests}.`
      );
      return;
    }

    try {
      setBookingLoading(true);

      const userId = await getCurrentUserId();

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const nights = Math.ceil(
        (checkOutDate.getTime() -
          checkInDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      if (nights <= 0) {
        throw new Error(
          "Invalid booking dates."
        );
      }

      // Check against blocked dates returned by backend
      const hasOverlap = availability.some(
        (range) =>
          checkIn < range.check_out &&
          checkOut > range.check_in
      );

      if (hasOverlap) {
        throw new Error(
          "The selected dates are not available."
        );
      }

      const totalPrice =
        listing.price_per_night * nights;

      const createdBooking = await createBooking({
        listing_id: listing.id,
        guest_id: userId,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guests,
        total_price: totalPrice,
      });

      router.push(
        `/booking/${listing.id}?bookingId=${createdBooking.id}`
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading listing...
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">
          Listing not found
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          {error ||
            "We couldn't find this listing."}
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[#FF385C] px-5 py-3 font-semibold text-white"
        >
          Back to explore
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-semibold">
            {listing.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {listing.location_city},{" "}
                {listing.location_country}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-500" />

              <span>
                {listing.average_rating > 0
                  ? listing.average_rating.toFixed(1)
                  : "New"}
              </span>

              {listing.review_count > 0 && (
                <span className="text-sm text-gray-500">
                  ({listing.review_count} reviews)
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            {listing.photos?.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={listing.title}
                className="h-64 w-full rounded-xl object-cover"
              />
            ))}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
            <h2 className="text-xl font-semibold">
              About this place
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {listing.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Property type
                </p>

                <p className="mt-1 font-medium capitalize">
                  {listing.property_type}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Max guests
                </p>

                <p className="mt-1 font-medium">
                  {listing.max_guests}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Bedrooms
                </p>

                <p className="mt-1 font-medium">
                  {listing.bedrooms}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Beds
                </p>

                <p className="mt-1 font-medium">
                  {listing.beds}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Bathrooms
                </p>

                <p className="mt-1 font-medium">
                  {listing.bathrooms}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">
                ${listing.price_per_night}
              </span>

              <span className="text-gray-500">
                / night
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  Check-in
                </label>

                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) =>
                    setCheckIn(e.target.value)
                  }
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Check-out
                </label>

                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) =>
                    setCheckOut(e.target.value)
                  }
                  min={
                    checkIn ||
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Guests
                </label>

                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <input
                    type="number"
                    value={guests}
                    onChange={(e) =>
                      setGuests(
                        Number(e.target.value)
                      )
                    }
                    min={1}
                    max={listing.max_guests}
                    className="mt-1 w-full rounded-xl border border-gray-300 py-2 pl-9 pr-4 dark:border-gray-600 dark:bg-gray-900"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Maximum {listing.max_guests} guests
                </p>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="mt-6 w-full rounded-xl bg-[#FF385C] py-3 font-semibold text-white transition hover:bg-[#e31c5f] disabled:opacity-50"
            >
              {bookingLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Booking...
                </div>
              ) : (
                "Reserve now"
              )}
            </button>

            <button
              onClick={handleToggleFavorite}
              disabled={favoritesLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-2 font-medium transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Heart
                className={
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : ""
                }
              />

              {isFavorite
                ? "Remove from wishlist"
                : "Add to wishlist"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}