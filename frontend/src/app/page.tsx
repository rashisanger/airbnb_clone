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
  // Debug: Log the environment
  console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
  console.log("🔍 NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  console.log("🔍 Search Params:", searchParams);

  try {
    const result = await getListings({
      location: searchParams.location,
      check_in: searchParams.check_in,
      check_out: searchParams.check_out,
      guests: searchParams.guests ? Number(searchParams.guests) : undefined,
      min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
      max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
      property_type: searchParams.property_type,
      page: 1,
      page_size: 12,
    });

    console.log("✅ Listings fetched:", result.items?.length || 0, "listings");

    return (
      <ExploreClient
        initialListings={result.items}
        initialTotal={result.total}
      />
    );
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    // Return empty state on error
    return (
      <ExploreClient
        initialListings={[]}
        initialTotal={0}
      />
    );
  }
}