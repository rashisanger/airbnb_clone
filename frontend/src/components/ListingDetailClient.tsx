"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import DateRangePicker from "@/components/DateRangePicker";
import PriceBreakdown from "@/components/PriceBreakdown";

interface ListingDetailClientProps {
  listingId: number;
  pricePerNight: number;
  maxGuests: number;
}

export default function ListingDetailClient({
  listingId,
  pricePerNight,
  maxGuests,
}: ListingDetailClientProps) {
  const router = useRouter();

  const [checkIn, setCheckIn] =
    useState<string | null>(null);

  const [checkOut, setCheckOut] =
    useState<string | null>(null);

  const [guests, setGuests] =
    useState(1);

  const handleDatesChange = useCallback(
    (
      newCheckIn: string | null,
      newCheckOut: string | null
    ) => {
      setCheckIn(newCheckIn);
      setCheckOut(newCheckOut);
    },
    []
  );

  function handleReserve() {
    if (!checkIn || !checkOut) {
      return;
    }

    router.push(
      `/booking/${listingId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      {/* Calendar */}
      <div>
        <h2 className="text-xl font-semibold">
          Select your dates
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Check availability and choose your
          dates
        </p>

        <div className="mt-8 rounded-2xl border p-5 md:p-8">
          <DateRangePicker
            listingId={listingId}
            onDatesChange={
              handleDatesChange
            }
          />
        </div>
      </div>

      {/* Booking card */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <PriceBreakdown
          pricePerNight={pricePerNight}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          maxGuests={maxGuests}
          onGuestsChange={setGuests}
          onReserve={handleReserve}
        />
      </div>
    </div>
  );
}