"use client";

import {
  Globe,
  Menu,
  Search,
  UserCircle,
  Moon,
  Sun,
  X,
  MapPin,
  Users,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  becomeHost,
} from "@/lib/api";

import {
  getCurrentUserId,
} from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();

  const searchRef =
    useRef<HTMLDivElement>(null);

  const [dark, setDark] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [location, setLocation] =
    useState("");

  const [guests, setGuests] =
    useState(1);

  const [hostLoading, setHostLoading] =
    useState(false);

  // --------------------------------------------------
  // Load saved dark mode
  // --------------------------------------------------

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "airbnb_dark"
        );

      const isDark =
        saved === "1";

      setDark(isDark);

      document.documentElement.classList.toggle(
        "dark",
        isDark
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  // --------------------------------------------------
  // Close search when clicking outside
  // --------------------------------------------------

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setSearchOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // --------------------------------------------------
  // Dark mode
  // --------------------------------------------------

  function toggleDark() {
    const next = !dark;

    setDark(next);

    document.documentElement.classList.toggle(
      "dark",
      next
    );

    try {
      localStorage.setItem(
        "airbnb_dark",
        next ? "1" : "0"
      );
    } catch {
      // Ignore.
    }
  }

  // --------------------------------------------------
  // Become host
  // --------------------------------------------------

  async function handleBecomeHost() {
    try {
      setHostLoading(true);

      const userId =
        await getCurrentUserId();

      await becomeHost(userId);

      router.push(
        "/host/dashboard"
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to become a host."
      );
    } finally {
      setHostLoading(false);
    }
  }

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  function handleSearch() {
    const params =
      new URLSearchParams();

    if (location.trim()) {
      params.set(
        "location",
        location.trim()
      );
    }

    if (guests > 0) {
      params.set(
        "guests",
        String(guests)
      );
    }

    setSearchOpen(false);

    router.push(
      `/?${params.toString()}`
    );
  }

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-gray-200
        bg-white
        dark:border-gray-700
        dark:bg-gray-900
      "
    >
      <div
        className="
          mx-auto flex h-20 max-w-[1400px]
          items-center justify-between
          px-4 sm:px-6
        "
      >
        {/* Logo */}

        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center"
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-airbnb">
              ∧
            </span>

            <span
              className="
                hidden text-2xl font-bold
                tracking-tight text-airbnb
                md:block
              "
            >
              airbnb
            </span>
          </div>
        </button>

        {/* Search */}

        <div
          ref={searchRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setSearchOpen(
                (current) => !current
              )
            }
            className="
              hidden md:flex
              items-center
              rounded-full
              border
              border-gray-300
              bg-white
              px-5 py-3
              text-sm font-medium
              shadow-sm
              transition
              hover:shadow-md
              dark:border-gray-600
              dark:bg-gray-800
              dark:text-gray-100
            "
          >
            <span>
              {location ||
                "Anywhere"}
            </span>

            <span className="mx-3 h-5 border-l border-gray-300 dark:border-gray-600" />

            <span>
              Any week
            </span>

            <span className="mx-3 h-5 border-l border-gray-300 dark:border-gray-600" />

            <span className="text-gray-500 dark:text-gray-400">
              {guests === 1
                ? "Add guests"
                : `${guests} guests`}
            </span>

            <span className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-airbnb text-white">
              <Search
                size={16}
                strokeWidth={2.5}
              />
            </span>
          </button>

          {/* Search popup */}

          {searchOpen && (
            <div
              className="
                absolute left-1/2 top-16
                z-[100]
                w-[calc(100vw-2rem)]
                max-w-md
                -translate-x-1/2
                rounded-3xl
                border
                border-gray-200
                bg-white
                p-5
                shadow-2xl
                dark:border-gray-700
                dark:bg-gray-800
              "
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold dark:text-white">
                  Search
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setSearchOpen(false)
                  }
                  className="
                    rounded-full p-2
                    hover:bg-gray-100
                    dark:hover:bg-gray-700
                  "
                >
                  <X size={18} />
                </button>
              </div>

              {/* Location */}

              <label
                className="
                  mt-5 block rounded-2xl
                  border border-gray-300
                  p-4
                  dark:border-gray-600
                "
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase dark:text-gray-300">
                  <MapPin size={15} />
                  Location
                </span>

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  placeholder="Where are you going?"
                  className="
                    mt-2 w-full
                    bg-transparent
                    text-sm
                    outline-none
                    dark:text-white
                    dark:placeholder:text-gray-400
                  "
                />
              </label>

              {/* Guests */}

              <label
                className="
                  mt-3 block rounded-2xl
                  border border-gray-300
                  p-4
                  dark:border-gray-600
                "
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase dark:text-gray-300">
                  <Users size={15} />
                  Guests
                </span>

                <select
                  value={guests}
                  onChange={(e) =>
                    setGuests(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="
                    mt-2 w-full
                    bg-transparent
                    text-sm
                    outline-none
                    dark:text-white
                  "
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => i + 1
                  ).map(
                    (number) => (
                      <option
                        key={number}
                        value={number}
                        className="
                          bg-white
                          text-black
                          dark:bg-gray-800
                          dark:text-white
                        "
                      >
                        {number}{" "}
                        {number === 1
                          ? "guest"
                          : "guests"}
                      </option>
                    )
                  )}
                </select>
              </label>

              <button
                type="button"
                onClick={handleSearch}
                className="
                  mt-4 flex w-full
                  items-center justify-center
                  gap-2 rounded-xl
                  bg-[#FF385C]
                  py-3
                  font-semibold
                  text-white
                  hover:bg-[#e31c5f]
                "
              >
                <Search size={18} />
                Search
              </button>
            </div>
          )}
        </div>

        {/* Right navigation */}

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Become host */}

          <button
            type="button"
            disabled={hostLoading}
            onClick={handleBecomeHost}
            className="
              hidden
              rounded-full
              px-4 py-3
              text-sm font-semibold
              transition
              hover:bg-gray-100
              dark:hover:bg-gray-800
              md:block
              disabled:opacity-50
            "
          >
            {hostLoading
              ? "Loading..."
              : "Become a host"}
          </button>

          {/* Globe */}

          <button
            type="button"
            className="
              rounded-full p-3
              transition
              hover:bg-gray-100
              dark:hover:bg-gray-800
            "
            aria-label="Choose language"
          >
            <Globe size={20} />
          </button>

          {/* Dark mode */}

          <button
            type="button"
            onClick={toggleDark}
            className="
              rounded-full p-3
              transition
              hover:bg-gray-100
              dark:hover:bg-gray-800
            "
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {dark ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          {/* Profile */}

          <button
            type="button"
            className="
              flex items-center gap-2
              rounded-full
              border border-gray-300
              p-2 pl-3
              transition
              hover:shadow-md
              dark:border-gray-600
            "
            aria-label="Open profile menu"
          >
            <Menu size={18} />

            <UserCircle
              size={30}
              className="text-gray-500 dark:text-gray-300"
            />
          </button>
        </div>
      </div>

      {/* Mobile search */}

      <div className="px-4 pb-3 md:hidden">
        <button
          type="button"
          onClick={() =>
            setSearchOpen(
              (current) => !current
            )
          }
          className="
            flex w-full
            items-center gap-3
            rounded-full
            border
            border-gray-300
            bg-white
            px-4 py-3
            text-left
            shadow-sm
            dark:border-gray-600
            dark:bg-gray-800
          "
        >
          <Search
            size={18}
            className="text-gray-500"
          />

          <span className="flex-1 text-sm dark:text-gray-200">
            {location ||
              "Where are you going?"}
          </span>

          <span className="text-xs text-gray-500">
            {guests} guest
            {guests !== 1
              ? "s"
              : ""}
          </span>
        </button>
      </div>
    </header>
  );
}