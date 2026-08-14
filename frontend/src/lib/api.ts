// frontend/src/lib/api.ts

import type {
  AvailabilityRange,
  Booking,
  HostBooking,
  HostListing,
  Listing,
  ListingCreate,
  ListingSummary,
  ListingUpdate,
  MyBooking,
  User,
} from "./types";

// ✅ Define missing types here (these didn't exist in types.ts)
export interface BookingCreate {
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
}

export interface PaginatedListings {
  items: ListingSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ✅ Re-export types from ./types that exist there
export type {
  AvailabilityRange,
  Booking,
  HostBooking,
  HostListing,
  Listing,
  ListingCreate,
  ListingSummary,
  ListingUpdate,
  MyBooking,
  User,
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================
// Typed fetch wrapper
// ============================================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = await response.json();

      if (typeof error.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error.detail)) {
        message = error.detail
          .map((item: { msg?: string }) => item.msg || "Validation error")
          .join(", ");
      }
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new Error(message);
  }

  return response.json();
}

// ============================================================
// Listings
// ============================================================

export interface ListingSearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  page?: number;
  page_size?: number;
}

export async function getListings(
  params: ListingSearchParams = {}
): Promise<PaginatedListings> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return apiFetch<PaginatedListings>(
    `/listings${query ? `?${query}` : ""}`
  );
}

export async function getListing(
  id: number | string
): Promise<Listing> {
  return apiFetch<Listing>(`/listings/${id}`);
}

// ============================================================
// Listing Availability
// ============================================================

export async function getAvailability(
  id: number | string
): Promise<AvailabilityRange[]> {
  const result = await apiFetch<{
    listing_id: number;
    blocked_dates: AvailabilityRange[];
  }>(`/listings/${id}/availability`);

  return result.blocked_dates;
}

// ============================================================
// Bookings
// ============================================================

export async function createBooking(
  data: BookingCreate
): Promise<Booking> {
  return apiFetch<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyTrips(
  userId: number
): Promise<MyBooking[]> {
  return apiFetch<MyBooking[]>(
    `/bookings/me?user_id=${userId}`
  );
}

// ============================================================
// Listings CRUD
// ============================================================

export async function createListing(
  data: ListingCreate
): Promise<Listing> {
  return apiFetch<Listing>("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateListing(
  id: number,
  data: ListingUpdate
): Promise<Listing> {
  return apiFetch<Listing>(`/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteListing(
  id: number
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/listings/${id}`,
    {
      method: "DELETE",
    }
  );
}

// ============================================================
// Host
// ============================================================

export async function getHostListings(
  hostId: number
): Promise<HostListing[]> {
  return apiFetch<HostListing[]>(
    `/host/${hostId}/listings`
  );
}

export async function getHostBookings(
  hostId: number
): Promise<HostBooking[]> {
  return apiFetch<HostBooking[]>(
    `/host/${hostId}/bookings`
  );
}

// ============================================================
// Favorites / Wishlist
// ============================================================

export async function toggleFavorite(
  userId: number,
  listingId: number
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    "/favorites",
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        listing_id: listingId,
      }),
    }
  );
}

export async function removeFavorite(
  userId: number,
  listingId: number
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    "/favorites",
    {
      method: "DELETE",
      body: JSON.stringify({
        user_id: userId,
        listing_id: listingId,
      }),
    }
  );
}

export async function getFavorites(
  userId: number
): Promise<ListingSummary[]> {
  return apiFetch<ListingSummary[]>(
    `/favorites/me?user_id=${userId}`
  );
}

// ============================================================
// Mock Authentication
// ============================================================

export async function login(
  email: string
): Promise<User> {
  return apiFetch<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
    }),
  });
}

export async function getMe(
  userId: number
): Promise<User> {
  return apiFetch<User>(
    `/auth/me?user_id=${userId}`
  );
}

export async function becomeHost(
  userId: number
): Promise<{
  message: string;
  user: User;
}> {
  return apiFetch<{
    message: string;
    user: User;
  }>(
    `/auth/become-host?user_id=${userId}`,
    {
      method: "POST",
    }
  );
}