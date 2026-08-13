"use client";

import { Minus, Plus } from "lucide-react";

interface PriceBreakdownProps {
  pricePerNight: number;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  maxGuests: number;
  onGuestsChange: (guests: number) => void;
  onReserve: () => void;
}

function calculateNights(
  checkIn: string,
  checkOut: string
) {
  const start = new Date(
    `${checkIn}T00:00:00`
  );

  const end = new Date(
    `${checkOut}T00:00:00`
  );

  return Math.ceil(
    (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default function PriceBreakdown({
  pricePerNight,
  checkIn,
  checkOut,
  guests,
  maxGuests,
  onGuestsChange,
  onReserve,
}: PriceBreakdownProps) {
  const nights =
    checkIn && checkOut
      ? calculateNights(checkIn, checkOut)
      : 0;

  const accommodation =
    pricePerNight * nights;

  const cleaningFee = nights > 0 ? 50 : 0;

  const serviceFee =
    nights > 0
      ? Math.round(
          accommodation * 0.1
        )
      : 0;

  const total =
    accommodation +
    cleaningFee +
    serviceFee;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
      {/* Guest selector */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold">
            Guests
          </p>

          <p className="text-sm text-gray-500">
            {guests}{" "}
            {guests === 1 ? "guest" : "guests"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={guests <= 1}
            onClick={() =>
              onGuestsChange(
                Math.max(1, guests - 1)
              )
            }
            className="rounded-full border p-2 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={15} />
          </button>

          <span className="w-4 text-center">
            {guests}
          </span>

          <button
            disabled={guests >= maxGuests}
            onClick={() =>
              onGuestsChange(
                Math.min(
                  maxGuests,
                  guests + 1
                )
              )
            }
            className="rounded-full border p-2 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {!checkIn || !checkOut ? (
        <p className="mb-5 text-sm text-gray-500">
          Select your dates to see the total
          price.
        </p>
      ) : (
        <>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="underline">
                ${pricePerNight} × {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </span>

              <span>
                ${accommodation}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="underline">
                Cleaning fee
              </span>

              <span>
                ${cleaningFee}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="underline">
                Service fee
              </span>

              <span>
                ${serviceFee}
              </span>
            </div>
          </div>

          <div className="my-5 border-t" />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total}</span>
          </div>

          <button
            onClick={onReserve}
            className="mt-6 w-full rounded-xl bg-airbnb py-4 font-semibold text-white transition hover:bg-[#e31c5f]"
          >
            Reserve
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            You won't be charged yet
          </p>
        </>
      )}
    </div>
  );
}