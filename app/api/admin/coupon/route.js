import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";

// Add new coupon
export async function POST(request) {
  try {
    const isAdmin = await authAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { coupon } = await request.json();
    coupon.code = coupon.code.toUpperCase();

    const created = await prisma.coupon.create({ data: coupon });

    // Schedule Inngest cleanup
    await inngest.send({
      name: "app/coupon.expired",
      data: {
        code: created.code,
        expires_at: created.expiresAt,
      },
    });

    return NextResponse.json({ message: "Coupon added successfully" });
  } catch (error) {
    console.error("❌ POST /coupon error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}

// Delete coupon
export async function DELETE(request) {
  try {
    const isAdmin = await authAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { code } = await request.json(); // ✅ Use body, not query

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { code } });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE /coupon error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}

// Get all coupons
export async function GET() {
  try {
    const isAdmin = await authAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany();

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("❌ GET /coupon error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}