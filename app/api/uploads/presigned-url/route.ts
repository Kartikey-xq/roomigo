import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { fileType, fileSize, purpose = "avatar" } = body;

    // Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FILE_TYPE", message: "Only JPEG, PNG, and WebP images are allowed" } },
        { status: 400 }
      );
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (fileSize && fileSize > maxBytes) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "File exceeds 10MB limit" } },
        { status: 400 }
      );
    }

    const fileExt = fileType.split("/")[1] || "jpg";
    const objectKey = `uploads/${purpose}/${session.userId}/${crypto.randomUUID()}.${fileExt}`;

    // Cloudflare R2 / S3 Presigned URL (or local dev proxy)
    const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_URL || "https://images.unsplash.com";
    const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/uploads/mock-receiver?key=${encodeURIComponent(objectKey)}`;
    const publicUrl = `${cdnBaseUrl}/${objectKey}`;

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        objectKey,
        publicUrl,
      },
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate upload URL" } },
      { status: 500 }
    );
  }
}
