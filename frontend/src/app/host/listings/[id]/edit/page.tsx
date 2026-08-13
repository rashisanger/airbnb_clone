"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import HostGuard from "@/components/host/HostGuard";
import ListingForm from "@/components/host/ListingForm";
import { useToast } from "@/components/Toast";
import {
  getListing,
  updateListing,
} from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import type { Listing } from "@/lib/types";

function EditListingContent() {
  const params = useParams();
  const router = useRouter();

  const listingId = Number(params.id);

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [hostId, setHostId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [listingData, userId] =
          await Promise.all([
            getListing(listingId),
            getCurrentUserId(),
          ]);

        setListing(listingData);
        setHostId(userId);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [listingId]);

  async function handleUpdate(data: any) {
    await updateListing(
      listingId,
      data
    );

    toast.showToast("Listing updated", "success");

    router.push("/host/dashboard");
  }

  if (loading || !listing || !hostId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">
        Edit your listing
      </h1>

      <p className="mt-2 text-gray-500">
        Update your listing details.
      </p>

      <div className="mt-8">
        <ListingForm
          mode="edit"
          listing={listing}
          hostId={hostId}
          onSubmit={handleUpdate}
        />
      </div>
    </main>
  );
}

export default function EditListingPage() {
  return (
    <HostGuard>
      <EditListingContent />
    </HostGuard>
  );
}