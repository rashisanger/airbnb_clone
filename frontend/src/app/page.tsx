import ExploreClient from "@/components/ExploreClient";
import { getListings } from "@/lib/api";

interface HomePageProps {
  searchParams: {
    location?: string;
    check_in?: string;
    check_out?: string;
    guests?: string;
    min_price?: string;
    max_price?: string;
    property_type?: string;
  };
}

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const result = await getListings({
    location: searchParams.location,

    check_in: searchParams.check_in,

    check_out: searchParams.check_out,

    guests: searchParams.guests
      ? Number(searchParams.guests)
      : undefined,

    min_price: searchParams.min_price
      ? Number(searchParams.min_price)
      : undefined,

    max_price: searchParams.max_price
      ? Number(searchParams.max_price)
      : undefined,

    property_type:
      searchParams.property_type,

    page: 1,

    page_size: 12,
  });

  /*
   * Server/Client boundary:
   *
   * page.tsx is a Server Component because it performs
   * the initial listings request without needing browser
   * state or event handlers.
   *
   * SearchBar, FilterBar and ListingCard are Client
   * Components because they need clicks, URL updates,
   * popovers, favorites and other browser interactions.
   */
  return (
    <ExploreClient
      initialListings={result.items}
      initialTotal={result.total}
    />
  );
}