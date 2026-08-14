import { Suspense } from "react";
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

// This is the component that uses searchParams
async function ListingsContent({ searchParams }: HomePageProps) {
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

    return (
      <ExploreClient
        initialListings={result.items || []}
        initialTotal={result.total || 0}
      />
    );
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    return (
      <ExploreClient
        initialListings={[]}
        initialTotal={0}
      />
    );
  }
}

// Main page component with Suspense
export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<div>Loading listings...</div>}>
      <ListingsContent searchParams={searchParams} />
    </Suspense>
  );
}