"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/types/listing";

export default function ListingsPage() {
  const [filter, setFilter] = useState<"all" | "available" | "soldout">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({ available: 0, soldout: 0, total: 0 });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch listings from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter,
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
    });

    fetch(`/api/listings?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setListings(data.data);
          setPagination(data.pagination);
          setCounts(data.counts);
        }
      })
      .catch((err) => console.error("Error loading listings:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, filter, debouncedSearch]);

  const handleFilterChange = (newFilter: "all" | "available" | "soldout") => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 border border-emerald-100 p-6 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold w-fit">
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Student Housing &amp; Co-Living</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 font-sans">
            Student PGs &amp; Co-Living Spaces
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
            Browse verified listings, check live bed configurations, and book
            directly with property managers on WhatsApp.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-emerald-100 text-xs text-zinc-700 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Clement Town, Dehradun</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-emerald-100 text-xs text-zinc-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Near GEHU &amp; GEU Campus</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-emerald-100 text-xs text-zinc-700 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Verified Amenities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === "all"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All Listings ({counts.total})
          </button>
          <button
            onClick={() => handleFilterChange("available")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === "available"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Beds Available ({counts.available})
          </button>
          <button
            onClick={() => handleFilterChange("soldout")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === "soldout"
                ? "bg-white text-rose-800 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Sold Out ({counts.soldout})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college, area, or PG..."
            className="w-full bg-zinc-50 border border-zinc-200/90 rounded-xl px-3.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Inquiry Banner Tip */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-emerald-950">
              Live WhatsApp Booking Connected
            </p>
            <p className="text-[11px] text-emerald-800/80">
              Click &quot;Book Bed&quot; on any available card to initiate inquiry with pre-filled room details.
            </p>
          </div>
        </div>
        <span className="hidden md:inline-flex text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
          wa.me API Ready
        </span>
      </div>

      {/* Loading Indicator or Listings Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">Fetching verified residences from database...</p>
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-zinc-200/80 shadow-2xs">
              <p className="text-xs text-zinc-500 font-medium">
                Showing <span className="font-bold text-zinc-800">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-bold text-zinc-800">
                  {Math.min(page * limit, pagination.totalCount)}
                </span>{" "}
                of <span className="font-bold text-zinc-800">{pagination.totalCount}</span> verified residences
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold font-mono border border-emerald-200">
                  Page {page} of {pagination.totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200/80 p-8 space-y-3">
          <p className="text-base font-semibold text-zinc-800">
            No listings matched your filter
          </p>
          <p className="text-xs text-zinc-500">
            Try resetting your search query or selecting &quot;All Listings&quot;.
          </p>
          <button
            onClick={() => {
              setFilter("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
