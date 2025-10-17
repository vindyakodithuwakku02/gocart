import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//Update user cart
export async function POST(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const { cart } = await request.json()   

        //save the cart to the user object
        await prisma.user.update({
            where: { id: userId },
            data: { cart: cart }
        })
        return NextResponse.json({ message: "Cart updated" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// Get user cart
export async function GET(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        // Return empty cart if user.cart is null or undefined
        return NextResponse.json({ cart: user?.cart || {} })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

       