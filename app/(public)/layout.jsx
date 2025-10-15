'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDispatch , useSelector} from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "@/lib/features/product/productSlice";
import {useUser} from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { fetchCart } from "@/lib/features/cart/cartSlice";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch()
    
    const {user} = useUser()
    const {getToken} = useAuth()

    const {cartItems} = useSelector((state) => state.cart)


    useEffect(() => {
        dispatch(fetchProducts({}))
    } , [])

    useEffect(() => {
        if(user) {
            dispatch(fetchCart({getToken}))
        }
    } , [user])

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
