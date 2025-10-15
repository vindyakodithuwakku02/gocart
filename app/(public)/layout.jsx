'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "@/lib/features/product/productSlice";
import {useUser} from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch()
    
    const {user} = useUser()
    const {getToken} = useAuth()


    useEffect(() => {
        dispatch(fetchProducts({}))
    } , [])

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
