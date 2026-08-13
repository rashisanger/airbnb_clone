export interface User {
  id: number;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface HostSummary {
  id: number;
  name: string;
  avatar_url?: string | null;
}

export interface Photo {
  id: number;
  url: string;
  sort_order: number;
}

export interface Amenity {
  id: number;
  name: string;
}

export interface Review {
  id: number;
  guest_id: number;
  rating: number;
  comment: string;
  created_at: string;

  // Optional because your current backend
  // does not return guest information.
  guest?: User;
}

export interface ListingSummary {
  id: number;
  title: string;
  property_type: string;
  price_per_night: number;
  location_city: string;
  location_country: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  cover_photo?: string | null;
  photos?: Photo[];
  average_rating: number;
  review_count: number;
}

export interface Listing {
  id: number;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  price_per_night: number;

  location_city: string;
  location_country: string;

  latitude?: number | null;
  longitude?: number | null;

  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;

  created_at: string;
  updated_at: string;

  photos: Photo[];
  amenities: Amenity[];

  host: HostSummary;

  average_rating: number;
  review_count: number;
  reviews: Review[];
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
  status: string;
  created_at: string;
}
export interface AvailabilityRange {
  check_in: string;
  check_out: string;
}
export interface ListingCreate {
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  price_per_night: number;
  location_city: string;
  location_country: string;
  latitude?: number | null;
  longitude?: number | null;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities?: number[];
  photos?: {
    url: string;
    sort_order: number;
  }[];
}

export interface ListingUpdate {
  title?: string;
  description?: string;
  property_type?: string;
  price_per_night?: number;
  location_city?: string;
  location_country?: string;
  latitude?: number | null;
  longitude?: number | null;
  max_guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: number[];
  photos?: {
    url: string;
    sort_order: number;
  }[];
}

export interface HostListing {
  id: number;
  host_id: number;
  title: string;
  price_per_night: number;
  location_city: string;
  location_country: string;
  photos?: Photo[];
  active_bookings?: number;
}

export interface HostBooking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
  status: string;
  created_at: string;
  listing_title?: string;
  guest_name?: string;
}