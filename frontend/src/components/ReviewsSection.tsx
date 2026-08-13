"use client";

import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export default function ReviewsSection({
  rating,
  reviewCount,
  reviews,
}: ReviewsSectionProps) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (ratingValue) => {
      const count = reviews.filter(
        (review) =>
          review.rating === ratingValue
      ).length;

      const percentage =
        reviewCount > 0
          ? (count / reviewCount) * 100
          : 0;

      return {
        ratingValue,
        count,
        percentage,
      };
    }
  );

  return (
    <section className="border-t py-10">
      <div className="flex items-center gap-2">
        <Star
          size={22}
          fill="currentColor"
        />

        <h2 className="text-xl font-semibold">
          {rating.toFixed(2)} ·{" "}
          {reviewCount}{" "}
          {reviewCount === 1
            ? "review"
            : "reviews"}
        </h2>
      </div>

      {/* Rating breakdown */}
      <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <p className="text-5xl font-semibold">
            {rating.toFixed(1)}
          </p>

          <div className="mt-3 flex">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <Star
                  key={index}
                  size={18}
                  fill={
                    index < Math.round(rating)
                      ? "currentColor"
                      : "none"
                  }
                />
              )
            )}
          </div>
        </div>

        <div className="space-y-3">
          {ratingDistribution.map(
            (item) => (
              <div
                key={item.ratingValue}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-3">
                  {item.ratingValue}
                </span>

                <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="w-6 text-right text-gray-500">
                  {item.count}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id}>
              <div className="flex items-center gap-3">
                {review.guest?.avatar_url ? (
                  <img
                    src={review.guest.avatar_url}
                    alt={review.guest.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 font-semibold">
                    {review.guest?.name
                      ?.charAt(0)
                      .toUpperCase() || "G"}
                  </div>
                )}

                <div>
                  <p className="font-semibold">
                    {review.guest?.name ||
                      "Guest"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      review.created_at
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill={
                      index < review.rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>

              <p className="mt-3 leading-6 text-gray-700">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <p className="mt-8 text-gray-500">
          No reviews yet.
        </p>
      )}
    </section>
  );
}