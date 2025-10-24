import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


//Verify coupon 
export async function POST(request) {
    try {
        // Get signed-in user on server
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const userId = user.id;
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

        if (coupon.forMember) {
            // Try to determine membership from Clerk user public metadata or via clerkClient
            let plan = user?.publicMetadata?.plan || user?.public_metadata?.plan;

            if (!plan && userId) {
                try {
                    const u = await clerkClient.users.getUser(userId);
                    plan = u?.publicMetadata?.plan || u?.public_metadata?.plan;
                } catch (e) {
                    console.warn("Could not fetch user from clerkClient:", e?.message || e);
                }
            }

            const hasPlusPlan = String(plan || "").toLowerCase() === "plus";

            if (!hasPlusPlan) {
                return NextResponse.json({ error: "Coupon valid only for members" }, { status: 400 });
            }
        }

        return NextResponse.json({ coupon });
    } catch (error) {
        console.error( error);
        return NextResponse.json({ error: error.code || error.message  }, { status: 400 });
    }
}