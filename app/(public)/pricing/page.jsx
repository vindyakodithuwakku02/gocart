'use client'
import { PricingTable } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

export default function PricingPage() {
    const { isLoaded, isSignedIn } = useUser()

    if (!isLoaded) {
        return (
            <div className='flex items-center justify-center my-28'>
                <Loader2 className='animate-spin' size={40} />
            </div>
        )
    }

    return (
        <div className='mx-auto max-w-[900px] my-28 px-4'>
            <div className='text-center mb-8'>
                <h1 className='text-4xl font-bold text-slate-800 mb-4'>
                    Become a Plus Member
                </h1>
                <p className='text-slate-600 text-lg'>
                    Unlock exclusive benefits and features with our Plus membership
                </p>
            </div>

            {/* Pricing Table */}
            <div className='w-full'>
                <PricingTable />
            </div>

            {/* Fallback if PricingTable doesn't load */}
            <div className='mt-12 text-center text-slate-500'>
                <p>Having trouble? <a href="mailto:support@gocart.com" className='text-blue-600 hover:underline'>Contact support</a></p>
            </div>
        </div>
    )
}
