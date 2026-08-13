"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import ListingForm from "@/components/ListingForm";

import {
  createListing,
  getMe,
} from "@/lib/api";

import { getCurrentUserId } from "@/lib/auth";

export default function CreateListingPage() {
  const router = useRouter();

  const [hostId, setHostId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadHost() {
      try {
        setLoading(true);
        setError("");

        const userId =
          await getCurrentUserId();

        const user =
          await getMe(userId);

        if (user.role !== "host") {
          throw new Error(
            "You must become a host before creating a listing."
          );
        }

        setHostId(user.id);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load host account."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHost();
  }, []);

  async function handleSubmit(
    data: any
  ) {
    const created =
      await createListing(data);

    router.push(
      `/listings/${created.id}`
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading host account...
        </div>
      </main>
    );
  }

  if (error || !hostId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/host/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="rounded-2xl bg-red-50 p-6 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <h1 className="text-xl font-semibold">
            Unable to create listing
          </h1>

          <p className="mt-2">
            {error ||
              "Host account not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/host/dashboard"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Create a new listing
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Add your property details and make it available for guests.
        </p>
      </div>

      <ListingForm
        mode="create"
        hostId={hostId}
        onSubmit={handleSubmit}
      />
    </main>
  );
}