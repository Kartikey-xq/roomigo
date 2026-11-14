import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "6", 10)));
    const filter = searchParams.get("filter") || "all";
    const q = searchParams.get("q")?.trim() || "";
    const campus = searchParams.get("campus");
    const maxPrice = searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!, 10)
      : undefined;

    const where: Prisma.ListingWhereInput = {
      isPublished: true,
    };

    // Filter by availability
    if (filter === "available") {
      where.totalBedsLeft = { gt: 0 };
    } else if (filter === "soldout") {
      where.totalBedsLeft = { lte: 0 };
    }

    // Filter by price
    if (maxPrice) {
      where.minPrice = { lte: maxPrice };
    }

    // Filter by search query
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { addressLine: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        {
          proximities: {
            some: {
              customName: { contains: q, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // Filter by campus
    if (campus) {
      where.proximities = {
        some: {
          landmark:
            campus === "GEHU"
              ? "GEHU_CAMPUS"
              : "GEU_MAIN_CAMPUS",
        },
      };
    }

    const [totalCount, availableCount, soldOutCount, rawListings] =
      await Promise.all([
        prisma.listing.count({ where }),
        prisma.listing.count({ where: { isPublished: true, totalBedsLeft: { gt: 0 } } }),
        prisma.listing.count({ where: { isPublished: true, totalBedsLeft: { lte: 0 } } }),
        prisma.listing.findMany({
          where,
          include: {
            images: { orderBy: { orderIndex: "asc" } },
            bedConfigurations: true,
            proximities: true,
            amenities: true,
          },
          orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Transform to frontend Listing interface
    const formatted = rawListings.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      isVerified: l.isVerified,
      residenceType:
        l.residenceType === "CO_ED"
          ? ("Co-ed Residence" as const)
          : l.residenceType === "BOYS_ONLY"
          ? ("Boys Residence" as const)
          : ("Girls Residence" as const),
      wingsInfo: l.wingsInfo,
      rating: {
        score: Number(l.ratingScore),
        reviewCount: l.ratingCount,
      },
      address: {
        line: l.addressLine,
        city: l.city,
        state: l.state,
        pincode: l.pincode,
      },
      proximity: l.proximities.map((p) => ({
        landmark: p.customName || (p.landmark === "GEHU_CAMPUS" ? "GEHU" : "GEU Main"),
        distance: p.distance,
        time: p.timeEstimate,
        iconType:
          p.landmark === "GEHU_CAMPUS" || p.landmark === "GEU_MAIN_CAMPUS"
            ? ("college" as const)
            : ("general" as const),
        travelMode:
          p.travelMode === "WALKING"
            ? ("walking" as const)
            : p.travelMode === "SCOOTER"
            ? ("scooter" as const)
            : ("bus" as const),
      })),
      images: l.images.map((img) => img.imageUrl),
      bedConfigurations: l.bedConfigurations.map((b) => ({
        id: b.id,
        name: b.name,
        price: b.price,
        period: b.period,
        availableBeds: b.availableBeds,
        statusLabel: b.statusLabel || (b.availableBeds > 0 ? `${b.availableBeds} beds left` : "Sold out"),
        isAvailable: b.isAvailable && b.availableBeds > 0,
      })),
      totalBedsLeft: l.totalBedsLeft,
      availabilitySummary: l.availabilitySummary,
      amenities: l.amenities.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        iconType:
          a.icon === "WIFI"
            ? ("wifi" as const)
            : a.icon === "MEALS"
            ? ("meals" as const)
            : a.icon === "BATH"
            ? ("bath" as const)
            : a.icon === "POWER_BACKUP"
            ? ("power" as const)
            : a.icon === "WATER_PURIFIER"
            ? ("water" as const)
            : a.icon === "LAUNDRY"
            ? ("laundry" as const)
            : a.icon === "GYM"
            ? ("gym" as const)
            : ("security" as const),
      })),
      pricingSummary: {
        minPrice: l.minPrice,
        maxPrice: l.maxPrice || undefined,
        period: l.pricingPeriod,
        inclusionsNote: l.inclusionsNote,
      },
      ownerContact: {
        name: l.ownerName,
        whatsappNumber: l.ownerWhatsappNumber,
        role: l.ownerRole,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      counts: {
        available: availableCount,
        soldout: soldOutCount,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("Fetch Listings Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch listings" } },
      { status: 500 }
    );
  }
}
