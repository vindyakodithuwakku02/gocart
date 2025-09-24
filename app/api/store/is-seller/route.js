import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const authSeller = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    if (user?.store?.status === "approved") {
      return user.store.id;
    }

    return false;
  } catch (error) {
    console.error("❌ authSeller error:", error);
    return false;
  }
};

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ isSeller: false });
    }

    const storeInfo = await prisma.store.findUnique({
      where: { id: storeId },
    });

    return NextResponse.json({ isSeller: true, storeInfo });
  } catch (error) {
    console.error("❌ GET /store/is-seller error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}