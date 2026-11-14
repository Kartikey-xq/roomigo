"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Check,
  Wifi,
  UtensilsCrossed,
  ShowerHead,
  Zap,
  Droplet,
  Shirt,
  Sparkles,
  GraduationCap,
  Landmark,
  Bus,
  Users,
  Star,
  Lock,
  Footprints,
  Bike,
  Bookmark,
} from "lucide-react";
import { Listing, AmenityItem, ProximityItem } from "@/types/listing";
import { useAuth } from "./AuthContext";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isSoldOut = listing.totalBedsLeft <= 0;

  // Next/Prev image carousel handlers
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + listing.images.length) % listing.images.length
    );
  };

  // WhatsApp Inquiry Redirection (Requires student authentication)
  const handleBookBed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;

    if (!user) {
      router.push("/login?redirect=/listings");
      return;
    }

    const message = `Hi ${listing.ownerContact.name}, I am inquiring about booking a bed at *${listing.title}* (${listing.address.line}). Could you please share the current availability, pricing, and schedule a visit?`;
    const cleanPhone = listing.ownerContact.whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Helper for Amenity Icons
  const renderAmenityIcon = (iconType: AmenityItem["iconType"]) => {
    const iconClass = "w-4 h-4 text-emerald-700 shrink-0";
    switch (iconType) {
      case "wifi":
        return <Wifi className={iconClass} />;
      case "meals":
        return <UtensilsCrossed className={iconClass} />;
      case "bath":
        return <ShowerHead className={iconClass} />;
      case "power":
        return <Zap className={iconClass} />;
      case "water":
        return <Droplet className={iconClass} />;
      case "laundry":
        return <Shirt className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  // Helper for Proximity Icons
  const renderProximityIcon = (item: ProximityItem) => {
    const iconClass = "w-4 h-4 text-emerald-700 shrink-0";
    if (item.iconType === "education") {
      return <GraduationCap className={iconClass} />;
    }
    if (item.iconType === "college") {
      return <Landmark className={iconClass} />;
    }
    if (item.iconType === "transit") {
      return <Bus className={iconClass} />;
    }
    return <Landmark className={iconClass} />;
  };

  const renderTravelModeIcon = (mode: ProximityItem["travelMode"]) => {
    const modeClass = "w-3 h-3 text-zinc-500 inline-block ml-1";
    if (mode === "walking") {
      return <Footprints className={modeClass} />;
    }
    if (mode === "scooter") {
      return <Bike className={modeClass} />;
    }
    return <Bus className={modeClass} />;
  };

  return (
    <article
      className={`group relative w-full max-w-sm sm:max-w-md mx-auto rounded-3xl bg-white border border-zinc-200/90 transition-all duration-300 flex flex-col overflow-hidden ${
        isSoldOut
          ? "opacity-85 shadow-sm border-zinc-200 select-none cursor-not-allowed"
          : "hover:border-emerald-300/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.09)]"
      }`}
    >
      {/* SOLD OUT WATERMARK OVERLAY (When totalBedsLeft === 0) */}
      {isSoldOut && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[1.5px]">
          <div className="transform -rotate-12 border-4 border-rose-600/90 bg-white/95 text-rose-600 px-6 py-2.5 rounded-2xl shadow-2xl font-black text-2xl sm:text-3xl tracking-widest uppercase flex items-center gap-2">
            <Lock className="w-6 h-6 text-rose-600 stroke-[2.5]" />
            SOLD OUT
          </div>
          <p className="mt-3 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
            No Beds Currently Available
          </p>
        </div>
      )}

      {/* 1:1 Image Carousel Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.images[currentImageIndex] || listing.images[0]}
          alt={listing.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            !isSoldOut ? "group-hover:scale-105" : "grayscale-[25%]"
          }`}
          loading="lazy"
        />

        {/* Top-Left Badges: VERIFIED PG & Beds Left */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col items-start gap-1.5">
          {listing.isVerified && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/80 shadow-xs text-indigo-950 font-bold text-[10px] tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>VERIFIED PG</span>
            </div>
          )}

          {listing.totalBedsLeft > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-semibold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{listing.totalBedsLeft} Beds Left</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold shadow-xs">
              <Lock className="w-3 h-3" />
              <span>Sold Out</span>
            </div>
          )}
        </div>

        {/* Top-Right: Wishlist Heart & Photos Counter */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isSoldOut) setIsWishlisted((prev) => !prev);
            }}
            disabled={isSoldOut}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
              isWishlisted
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-white/90 text-zinc-700 hover:text-rose-600 hover:bg-white"
            } ${isSoldOut ? "cursor-not-allowed opacity-60" : "active:scale-90"}`}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-rose-600 text-rose-600" : ""
              }`}
            />
          </button>

          <div className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-medium shadow-xs">
            {currentImageIndex + 1}/{listing.images.length} Photos
          </div>
        </div>

        {/* Bottom Carousel Controls: Dots Indicator & Prev/Next Arrows */}
        <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between">
          {/* Active Carousel Pill Indicator */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
            {listing.images.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentImageIndex
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Prev & Next Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevImage}
              disabled={isSoldOut}
              aria-label="Previous image"
              className={`w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md transition-all ${
                isSoldOut
                  ? "cursor-not-allowed opacity-50"
                  : "active:scale-90 hover:text-black"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              disabled={isSoldOut}
              aria-label="Next image"
              className={`w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md transition-all ${
                isSoldOut
                  ? "cursor-not-allowed opacity-50"
                  : "active:scale-90 hover:text-black"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Title, Rating & Subtitle */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight leading-snug">
              {listing.title}
            </h2>

            {/* Rating Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-100 text-xs font-semibold text-indigo-950 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.rating.score.toFixed(1)}</span>
              <span className="text-zinc-500 font-normal">
                ({listing.rating.reviewCount})
              </span>
            </div>
          </div>

          {/* Residence & Wing Subtitle */}
          <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-indigo-900 mt-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              {listing.residenceType} • {listing.wingsInfo}
            </span>
          </div>

          {/* Address Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start gap-2 text-xs text-zinc-600">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{listing.address.line}</p>
          </div>
        </div>

        {/* Proximity / Distance Stack */}
        <div className="space-y-1.5">
          {listing.proximity.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/70 flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 text-zinc-800 font-medium">
                {renderProximityIcon(item)}
                <span>
                  <strong className="text-zinc-900">{item.distance}</strong> from{" "}
                  {item.landmark}
                </span>
                {renderTravelModeIcon(item.travelMode)}
              </div>
              <span className="text-[11px] text-zinc-500 font-normal shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </div>

        {/* Bed Configurations Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono">
              Bed Configurations
            </span>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                isSoldOut ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {listing.availabilitySummary}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {listing.bedConfigurations.map((config) => {
              const configAvailable = config.availableBeds > 0 && !isSoldOut;
              return (
                <div
                  key={config.id}
                  className={`p-3 rounded-2xl border transition-colors flex flex-col justify-between ${
                    configAvailable
                      ? "bg-emerald-50/40 border-emerald-100/90"
                      : "bg-zinc-50 border-zinc-200 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-800">
                      {config.name}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        configAvailable ? "bg-emerald-500" : "bg-zinc-300"
                      }`}
                    />
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg font-bold text-indigo-950 font-mono">
                        ₹{config.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-normal">
                        {config.period}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] font-medium mt-0.5 ${
                        configAvailable ? "text-emerald-600" : "text-zinc-400"
                      }`}
                    >
                      {config.statusLabel ||
                        (configAvailable
                          ? `${config.availableBeds} beds left`
                          : "Sold out")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What's Included (Amenities Grid 3x2) */}
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 font-mono block mb-2">
            What&apos;s Included
          </span>

          <div className="grid grid-cols-3 gap-2">
            {listing.amenities.slice(0, 6).map((amenity) => (
              <div
                key={amenity.id}
                className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100/70 flex items-start gap-2"
              >
                {renderAmenityIcon(amenity.iconType)}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-800 truncate leading-tight">
                    {amenity.title}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">
                    {amenity.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary & WhatsApp Book Bed CTA */}
        <div className="pt-2 border-t border-zinc-100 mt-2 space-y-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-zinc-900 tracking-tight font-mono">
                ₹{listing.pricingSummary.minPrice.toLocaleString("en-IN")}
                {listing.pricingSummary.maxPrice
                  ? ` – ₹${listing.pricingSummary.maxPrice.toLocaleString("en-IN")}`
                  : ""}
              </span>
              <span className="text-sm font-normal text-zinc-500">
                {listing.pricingSummary.period}
              </span>
            </div>

            <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {listing.pricingSummary.inclusionsNote}
            </p>
          </div>

          {/* CTA Action Button */}
          <button
            type="button"
            onClick={handleBookBed}
            disabled={isSoldOut}
            aria-label={
              isSoldOut
                ? "No beds available"
                : `Book Bed at ${listing.title} via WhatsApp`
            }
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
              isSoldOut
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed border-0 shadow-none"
                : "bg-[#1e1b4b] hover:bg-[#2a2468] text-white shadow-indigo-950/20 active:scale-[0.98] cursor-pointer"
            }`}
          >
            {isSoldOut ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Sold Out</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 fill-white" />
                <span>Book Bed</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
