import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  revokeSessionToken,
  clearSessionCookie,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (tokenCookie?.value) {
      await revokeSessionToken(tokenCookie.value);
    }

    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to log out",
        },
      },
      { status: 500 }
    );
  }
}
