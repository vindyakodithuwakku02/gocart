import imagekit from "@/configs/imageKit";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    console.log("✅ Clerk userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: no user found" }, { status: 401 });
    }

    const storeId = await authSeller(userId);
    console.log("✅ Store ID:", storeId);

    if (!storeId) {
      return NextResponse.json({ error: "Seller not approved or no store found" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = parseFloat(formData.get("mrp"));
    const price = parseFloat(formData.get("price"));
    const category = formData.get("category");
    const images = formData.getAll("images");

    console.log("✅ Received formData:", { name, description, mrp, price, category, imageCount: images.length });

    if (!name || !description || !mrp || !price || !category || images.length < 1) {
      return NextResponse.json({ error: "Missing product details" }, { status: 400 });
    }

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        return imagekit.url({
          path: uploadResponse.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
      })
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({ message: "✅ Product added successfully" });
  } catch (error) {
    console.error("❌ Product upload failed:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({ where: { storeId } });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ Product fetch error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 400 });
  }
}
