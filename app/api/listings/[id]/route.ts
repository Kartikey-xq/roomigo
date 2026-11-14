import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const l = await prisma.listing.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublished: true,
      },
      include: {
        images: { orderBy: { orderIndex: "asc" } },
        bedConfigurations: true,
        proximities: true,
        amenities: true,
      },
    });

    if (!l) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 }
      );
    }

    const formatted = {
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
        statusLabel: b.statusLabel,
        isAvailable: b.isAvailable && b.availableBeds > 0,
      })),
      totalBedsLeft: l.totalBedsLeft,
      availabilitySummary: l.availabilitySummary,
      amenities: l.amenities.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        iconType: a.icon.toLowerCase(),
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
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Listing Detail Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch listing detail" } },
      { status: 500 }
    );
  }
}
