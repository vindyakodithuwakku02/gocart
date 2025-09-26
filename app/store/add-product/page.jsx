"use client";

import { assets } from "@/assets/assets";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function StoreAddProduct() {
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Health",
    "Toys & Games",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Drink",
    "Hobbies & Crafts",
    "Others",
  ];

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    mrp: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const onChangeHandler = (e) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!images[1] && !images[2] && !images[3] && !images[4]) {
        return toast.error("Please upload at least one image");
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("name", productInfo.name);
      formData.append("description", productInfo.description);
      formData.append("mrp", productInfo.mrp);
      formData.append("price", productInfo.price);
      formData.append("category", productInfo.category);

      Object.keys(images).forEach((key) => {
        if (images[key]) formData.append("images", images[key]);
      });

      const token = await getToken();
      const { data } = await axios.post("/api/store/product", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(data.message || "Product added successfully!");
      setProductInfo({
        name: "",
        description: "",
        mrp: "",
        price: "",
        category: "",
      });
      setImages({ 1: null, 2: null, 3: null, 4: null });
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full px-4">
      <form
        onSubmit={(e) =>
          toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })
        }
        className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-md border border-slate-200"
      >
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-semibold text-slate-800">
            Add New <span className="text-slate-600 font-medium">Products</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Fill in the details below to add a new product to your store.
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="mb-6">
          <p className="text-slate-700 font-medium mb-3">Product Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.keys(images).map((key) => (
              <label
                key={key}
                htmlFor={`images${key}`}
                className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition"
              >
                <Image
                  width={120}
                  height={120}
                  className="object-cover rounded-md h-20 w-20"
                  src={
                    images[key]
                      ? URL.createObjectURL(images[key])
                      : assets.upload_area
                  }
                  alt="Upload"
                />
                <input
                  type="file"
                  accept="image/*"
                  id={`images${key}`}
                  onChange={(e) =>
                    setImages({ ...images, [key]: e.target.files[0] })
                  }
                  hidden
                />
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-slate-700 mb-2 font-medium">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={productInfo.name}
            onChange={onChangeHandler}
            placeholder="Enter product name"
            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-slate-500 transition"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-slate-700 mb-2 font-medium">
            Description
          </label>
          <textarea
            name="description"
            value={productInfo.description}
            onChange={onChangeHandler}
            placeholder="Enter product description"
            rows={5}
            className="w-full p-3 border border-slate-300 rounded-lg outline-none resize-none focus:border-slate-500 transition"
            required
          />
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
          <div>
            <label className="block text-slate-700 mb-2 font-medium">
              Actual Price ($)
            </label>
            <input
              type="number"
              name="mrp"
              value={productInfo.mrp}
              onChange={onChangeHandler}
              placeholder="0"
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-slate-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-2 font-medium">
              Offer Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={productInfo.price}
              onChange={onChangeHandler}
              placeholder="0"
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-slate-500 transition"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-slate-700 mb-2 font-medium">
            Category
          </label>
          <select
            name="category"
            value={productInfo.category}
            onChange={(e) =>
              setProductInfo({ ...productInfo, category: e.target.value })
            }
            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-slate-500 transition"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            disabled={loading}
            className={`${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-900"
            } text-white px-8 py-3 rounded-lg font-medium transition`}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
