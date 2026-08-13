"use client";

import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ActiveField = "location" | "check_in" | "check_out" | "guests" | null;

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeField, setActiveField] = useState<ActiveField>(null);

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [checkIn, setCheckIn] = useState(
    searchParams.get("check_in") || ""
  );

  const [checkOut, setCheckOut] = useState(
    searchParams.get("check_out") || ""
  );

  const [guests, setGuests] = useState(
    searchParams.get("guests") || ""
  );

  useEffect(() => {
    setLocation(searchParams.get("location") || "");
    setCheckIn(searchParams.get("check_in") || "");
    setCheckOut(searchParams.get("check_out") || "");
    setGuests(searchParams.get("guests") || "");
  }, [searchParams]);

  function updateSearch() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");

    if (location) {
      params.set("location", location);
    } else {
      params.delete("location");
    }

    if (checkIn) {
      params.set("check_in", checkIn);
    } else {
      params.delete("check_in");
    }

    if (checkOut) {
      params.set("check_out", checkOut);
    } else {
      params.delete("check_out");
    }

    if (guests) {
      params.set("guests", guests);
    } else {
      params.delete("guests");
    }

    router.push(`${pathname}?${params.toString()}`);
    setActiveField(null);
  }

  return (
    <div className="relative z-30 mx-auto mt-4 w-full max-w-4xl">
      <div className="flex flex-col rounded-3xl border border-gray-300 bg-white shadow-md md:flex-row md:items-center md:rounded-full">

        {/* Location */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() =>
              setActiveField(
                activeField === "location" ? null : "location"
              )
            }
            className="flex w-full items-center gap-3 rounded-full px-6 py-4 text-left hover:bg-gray-100"
          >
            <MapPin size={18} />

            <div>
              <p className="text-xs font-semibold">
                Location
              </p>

              <p className="text-sm text-gray-500">
                {location || "Where are you going?"}
              </p>
            </div>
          </button>

          {activeField === "location" && (
            <div className="absolute left-0 top-[72px] w-full rounded-3xl border bg-white p-5 shadow-xl">
              <p className="mb-2 text-sm font-semibold">
                Search destinations
              </p>

              <input
                autoFocus
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-airbnb"
              />
            </div>
          )}
        </div>


        {/* Check in */}
        <div className="relative flex-1 border-t border-gray-200 md:border-l md:border-t-0">
          <button
            type="button"
            onClick={() =>
              setActiveField(
                activeField === "check_in" ? null : "check_in"
              )
            }
            className="flex w-full items-center gap-3 rounded-full px-6 py-4 text-left hover:bg-gray-100"
          >
            <CalendarDays size={18} />

            <div>
              <p className="text-xs font-semibold">
                Check-in
              </p>

              <p className="text-sm text-gray-500">
                {checkIn || "Add dates"}
              </p>
            </div>
          </button>

          {activeField === "check_in" && (
            <div className="absolute left-0 top-[72px] rounded-3xl border bg-white p-5 shadow-xl">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setActiveField(null);
                }}
                className="rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>
          )}
        </div>


        {/* Check out */}
        <div className="relative flex-1 border-t border-gray-200 md:border-l md:border-t-0">
          <button
            type="button"
            onClick={() =>
              setActiveField(
                activeField === "check_out" ? null : "check_out"
              )
            }
            className="flex w-full items-center gap-3 rounded-full px-6 py-4 text-left hover:bg-gray-100"
          >
            <CalendarDays size={18} />

            <div>
              <p className="text-xs font-semibold">
                Check-out
              </p>

              <p className="text-sm text-gray-500">
                {checkOut || "Add dates"}
              </p>
            </div>
          </button>

          {activeField === "check_out" && (
            <div className="absolute left-0 top-[72px] rounded-3xl border bg-white p-5 shadow-xl">
              <input
                type="date"
                min={checkIn || undefined}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setActiveField(null);
                }}
                className="rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>
          )}
        </div>


        {/* Guests */}
        <div className="relative flex-1 border-t border-gray-200 md:border-l md:border-t-0">
          <button
            type="button"
            onClick={() =>
              setActiveField(
                activeField === "guests" ? null : "guests"
              )
            }
            className="flex w-full items-center gap-3 rounded-full px-6 py-4 text-left hover:bg-gray-100"
          >
            <Users size={18} />

            <div>
              <p className="text-xs font-semibold">
                Guests
              </p>

              <p className="text-sm text-gray-500">
                {guests
                  ? `${guests} guests`
                  : "Add guests"}
              </p>
            </div>
          </button>

          {activeField === "guests" && (
            <div className="absolute right-0 top-[72px] rounded-3xl border bg-white p-5 shadow-xl">
              <p className="mb-3 text-sm font-semibold">
                Number of guests
              </p>

              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) =>
                  setGuests(e.target.value)
                }
                className="w-28 rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>
          )}
        </div>


        {/* Search button */}
        <button
          type="button"
          onClick={updateSearch}
          className="m-2 flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-airbnb text-white transition hover:scale-105 hover:bg-[#e31c5f] md:self-auto"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </div>
    </div>
  );
}