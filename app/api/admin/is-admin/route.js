import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    const adminList = process.env.ADMIN_EMAIL?.split(",").map(e => e.trim().toLowerCase()) || [];

    console.log("🔍 Logged-in email:", email);
    console.log("🔐 Admin list:", adminList);

    const isAdmin = adminList.includes(email);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}