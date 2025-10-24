import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";  


//Verify coupon 
export async function POST(request) {
    try {
        const { userId, has } = useAuth(request);
        const { code } = await request.json(); 
        
        const coupon = await prisma.coupon.findUnique({ where: { code : code.toUpperCase(),
            expiresAt : { gt: new Date() }  
         }
         })

        if (!coupon) {
            return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
        }

        if(coupon.forNewUser){
            const userOrders = await prisma.order.findMany({ where: { userId: userId } })
            if(userOrders.length > 0){
                return NextResponse.json({ error: "Coupon valid only for new users" }, { status: 400 });
            }
        }

        if(coupon.forMember){
            const hasPlusPlan = has({ plan: "plus" })
            if(!hasPlusPlan) {
                return NextResponse.json({ error: "Coupon valid only for members" }, { status: 400 });
            }
        }

        return NextResponse.json({ coupon });
    } catch (error) {
        console.error( error);
        return NextResponse.json({ error: error.code || error.message  }, { status: 400 });
    }
}