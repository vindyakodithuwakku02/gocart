import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get all approved stores
export async function GET() {
  try {
    const isAdmin = await authAdmin(); 

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { status: { in: ["approved"] } },
      include: { user: true }, // optional: include store owner info
    });

    console.log("✅ Approved stores found:", stores.length);
    return NextResponse.json({ stores });
  } catch (error) {
    console.error("❌ GET /stores error:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}