"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  CalendarDays,
  Users,
} from "lucide-react";

import {
  getListing,
  getMyTrips,
} from "@/lib/api";

import { getCurrentUserId } from "@/lib/auth";

import type {
  Listing,
  MyBooking,
} from "@/lib/types";

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const listingId = Number(params.id);

  const bookingId =
    Number(
      searchParams.get("bookingId")
    );

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [booking, setBooking] =
    useState<MyBooking | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError("");

        if (
          !Number.isInteger(listingId) ||
          listingId <= 0
        ) {
          throw new Error(
            "Invalid listing."
          );
        }

        if (
          !Number.isInteger(bookingId) ||
          bookingId <= 0
        ) {
          throw new Error(
            "Invalid booking."
          );
        }

        const userId =
          await getCurrentUserId();

        const [
          listingData,
          trips,
        ] = await Promise.all([
          getListing(listingId),
          getMyTrips(userId),
        ]);

        const foundBooking =
          trips.find(
            (item) =>
              item.id === bookingId
          );

        if (!foundBooking) {
          throw new Error(
            "Booking not found."
          );
        }

        setListing(listingData);
        setBooking(foundBooking);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load booking."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [listingId, bookingId]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your booking...
        </div>
      </main>
    );
  }

  if (error || !booking || !listing) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">
          Booking not found
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          {error ||
            "We couldn't find this booking."}
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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-10">
        {/* Success */}
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

          <h1 className="mt-5 text-3xl font-semibold">
            Booking confirmed!
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Your trip has been successfully booked.
          </p>
        </div>

        {/* Listing */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
          {listing.photos?.[0]?.url && (
            <img
              src={listing.photos[0].url}
              alt={listing.title}
              className="h-64 w-full object-cover"
            />
          )}

          <div className="p-5">
            <h2 className="text-xl font-semibold">
              {listing.title}
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {listing.location_city},{" "}
              {listing.location_country}
            </p>
          </div>
        </div>

        {/* Booking details */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-5 w-5" />
              Check-in
            </div>

            <p className="mt-2 text-lg font-semibold">
              {booking.check_in}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-5 w-5" />
              Check-out
            </div>

            <p className="mt-2 text-lg font-semibold">
              {booking.check_out}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-5 w-5" />
              Guests
            </div>

            <p className="mt-2 text-lg font-semibold">
              {booking.num_guests}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm font-medium">
              Booking ID
            </p>

            <p className="mt-2 text-lg font-semibold">
              #{booking.id}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/trips"
            className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            View my trips
          </Link>

          <Link
            href="/"
            className="flex-1 rounded-xl bg-[#FF385C] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#e31c5f]"
          >
            Explore more stays
          </Link>
        </div>
      </div>
    </main>
  );
}