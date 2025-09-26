"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export default function StoreManageProducts() {
  const { getToken } = useAuth(); // ✅ Correct way to extract getToken
  const { user } = useUser();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // ✅ Fetch Products
  const fetchProducts = async () => {
    try {
      const token = await getToken(); // get Clerk JWT
      const { data } = await axios.get("/api/store/product", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sort latest first
      const sorted = data.products?.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setProducts(sorted || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle Stock (you can extend this to actually call your API)
  const toggleStock = async (productId) => {
    try {
        const token = await getToken();
        const { data } = await axios.patch(
          `/api/store/product/${productId}/toggle-stock`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId ? { ...product, inStock: data.inStock } : product
          )
        );
        toast.success(data.message);
    } catch (error) {
        toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="w-full">
      <h1 className="text-2xl text-slate-500 mb-6">
        Manage <span className="text-slate-800 font-medium">Products</span>
      </h1>

      {products.length === 0 ? (
        <p className="text-slate-600 text-center mt-10">
          No products found. Add some from the “Add Product” page.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden md:table-cell">Description</th>
                <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-slate-700 bg-white">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-slate-200 hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Image
                        width={40}
                        height={40}
                        className="p-1 shadow rounded border border-slate-200"
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">
                    {product.description}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    {currency} {product.mrp?.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    {currency} {product.price?.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer gap-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={product.inStock}
                        onChange={() =>
                          toast.promise(toggleStock(product.id), {
                            loading: "Updating stock...",
                          })
                        }
                      />
                      <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                      <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
