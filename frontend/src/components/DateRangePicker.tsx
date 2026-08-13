"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getAvailability,
  type AvailabilityRange,
} from "@/lib/api";

interface DateRangePickerProps {
  listingId: number;
  onDatesChange: (
    checkIn: string | null,
    checkOut: string | null
  ) => void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a: Date, b: Date) {
  return formatDate(a) === formatDate(b);
}

function monthStart(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function addMonths(date: Date, amount: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1
  );
}

function getDaysInMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
}

function isDateBooked(
  date: Date,
  bookings: AvailabilityRange[]
) {
  const current = startOfDay(date);

  return bookings.some((booking) => {
    const checkIn = startOfDay(
      new Date(`${booking.check_in}T00:00:00`)
    );

    const checkOut = startOfDay(
      new Date(`${booking.check_out}T00:00:00`)
    );

    /*
     * A booking occupies nights from check-in up to,
     * but NOT including, check-out.
     */
    return current >= checkIn && current < checkOut;
  });
}

function isDateBeforeToday(date: Date) {
  return (
    startOfDay(date) <
    startOfDay(new Date())
  );
}

export default function DateRangePicker({
  listingId,
  onDatesChange,
}: DateRangePickerProps) {
  const [bookings, setBookings] = useState<
    AvailabilityRange[]
  >([]);

  const [currentMonth, setCurrentMonth] =
    useState(() => monthStart(new Date()));

  const [checkIn, setCheckIn] =
    useState<Date | null>(null);

  const [checkOut, setCheckOut] =
    useState<Date | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadAvailability() {
      try {
        setLoading(true);

        const result =
          await getAvailability(listingId);

        setBookings(result);
      } catch (error) {
        console.error(
          "Failed to load availability:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [listingId]);

  useEffect(() => {
    onDatesChange(
      checkIn ? formatDate(checkIn) : null,
      checkOut ? formatDate(checkOut) : null
    );
  }, [checkIn, checkOut, onDatesChange]);

  const months = useMemo(
    () => [
      currentMonth,
      addMonths(currentMonth, 1),
    ],
    [currentMonth]
  );

  function selectDate(date: Date) {
    if (
      isDateBeforeToday(date) ||
      isDateBooked(date, bookings)
    ) {
      return;
    }

    // First click = check-in
    if (!checkIn || checkOut) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }

    // Second click before check-in = reset
    if (date <= checkIn) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }

    // Don't allow a range crossing a booked date
    let cursor = new Date(checkIn);

    while (cursor < date) {
      if (isDateBooked(cursor, bookings)) {
        setCheckIn(date);
        setCheckOut(null);
        return;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    setCheckOut(date);
  }

  function isSelected(date: Date) {
    return (
      (checkIn && isSameDay(date, checkIn)) ||
      (checkOut && isSameDay(date, checkOut))
    );
  }

  function isInRange(date: Date) {
    if (!checkIn || !checkOut) return false;

    return date > checkIn && date < checkOut;
  }

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() =>
            setCurrentMonth(
              addMonths(currentMonth, -1)
            )
          }
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <p className="text-sm text-gray-500">
          {loading
            ? "Loading availability..."
            : checkIn
              ? checkOut
                ? "Selected dates"
                : "Select your checkout date"
              : "Select your check-in date"}
        </p>

        <button
          onClick={() =>
            setCurrentMonth(
              addMonths(currentMonth, 1)
            )
          }
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {months.map((month) => (
          <Month
            key={month.toISOString()}
            month={month}
            bookings={bookings}
            checkIn={checkIn}
            checkOut={checkOut}
            isSelected={isSelected}
            isInRange={isInRange}
            onSelect={selectDate}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-gray-500">
        <span>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-black" />
          Selected
        </span>

        <span>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gray-300" />
          Unavailable
        </span>
      </div>
    </div>
  );
}

interface MonthProps {
  month: Date;
  bookings: AvailabilityRange[];
  checkIn: Date | null;
  checkOut: Date | null;
  isSelected: (date: Date) => boolean | null;
  isInRange: (date: Date) => boolean;
  onSelect: (date: Date) => void;
}

function Month({
  month,
  bookings,
  isSelected,
  isInRange,
  onSelect,
}: MonthProps) {
  const days = getDaysInMonth(month);

  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  ).getDay();

  const blanks = Array.from({
    length: firstDay,
  });

  const dayNumbers = Array.from(
    { length: days },
    (_, index) => index + 1
  );

  return (
    <div>
      <h3 className="mb-5 text-center font-semibold">
        {month.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h3>

      <div className="mb-3 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
          (day) => (
            <span key={day}>{day}</span>
          )
        )}
      </div>

      <div className="grid grid-cols-7">
        {blanks.map((_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {dayNumbers.map((day) => {
          const date = new Date(
            month.getFullYear(),
            month.getMonth(),
            day
          );

          const disabled =
            isDateBeforeToday(date) ||
            isDateBooked(date, bookings);

          const selected = isSelected(date);
          const inRange = isInRange(date);

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`
                relative h-11 w-full text-sm
                transition
                ${
                  disabled
                    ? "cursor-not-allowed text-gray-300 line-through"
                    : "text-gray-800 hover:bg-gray-100"
                }
                ${
                  inRange
                    ? "bg-gray-100"
                    : ""
                }
                ${
                  selected
                    ? "z-10 rounded-full bg-black text-white hover:bg-black"
                    : ""
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}