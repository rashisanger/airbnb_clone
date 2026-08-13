"use client";

import Link from "next/link";
import {
  Heart,
  Star,
} from "lucide-react";

import { ListingSummary } from "@/lib/types";

interface ListingCardProps {
  listing: ListingSummary;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function ListingCard({
  listing,
  isFavorite = false,
  onToggleFavorite,
}: ListingCardProps) {
  const image =
    listing.cover_photo ||
    listing.photos?.[0]?.url ||
    null;

  return (
    <div className="group relative">
      <Link
        href={`/listings/${listing.id}`}
        className="block"
      >
        {/* Image */}

        <div
          className="
            relative aspect-square
            overflow-hidden rounded-xl
            bg-gray-200
            dark:bg-gray-800
          "
        >
          {image ? (
            <img
              src={image}
              alt={listing.title}
              className="
                h-full w-full
                object-cover
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex h-full
                items-center justify-center
                text-gray-400
              "
            >
              No image
            </div>
          )}
        </div>

        {/* Information */}

        <div className="mt-3">
          <h3
            className="
              font-medium
              text-[#222]
              dark:text-gray-100
            "
          >
            {listing.location_city},{" "}
            {listing.location_country}
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {listing.title}
          </p>

          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm dark:text-gray-200">
              <span className="font-semibold">
                ${listing.price_per_night}
              </span>{" "}
              night
            </p>

            <div className="flex items-center gap-1 text-sm dark:text-gray-200">
              <Star className="h-3.5 w-3.5 fill-current" />

              {listing.average_rating
                ? listing.average_rating.toFixed(
                    1
                  )
                : "New"}
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite */}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          onToggleFavorite?.();
        }}
        className="
          absolute right-3 top-3
          z-10 rounded-full
          p-1 text-white
          transition
          hover:scale-110
        "
        aria-label="Toggle favorite"
      >
        <Heart
          className={`h-6 w-6 ${
            isFavorite
              ? "fill-[#FF385C] text-[#FF385C]"
              : "fill-black/30"
          }`}
        />
      </button>
    </div>
  );
}