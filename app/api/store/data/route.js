import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get store info & products by username
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { username },
      include: {
        Product: {
          where: { inStock: true },
          include: { rating: true },
        },
      },
    });

    if (!store || !store.isActive) {
      return NextResponse.json({ error: "Store not found or inactive" }, { status: 400 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

