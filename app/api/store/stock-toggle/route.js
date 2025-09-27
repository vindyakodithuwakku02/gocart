import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";

// ✅ PATCH /api/store/stock-toggle
export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    const { productId } = await request.json();

    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Find the product belonging to the store
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Toggle inStock value
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { inStock: !product.inStock },
    });

    return NextResponse.json({
      message: `Product is now ${updated.inStock ? "In Stock" : "Out of Stock"}`,
      inStock: updated.inStock,
    });
  } catch (error) {
    console.error("❌ toggle-stock error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 400 }
    );
  }
}
