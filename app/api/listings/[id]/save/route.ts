import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 }
      );
    }

    const saved = await prisma.savedListing.upsert({
      where: {
        userId_listingId: {
          userId: session.userId,
          listingId: listing.id,
        },
      },
      create: {
        userId: session.userId,
        listingId: listing.id,
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      data: saved,
      message: "Listing bookmarked to saved items",
    });
  } catch (error) {
    console.error("Save Listing Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to save listing" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
        { status: 404 }
      );
    }

    await prisma.savedListing.deleteMany({
      where: {
        userId: session.userId,
        listingId: listing.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Listing removed from bookmarks",
    });
  } catch (error) {
    console.error("Unsave Listing Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to remove bookmark" } },
      { status: 500 }
    );
  }
}
