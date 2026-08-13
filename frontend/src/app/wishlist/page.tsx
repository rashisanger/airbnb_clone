"use client";

import React, { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { getCurrentUserId } from "@/lib/auth";
import ListingCard from "@/components/ListingCard";

export default function WishlistPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        (async () => {
            try {
                const userId = await getCurrentUserId();
                const favs = await getFavorites(userId);
                setListings(favs || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleToggleFavorite(listingId: number) {
        try {
            const userId = await getCurrentUserId();
            await removeFavorite(userId, listingId);
            setListings((s) => s.filter((l) => l.id !== listingId));
            toast.showToast("Removed from favorites", "info");
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="animate-pulse">
                    <div className="h-6 w-48 rounded bg-gray-200" />
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-56 rounded-2xl bg-gray-200" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (listings.length === 0) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">No favorites yet</h2>
                        <p className="mt-2 text-gray-500">Browse listings and add to your wishlist.</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <h1 className="text-2xl font-semibold">Wishlist</h1>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((l) => (
                    <ListingCard key={l.id} listing={l} isFavorite={true} onToggleFavorite={() => handleToggleFavorite(l.id)} />
                ))}
            </div>
        </main>
    );
}
