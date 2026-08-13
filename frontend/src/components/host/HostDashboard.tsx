"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/Toast";

import HostGuard from "@/components/host/HostGuard";
import {
  deleteListing,
  getHostBookings,
  getHostListings,
} from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import type {
  HostBooking,
  HostListing,
} from "@/lib/types";

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardContent() {
  const [listings, setListings] =
    useState<HostListing[]>([]);

  const [bookings, setBookings] =
    useState<HostBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const toast = useToast();

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const hostId =
          await getCurrentUserId("host");

        const [listingData, bookingData] =
          await Promise.all([
            getHostListings(hostId),
            getHostBookings(hostId),
          ]);

        setListings(listingData);
        setBookings(bookingData);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteListing(id);

      setListings((current) =>
        current.filter(
          (listing) => listing.id !== id
        )
      );
      toast.showToast("Listing deleted", "success");
    } catch (error) {
      console.error(error);

      toast.showToast(
        error instanceof Error
          ? error.message
          : "Unable to delete listing.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            Host Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your listings and reservations.
          </p>
        </div>

        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 font-semibold text-white hover:bg-[#e31c5f]"
        >
          <Plus className="h-5 w-5" />
          Create new listing
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Listings */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">
          Your listings
        </h2>

        {listings.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed p-10 text-center">
            <p className="font-medium">
              You don't have any listings yet.
            </p>

            <Link
              href="/host/listings/new"
              className="mt-4 inline-block text-[#FF385C] font-semibold"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {listing.photos?.[0]?.url ? (
                    <Image
                      src={listing.photos[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photo
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold">
                    {listing.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {listing.location_city},{" "}
                    {listing.location_country}
                  </p>

                  <p className="mt-3">
                    <span className="font-semibold">
                      ${listing.price_per_night}
                    </span>{" "}
                    night
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {listing.active_bookings ?? 0} active
                    booking
                    {(listing.active_bookings ?? 0) !== 1
                      ? "s"
                      : ""}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/host/listings/${listing.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={
                        deletingId === listing.id
                      }
                      onClick={() =>
                        handleDelete(listing.id)
                      }
                      className="flex items-center justify-center rounded-xl border border-red-200 px-4 text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookings */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">
          Upcoming bookings
        </h2>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No bookings yet.
            </div>
          ) : (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Guest
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Listing
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Dates
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Guests
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4">
                      {booking.guest_name ||
                        `Guest #${booking.guest_id}`}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {booking.listing_title ||
                        `Listing #${booking.listing_id}`}
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(booking.check_in)}
                      {" → "}
                      {formatDate(booking.check_out)}
                    </td>

                    <td className="px-5 py-4">
                      {booking.num_guests}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

export default function HostDashboardPage() {
  return (
    <HostGuard>
      <DashboardContent />
    </HostGuard>
  );
}