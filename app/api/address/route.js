import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Add new Address
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const { address } = await request.json()

        address.userId = userId

        const newAddress = await prisma.address.create({
            data: address
        })
        return NextResponse.json({ newAddress, message: 'Address added successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

