"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  Bath,
  Users,
  Star,
  MapPin,
  Heart,
  Loader2,
} from "lucide-react";

import {
  getAvailability,
  getListing,
  createBooking,
} from "@/lib/api";

import { getCurrentUserId } from "@/lib/auth";

import type {
  AvailabilityRange,
  Listing,
} from "@/lib/types";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const listingId = Number(params.id);

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [blockedDates, setBlockedDates] =
    useState<AvailabilityRange[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [checkIn, setCheckIn] =
    useState(
      searchParams.get("checkIn") || ""
    );

  const [checkOut, setCheckOut] =
    useState(
      searchParams.get("checkOut") || ""
    );

  const [guests, setGuests] =
    useState(
      Number(
        searchParams.get("guests") || "1"
      )
    );

  const [booking, setBooking] =
    useState(false);

  const [favorite, setFavorite] =
    useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        setLoading(true);
        setError("");

        const [
          listingData,
          availability,
        ] = await Promise.all([
          getListing(listingId),
          getAvailability(listingId),
        ]);

        setListing(listingData);
        setBlockedDates(availability);
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

    if (
      Number.isInteger(listingId) &&
      listingId > 0
    ) {
      loadListing();
    } else {
      setLoading(false);
      setError("Invalid listing.");
    }
  }, [listingId]);

  function isDateBlocked(date: string) {
    if (!date) return false;

    const current =
      new Date(
        `${date}T00:00:00`
      ).getTime();

    return blockedDates.some((range) => {
      const start =
        new Date(
          `${range.check_in}T00:00:00`
        ).getTime();

      const end =
        new Date(
          `${range.check_out}T00:00:00`
        ).getTime();

      return (
        current >= start &&
        current < end
      );
    });
  }

  function hasBlockedDatesInRange() {
    if (!checkIn || !checkOut) {
      return false;
    }

    return blockedDates.some((range) => {
      return (
        checkIn < range.check_out &&
        checkOut > range.check_in
      );
    });
  }

  function calculateNights() {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start =
      new Date(
        `${checkIn}T00:00:00`
      ).getTime();

    const end =
      new Date(
        `${checkOut}T00:00:00`
      ).getTime();

    return Math.max(
      0,
      Math.ceil(
        (end - start) /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  const nights = calculateNights();

  const subtotal =
    listing && nights > 0
      ? listing.price_per_night *
        nights
      : 0;

  const serviceFee =
    subtotal > 0
      ? Math.round(
          subtotal * 0.12
        )
      : 0;

  const total =
    subtotal + serviceFee;

  async function handleReserve() {
    if (!listing) return;

    setError("");

    if (!checkIn || !checkOut) {
      setError(
        "Please select check-in and check-out dates."
      );
      return;
    }

    if (checkIn >= checkOut) {
      setError(
        "Check-out must be after check-in."
      );
      return;
    }

    if (isDateBlocked(checkIn)) {
      setError(
        "The selected check-in date is unavailable."
      );
      return;
    }

    if (hasBlockedDatesInRange()) {
      setError(
        "Some dates in your selected stay are unavailable."
      );
      return;
    }

    if (
      guests < 1 ||
      guests > listing.max_guests
    ) {
      setError(
        `This listing allows up to ${listing.max_guests} guests.`
      );
      return;
    }

    setBooking(true);

    try {
      const userId =
        await getCurrentUserId();

      if (!userId) {
        throw new Error(
          "Unable to identify the guest."
        );
      }

      const createdBooking =
        await createBooking({
          listing_id: listing.id,
          guest_id: userId,
          check_in: checkIn,
          check_out: checkOut,
          num_guests: guests,
        });

      router.push(
        `/booking/${listing.id}?bookingId=${createdBooking.id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create booking."
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="aspect-[4/3] rounded-2xl bg-gray-200 dark:bg-gray-700" />

            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-gray-200 dark:bg-gray-700"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">
          Listing not found
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          {error}
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

  if (!listing) {
    return null;
  }

  const photos =
    listing.photos?.length
      ? [...listing.photos].sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        )
      : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-sm font-medium hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {listing.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" />
              {listing.average_rating?.toFixed(1) ||
                "New"}
            </span>

            <span>·</span>

            <span>
              {listing.review_count || 0} reviews
            </span>

            <span>·</span>

            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {listing.location_city},{" "}
              {listing.location_country}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setFavorite(
              (current) => !current
            )
          }
          className="flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 sm:self-auto"
        >
          <Heart
            className={`h-5 w-5 ${
              favorite
                ? "fill-[#FF385C] text-[#FF385C]"
                : ""
            }`}
          />

          {favorite
            ? "Saved"
            : "Save"}
        </button>
      </div>

      {/* Photos */}
      <div className="mt-6 grid gap-2 overflow-hidden rounded-2xl md:grid-cols-2">
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
          {photos[0]?.url ? (
            <img
              src={photos[0].url}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No photo
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(
            (index) => (
              <div
                key={index}
                className="relative min-h-[140px] bg-gray-100 dark:bg-gray-800"
              >
                {photos[index]?.url ? (
                  <img
                    src={photos[index].url}
                    alt={`${listing.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No photo
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="text-2xl font-semibold">
            {listing.property_type} hosted by{" "}
            {listing.host?.name || "Host"}
          </h2>

          <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {listing.max_guests} guests
            </span>

            <span className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              {listing.beds} beds
            </span>

            <span className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              {listing.bedrooms} bedrooms
            </span>

            <span className="flex items-center gap-2">
              <Bath className="h-5 w-5" />
              {listing.bathrooms} bathrooms
            </span>
          </div>

          <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

          <p className="leading-7 text-gray-700 dark:text-gray-300">
            {listing.description}
          </p>

          {listing.amenities?.length > 0 && (
            <>
              <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

              <h2 className="text-xl font-semibold">
                What this place offers
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {listing.amenities.map(
                  (amenity) => (
                    <div
                      key={amenity.id}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      {amenity.name}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>

        {/* Reservation */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-semibold">
                ${listing.price_per_night}
              </span>

              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                night
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-current" />

              {listing.average_rating?.toFixed(1) ||
                "New"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-600">
            <label className="p-3">
              <span className="block text-xs font-semibold uppercase">
                Check-in
              </span>

              <input
                type="date"
                value={checkIn}
                onChange={(e) =>
                  setCheckIn(
                    e.target.value
                  )
                }
                className="mt-1 w-full bg-transparent text-sm outline-none"
              />
            </label>

            <label className="border-l border-gray-300 p-3 dark:border-gray-600">
              <span className="block text-xs font-semibold uppercase">
                Check-out
              </span>

              <input
                type="date"
                value={checkOut}
                onChange={(e) =>
                  setCheckOut(
                    e.target.value
                  )
                }
                className="mt-1 w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          <label className="mt-2 block rounded-xl border border-gray-300 p-3 dark:border-gray-600">
            <span className="block text-xs font-semibold uppercase">
              Guests
            </span>

            <select
              value={guests}
              onChange={(e) =>
                setGuests(
                  Number(e.target.value)
                )
              }
              className="mt-1 w-full bg-transparent text-sm outline-none"
            >
              {Array.from(
                {
                  length:
                    listing.max_guests,
                },
                (_, index) =>
                  index + 1
              ).map((number) => (
                <option
                  key={number}
                  value={number}
                  className="bg-white text-black dark:bg-gray-800 dark:text-white"
                >
                  {number}{" "}
                  {number === 1
                    ? "guest"
                    : "guests"}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {nights > 0 && (
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>
                  ${listing.price_per_night} ×{" "}
                  {nights} nights
                </span>

                <span>
                  ${subtotal}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Service fee</span>

                <span>
                  ${serviceFee}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleReserve}
            disabled={booking}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] py-4 font-semibold text-white transition hover:bg-[#e31c5f] disabled:opacity-60"
          >
            {booking && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}

            {booking
              ? "Reserving..."
              : "Reserve"}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            You won't be charged yet.
          </p>
        </aside>
      </div>
    </main>
  );
}