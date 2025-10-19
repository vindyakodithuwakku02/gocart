import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Approve or reject a store
export async function POST(request) {
  try {
    const isAdmin = await authAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { storeId, status } = await request.json();

    if (!storeId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updateData =
      status === "approved"
        ? { status: "approved", isActive: true }
        : { status: "rejected" };

    await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    return NextResponse.json({ message: `Store ${status} successfully` });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}

// Get all pending and rejected stores
export async function GET() {
  try {
    const isAdmin = await authAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { status: { in: ["pending", "rejected"] } },
      include: { user: true },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}