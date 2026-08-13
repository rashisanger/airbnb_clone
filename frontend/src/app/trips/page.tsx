"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";

import { getMyTrips } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import type { MyBooking } from "@/lib/types";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function isUpcoming(booking: MyBooking) {
  return new Date(
    `${booking.check_out}T23:59:59`
  ) >= new Date();
}

function BookingCard({
  booking,
  past,
}: {
  booking: MyBooking;
  past: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-56 w-full sm:h-auto sm:w-64">
          {booking.listing?.photo && (
            <Image
              src={booking.listing.photo}
              alt={booking.listing.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">
                {booking.listing?.location}
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                {booking.listing?.title}
              </h3>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "completed"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />

              {formatDate(booking.check_in)}
              {" → "}
              {formatDate(booking.check_out)}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {booking.listing?.location}
            </div>

            <p>
              {booking.num_guests} guest
              {booking.num_guests !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="text-lg font-semibold">
                ${Number(booking.total_price).toFixed(2)}
              </p>
            </div>

            {past &&
              booking.status === "completed" && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  onClick={() =>
                    alert(
                      "Review feature is a TODO / bonus."
                    )
                  }
                >
                  <Star className="h-4 w-4" />
                  Leave a review
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [bookings, setBookings] =
    useState<MyBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadTrips() {
      try {
        const userId =
          await getCurrentUserId();

        const data =
          await getMyTrips(userId);

        setBookings(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your trips."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  const upcoming =
    bookings.filter(isUpcoming);

  const past =
    bookings.filter(
      (booking) => !isUpcoming(booking)
    );

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-48 rounded bg-gray-200" />

          <div className="h-56 rounded-2xl bg-gray-200" />

          <div className="h-56 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">
        My Trips
      </h1>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upcoming */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">
          Upcoming
        </h2>

        {upcoming.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed p-8 text-center">
            <p className="font-medium">
              No upcoming trips
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Time to start planning your next
              adventure.
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white"
            >
              Explore stays
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                past={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">
          Past
        </h2>

        {past.length === 0 ? (
          <p className="mt-5 text-gray-500">
            No past trips yet.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                past
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}