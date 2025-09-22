import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get dashboard data for admin (total orders, total stores, total products, total revenue)
export async function GET() {
  try {
    const isAdmin = await authAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const orders = await prisma.order.count();
    const stores = await prisma.store.count();
    const products = await prisma.product.count();

    const allOrders = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true,
      },
    });

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    const revenue = totalRevenue.toFixed(2);

    const dashboardData = {
      orders,
      stores,
      products,
      revenue,
      allOrders,
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}