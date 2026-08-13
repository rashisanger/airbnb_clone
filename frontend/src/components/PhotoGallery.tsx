"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import type { Photo } from "@/lib/types";

interface PhotoGalleryProps {
  photos: Photo[];
  title: string;
}

export default function PhotoGallery({
  photos,
  title,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center rounded-2xl bg-gray-200 text-gray-500">
        No photos available
      </div>
    );
  }

  const displayPhotos = photos.slice(0, 5);

  function nextPhoto() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      (selectedIndex + 1) % photos.length
    );
  }

  function previousPhoto() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      (selectedIndex - 1 + photos.length) %
        photos.length
    );
  }

  return (
    <>
      {/* Desktop Airbnb-style gallery */}
      <div className="grid aspect-[2/1] grid-cols-2 gap-2 overflow-hidden rounded-2xl md:grid-cols-4">
        {/* Main image */}
        <button
          onClick={() => setSelectedIndex(0)}
          className="relative col-span-2 row-span-2 overflow-hidden"
        >
          <img
            src={displayPhotos[0].url}
            alt={title}
            className="h-full w-full object-cover transition duration-300 hover:brightness-90"
          />
        </button>

        {/* Four smaller images */}
        {displayPhotos.slice(1, 5).map(
          (photo, index) => (
            <button
              key={photo.id}
              onClick={() =>
                setSelectedIndex(index + 1)
              }
              className="relative hidden overflow-hidden md:block"
            >
              <img
                src={photo.url}
                alt={`${title} ${index + 2}`}
                className="h-full w-full object-cover transition duration-300 hover:brightness-90"
              />

              {/* Show all photos on final image */}
              {index === 3 &&
                photos.length > 5 && (
                  <span className="absolute bottom-4 right-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-md">
                    Show all photos
                  </span>
                )}
            </button>
          )
        )}
      </div>

      {/* Mobile gallery */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:hidden">
        <img
          src={photos[0].url}
          alt={title}
          className="h-full w-full object-cover"
        />

        <button
          onClick={() => setSelectedIndex(0)}
          className="absolute bottom-4 right-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow"
        >
          Show all photos
        </button>
      </div>

      {/* Fullscreen modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black">
          {/* Close */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute right-5 top-5 z-20 rounded-full p-3 text-white hover:bg-white/20"
          >
            <X size={28} />
          </button>

          {/* Counter */}
          <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2 text-sm text-white">
            {selectedIndex + 1} / {photos.length}
          </div>

          {/* Image */}
          <div className="flex h-full items-center justify-center p-6 md:p-16">
            <img
              src={photos[selectedIndex].url}
              alt={`${title} ${selectedIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Previous */}
          <button
            onClick={previousPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 p-3 text-white hover:bg-white/20 md:left-8"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next */}
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 p-3 text-white hover:bg-white/20 md:right-8"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </>
  );
}