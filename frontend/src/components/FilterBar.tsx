"use client";

import {
  Building2,
  Castle,
  Flame,
  Filter,
  Home,
  Mountain,
  Palmtree,
  Sparkles,
  Waves,
  X,
} from "lucide-react";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = [
  { name: "Trending", icon: Flame },
  { name: "Beachfront", icon: Waves },
  { name: "Cabins", icon: Mountain },
  { name: "Amazing views", icon: Sparkles },
  { name: "Tropical", icon: Palmtree },
  { name: "Castles", icon: Castle },
  { name: "Homes", icon: Home },
  { name: "Apartments", icon: Building2 },
];

const propertyTypes = [
  "Apartment",
  "House",
  "Villa",
  "Cabin",
  "Hotel",
];

const amenities = [
  "Wifi",
  "Kitchen",
  "Free parking",
  "Pool",
  "Air conditioning",
  "Washer",
  "TV",
  "Dedicated workspace",
  "Hot tub",
  "Fireplace",
];

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(
    Number(searchParams.get("min_price") || 40)
  );

  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("max_price") || 400)
  );

  const [selectedTypes, setSelectedTypes] =
    useState<string[]>(
      searchParams.get("property_type")
        ? [searchParams.get("property_type")!]
        : []
    );

  const [selectedAmenities, setSelectedAmenities] =
    useState<string[]>([]);

  function toggleValue(
    value: string,
    values: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    if (values.includes(value)) {
      setter(values.filter((item) => item !== value));
    } else {
      setter([...values, value]);
    }
  }

  function applyFilters() {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.delete("page");

    params.set("min_price", String(minPrice));
    params.set("max_price", String(maxPrice));

    if (selectedTypes.length > 0) {
      params.set(
        "property_type",
        selectedTypes[0]
      );
    } else {
      params.delete("property_type");
    }

    // The current backend accepts property_type and price
    // filters. Amenity filtering can be added to the API later.
    if (selectedAmenities.length > 0) {
      params.set(
        "amenities",
        selectedAmenities.join(",")
      );
    } else {
      params.delete("amenities");
    }

    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <>
      <div className="mt-6 flex items-center gap-5">
        {/* Categories */}
        <div className="flex min-w-0 flex-1 gap-7 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.name}
                className="flex min-w-fit flex-col items-center gap-2 border-b-2 border-transparent pb-2 text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
              >
                <Icon size={23} strokeWidth={1.6} />

                <span className="whitespace-nowrap text-xs font-medium">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:shadow-md"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>


      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex items-center justify-between border-b pb-5">
              <h2 className="text-xl font-semibold">
                Filters
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>


            {/* Price */}
            <section className="border-b py-6">
              <h3 className="font-semibold">
                Price range
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Nightly prices
              </p>

              <div className="mt-6 flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">
                    Minimum
                  </label>

                  <input
                    type="number"
                    min={40}
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-xs text-gray-500">
                    Maximum
                  </label>

                  <input
                    type="number"
                    min={minPrice}
                    max={400}
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>

              <input
                type="range"
                min="40"
                max="400"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    Number(e.target.value)
                  )
                }
                className="mt-5 w-full accent-airbnb"
              />
            </section>


            {/* Property type */}
            <section className="border-b py-6">
              <h3 className="mb-4 font-semibold">
                Property type
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {propertyTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() =>
                        toggleValue(
                          type,
                          selectedTypes,
                          setSelectedTypes
                        )
                      }
                      className="h-5 w-5 accent-airbnb"
                    />

                    {type}
                  </label>
                ))}
              </div>
            </section>


            {/* Amenities */}
            <section className="py-6">
              <h3 className="mb-4 font-semibold">
                Amenities
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(
                        amenity
                      )}
                      onChange={() =>
                        toggleValue(
                          amenity,
                          selectedAmenities,
                          setSelectedAmenities
                        )
                      }
                      className="h-5 w-5 accent-airbnb"
                    />

                    {amenity}
                  </label>
                ))}
              </div>
            </section>


            <div className="flex justify-end border-t pt-5">
              <button
                onClick={applyFilters}
                className="rounded-xl bg-airbnb px-6 py-3 font-semibold text-white hover:bg-[#e31c5f]"
              >
                Show listings
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}