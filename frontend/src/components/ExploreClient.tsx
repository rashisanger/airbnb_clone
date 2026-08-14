// frontend/src/components/ExploreClient.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getListings, toggleFavorite, type PaginatedListings } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import type {
  ListingSearchParams,
} from "@/lib/api";
import type { ListingSummary } from "@/lib/types";

import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import ListingCard from "@/components/ListingCard";
import { useToast } from "@/components/Toast";

interface ExploreClientProps {
  initialListings: ListingSummary[];
  initialTotal: number;
}

export default function ExploreClient({
  initialListings,
  initialTotal,
}: ExploreClientProps) {
  const searchParams = useSearchParams();

  const [listings, setListings] =
    useState<ListingSummary[]>(initialListings);

  const [total, setTotal] =
    useState(initialTotal);

  const [page, setPage] = useState(1);

  const [loading, setLoading] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const toast = useToast();

  /*
   * SearchBar and FilterBar modify the URL.
   *
   * Because these are Client Components, this component
   * observes the new URL and fetches fresh listings.
   *
   * The initial page itself remains a Server Component,
   * giving us a fast initial render.
   */
  useEffect(() => {
    const params: ListingSearchParams = {
      location:
        searchParams.get("location") || undefined,

      check_in:
        searchParams.get("check_in") || undefined,

      check_out:
        searchParams.get("check_out") || undefined,

      guests: searchParams.get("guests")
        ? Number(searchParams.get("guests"))
        : undefined,

      min_price: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,

      max_price: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,

      property_type:
        searchParams.get("property_type") ||
        undefined,

      page: 1,

      page_size: 12,
    };

    // If there are no search params AND we already have listings, use the server data
    if (searchParams.toString() === "" && initialListings.length > 0) {
      setListings(initialListings);
      setTotal(initialTotal);
      setPage(1);
      return;
    }

    // If there are no search params AND no initial listings, fetch from API
    async function fetchListings() {
      try {
        setLoading(true);
        setError(null);

        const result = await getListings(params);

        setListings(result.items);
        setTotal(result.total);
        setPage(1);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load listings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [
    searchParams,
    initialListings,
    initialTotal,
  ]);

  async function loadMore() {
    const nextPage = page + 1;

    const params: ListingSearchParams = {
      location:
        searchParams.get("location") || undefined,

      check_in:
        searchParams.get("check_in") || undefined,

      check_out:
        searchParams.get("check_out") || undefined,

      guests: searchParams.get("guests")
        ? Number(searchParams.get("guests"))
        : undefined,

      min_price: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,

      max_price: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,

      property_type:
        searchParams.get("property_type") ||
        undefined,

      page: nextPage,

      page_size: 12,
    };

    try {
      setLoadingMore(true);

      const result = await getListings(params);

      setListings((previous) => [
        ...previous,
        ...result.items,
      ]);

      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = listings.length < total;

  return (
    <main className="mx-auto max-w-[1600px] px-5 pb-16 md:px-8">

      <SearchBar />

      <FilterBar />

      {/* Results */}
      <section className="mt-8">

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium">
              {error}
            </p>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorite={false}
                  onToggleFavorite={async () => {
                    try {
                      const userId = await getCurrentUserId();
                      await toggleFavorite(userId, listing.id);
                      toast.showToast("Updated favorites", "success");
                    } catch (err) {
                      console.error(err);
                      toast.showToast(
                        err instanceof Error ? err.message : "Unable to update favorites",
                        "error"
                      );
                    }
                  }}
                />
              ))}
            </div>

            {/* Load More pagination */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl bg-airbnb px-7 py-3 font-semibold text-white transition hover:bg-[#e31c5f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingMore
                    ? "Loading..."
                    : "Load more"}
                </button>
              </div>
            )}
          </>
        )}

      </section>

    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse"
          >
            <div className="aspect-square rounded-2xl bg-gray-200" />

            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <h2 className="text-xl font-semibold">
        No listings match your search.
      </h2>

      <p className="mt-2 text-gray-500">
        Try changing your dates, location, or filters.
      </p>
    </div>
  );
}