import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET /api/products
export async function GET() {
  try {
    // Fetch all in-stock products
    let products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove products belonging to inactive stores
    products = products.filter((product) => product.store?.isActive);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ GET /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
