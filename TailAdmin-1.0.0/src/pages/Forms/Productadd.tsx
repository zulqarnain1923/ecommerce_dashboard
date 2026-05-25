"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
// import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { Authcontext } from "../components/context/context";
import { useTheme } from "../../context/ThemeContext"; // 👈 your theme hook
import { FullSiteContext } from "../../context/fullsitecontext";
import { Authenticate } from "../../context/AuthenticContext";

// ✅ TYPES
type ProductType = {
    pr_name: string;
    pr_desc: string;
    base_price: string;
    base_stock: string;
    strike_price: string;
    brand: string;
    catagory: string | number;
    images?: File[];
    keywords?: string[];
    colors?: string[];
    sizes?: string[];
    weights?: string[];
};

type VariantsType = {
    keywords: string[];
    colors: string[];
    sizes: string[];
    weights: string[];
};

type TempVariantType = {
    keywords: string;
    colors: string;
    sizes: string;
    weights: string;
};

export default function ProductWithVariantsForm() {
    const context: any = useContext(FullSiteContext);
    const authcontext: any = useContext(Authenticate);
    const { theme } = useTheme(); // 👈 theme use
    const Navigation = useNavigate();

    const [showimage, setshowimage] = useState<string[]>([]);
    const refimage = useRef<File[]>([]);

    const [product, setProduct] = useState<ProductType>({
        pr_name: "",
        pr_desc: "",
        base_price: "",
        base_stock: "",
        strike_price: "",
        brand: "",
        catagory: 0,
    });

    const [variants, setvariants] = useState<VariantsType>({
        keywords: [],
        colors: [],
        sizes: [],
        weights: [],
    });

    const [tempvariant, setTempvariant] = useState<TempVariantType>({
        keywords: "",
        colors: "",
        sizes: "",
        weights: "",
    });

    // ✅ Product change
    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (e.target.name === "images" && "files" in e.target) {
            const files = Array.from(e.target.files || []);
            setshowimage(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
            refimage.current = [...refimage.current, ...files];
            setProduct(prev => ({ ...prev, images: refimage.current }));
        } else {
            setProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const removeImage = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        setshowimage(prev => prev.filter((_, i) => i !== index));
        refimage.current = refimage.current.filter((_, i) => i !== index);
        setProduct(prev => ({ ...prev, images: refimage.current }));
    };

    // ✅ FormData
    const creatformdata = () => {
        let flag: boolean = true
        if (variants.keywords.length <= 0) {
            context.setchecknote("Please add at least one keyword")
            flag = false
        }
        if (product.catagory === 0 || product.catagory === "0" || product.catagory === null) {
            context.setchecknote("Please select a catagory")
            flag = false
        }

        const finaldata = new FormData();
        if (flag) {
            finaldata.append("pr_name", product.pr_name);
            finaldata.append("pr_desc", product.pr_desc);
            finaldata.append("pr_price", product.base_price);
            finaldata.append("strick_price", product.strike_price);
            finaldata.append("brand", product.brand);
            finaldata.append("stock", product.base_stock);
            finaldata.append("catagory", product.catagory);

            product.images?.forEach(img => finaldata.append("images", img));
            product.keywords?.forEach(k => finaldata.append("keywords", k));
            variants.sizes.forEach(s => finaldata.append("sizes", s));
            variants.colors.forEach(c => finaldata.append("colors", c));
            variants.weights.forEach(w => finaldata.append("weights", w));

            return finaldata;
        }
    };

    // ✅ Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finaldata = creatformdata();
        if (finaldata) {
            try {
                const res = await axios.post(`${context.url}post/`, finaldata, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
                context.setchecknote(res.data.message)

                setProduct({
                    pr_name: "",
                    pr_desc: "",
                    base_price: "",
                    base_stock: "",
                    strike_price: "",
                    brand: "",
                    catagory: 0,
                });
                setvariants({
                    keywords: [],
                    colors: [],
                    sizes: [],
                    weights: [],
                });
                setshowimage([]);
                setTempvariant({
                    keywords: "",
                    colors: "",
                    sizes: "",
                    weights: "",
                });
                refimage.current = [];
            } catch (error: any) {
                if (error.response?.status === 401) {
                    const flag = await authcontext.runfunction(null, null, "checkuserauth")
                    if (flag) {
                        const res = await axios.post(`${context.url}post/`, finaldata, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
                        context.setchecknote(res.data.message)

                        setProduct({
                            pr_name: "",
                            pr_desc: "",
                            base_price: "",
                            base_stock: "",
                            strike_price: "",
                            brand: "",
                            catagory: 0,
                        });
                        setvariants({
                            keywords: [],
                            colors: [],
                            sizes: [],
                            weights: [],
                        });
                        setshowimage([]);
                        setTempvariant({
                            keywords: "",
                            colors: "",
                            sizes: "",
                            weights: "",
                        });
                        refimage.current = [];
                    }
                }
            }
        }

    };

    // ✅ Add variant
    const handeladd = (e: React.KeyboardEvent | React.MouseEvent, name: keyof TempVariantType) => {
        if ("key" in e && e.key !== "Enter") return;

        e.preventDefault();

        if (!tempvariant[name]) return alert("Empty value");

        setvariants(prev => {
            const updated = { ...prev, [name]: [...prev[name], tempvariant[name]] };
            setProduct(p => ({ ...p, [name]: updated[name] }));
            return updated;
        });

        setTempvariant(prev => ({ ...prev, [name]: "" }));
    };

    const removeTag = (e: React.MouseEvent, index: number, name: keyof VariantsType) => {
        e.preventDefault();

        const updated = variants[name].filter((_, i) => i !== index);

        setvariants(prev => ({ ...prev, [name]: updated }));
        setProduct(prev => ({ ...prev, [name]: updated }));
    };

    // ✅ Category API
    const [catagory, setcatagory] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`${context.url}catagory/`)
            .then((res) => { setcatagory(res.data.map((c: any) => c.name)) })
            .catch(err => console.log(err));
    }, []);

    // 🎨 Theme Classes (same design)
    const bgMain = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
    const bgCard = theme === "dark" ? "bg-gray-800" : "bg-gray-100";
    const inputClass = theme === "dark" ? "bg-gray-700 rounded-lg" : "bg-white border rounded-lg";

    return (
        <div className={`${bgMain} min-h-screen p-6`}>
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Add Product</h1>
                    <X className="cursor-pointer" onClick={() => Navigation(-1)} />
                </div>

                <form onSubmit={handleSubmit}>

                    <div className={`${bgCard} p-6 rounded-2xl flex flex-col gap-4`}>


                        <div>
                            <label className="mb-1">Product Name <span className="text-red-500">*</span></label>
                            <input
                                name="pr_name"
                                value={product.pr_name}
                                onChange={handleProductChange}
                                className={`w-full p-3 rounded  ${inputClass}`}
                                placeholder="Enter Product Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1">Product Description <span className="text-red-500">*</span></label>
                            <textarea
                                name="pr_desc"
                                value={product.pr_desc}
                                onChange={handleProductChange}
                                className={`w-full p-3 rounded ${inputClass}`}
                                placeholder="Product Description"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 ">
                            <div>
                                <label className="mb-1">Base Price <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="base_price"
                                    value={product.base_price}
                                    onChange={handleProductChange}
                                    className={`w-full p-3 rounded  ${inputClass}`}
                                    placeholder="Enter Base Price"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1">Strike Price<span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="strike_price"
                                    value={product.strike_price}
                                    onChange={handleProductChange}
                                    className={`w-full p-3 rounded  ${inputClass}`}
                                    placeholder="Enter Strike Price"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1">Base Stock <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="base_stock"
                                    value={product.base_stock}
                                    onChange={handleProductChange}
                                    className={`w-full p-3 rounded  ${inputClass}`}
                                    placeholder="Enter Base Stock"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1">Catagory <span className="text-red-500">*</span></label>
                                <select
                                    name="catagory"
                                    value={product.catagory}
                                    onChange={handleProductChange}
                                    className={`w-full p-3 rounded  ${inputClass}`}
                                    required
                                >
                                    <option value="null"></option>
                                    {catagory ? catagory.map((c, index) => (
                                        <option key={index} value={index + 1}>{c}</option>
                                    )) : null}
                                </select>

                            </div>

                        </div>
                        <div>
                            <label className="mb-1">Brand </label>
                            <input
                                name="brand"
                                value={product.brand}
                                onChange={handleProductChange}
                                className={`w-full p-3 rounded  ${inputClass}`}
                                placeholder="Enter Brand Name"
                            />
                        </div>
                    </div>


                    {/* IMAGE */}
                    <div className={`${bgCard} p-6 mt-4 rounded-2xl`}>
                        <label className="block mb-3">Images <span className="text-red-500">*</span></label>
                        <div className="flex gap-4 flex-wrap" id="img">
                            {showimage.map((img, i) => (
                                <div key={i} className="relative w-24 h-24">
                                    <img src={img} className="w-full h-full object-cover rounded " />
                                    <button onClick={(e) => removeImage(e, i)}>
                                        <X size={14} className="absolute top-[-8px] right-[0] h-4 w-4 bg-red-100 text-red-500 rounded-xl cursor-pointer" />
                                    </button>
                                </div>
                            ))}

                            <input type="file" multiple required onChange={handleProductChange} name="images" className=" w-[calc(100%-50px)]  " />
                        </div>
                    </div>

                    {/* VARIANTS (example) */}
                    <div className={`${bgCard} p-6 mt-4 rounded-2xl`}>
                        <label className="mb-1">Keywords <span className="text-red-500">*</span></label>
                        <div>
                            <input
                                value={tempvariant.keywords}
                                onChange={(e) => setTempvariant({ ...tempvariant, keywords: e.target.value })}
                                onKeyDown={(e) => handeladd(e, "keywords")}
                                className={`p-2 ${inputClass} w-[calc(100%-40px)]`}
                            />

                            <button onClick={(e) => handeladd(e, "keywords")} >
                                <Plus className="bg-blue-500 h-[30px] w-[30px] relative top-[8px] left-[5px] rounded-md" />
                            </button>

                            <div className="flex gap-2  mt-3">
                                {variants.keywords.map((k, i) => (
                                    <p key={i} className="bg-gray-600 px-1 rounded-lg relative">
                                        {k}
                                        <X onClick={(e) => removeTag(e, i, "keywords")} className="absolute top-[-8px] right-[0] h-3 w-3 bg-red-100 text-red-500 rounded-xl cursor-pointer" />
                                    </p>
                                ))}
                            </div>
                        </div>
                        <label className="mb-1">Sizes</label>
                        <div>
                            <input
                                value={tempvariant.sizes}
                                onChange={(e) => setTempvariant({ ...tempvariant, sizes: e.target.value })}
                                onKeyDown={(e) => handeladd(e, "sizes")}
                                className={`p-2 ${inputClass} w-[calc(100%-40px)]`}
                            />

                            <button onClick={(e) => handeladd(e, "sizes")} >
                                <Plus className="bg-blue-500 h-[30px] w-[30px] relative top-[8px] left-[5px] rounded-md" />
                            </button>

                            <div className="flex gap-2  mt-3">
                                {variants.sizes.map((s, i) => (
                                    <p key={i} className="bg-gray-600 px-1 rounded-lg relative">
                                        {s}
                                        <X onClick={(e) => removeTag(e, i, "sizes")} className="absolute top-[-8px] right-[0] h-3 w-3 bg-red-100 text-red-500 rounded-xl cursor-pointer" />
                                    </p>
                                ))}
                            </div>
                        </div>
                        <label className="mb-1">Colors</label>
                        <div>
                            <input
                                value={tempvariant.colors}
                                onChange={(e) => setTempvariant({ ...tempvariant, colors: e.target.value })}
                                onKeyDown={(e) => handeladd(e, "colors")}
                                className={`p-2 ${inputClass} w-[calc(100%-40px)]`}
                            />

                            <button onClick={(e) => handeladd(e, "colors")} >
                                <Plus className="bg-blue-500 h-[30px] w-[30px] relative top-[8px] left-[5px] rounded-md" />
                            </button>

                            <div className="flex gap-2  mt-3">
                                {variants.colors.map((c, i) => (
                                    <p key={i} className="bg-gray-600 px-1 rounded-lg relative">
                                        {c}
                                        <X onClick={(e) => removeTag(e, i, "colors")} className="absolute top-[-8px] right-[0] h-3 w-3 bg-red-100 text-red-500 rounded-xl cursor-pointer" />
                                    </p>
                                ))}
                            </div>
                        </div>
                        <label className="mb-1">Weights</label>
                        <div>
                            <input
                                value={tempvariant.weights}
                                onChange={(e) => setTempvariant({ ...tempvariant, weights: e.target.value })}
                                onKeyDown={(e) => handeladd(e, "weights")}
                                className={`p-2 ${inputClass} w-[calc(100%-40px)]`}
                            />

                            <button onClick={(e) => handeladd(e, "weights")} >
                                <Plus className="bg-blue-500 h-[30px] w-[30px] relative top-[8px] left-[5px] rounded-md" />
                            </button>

                            <div className="flex gap-2  mt-3">
                                {variants.weights.map((w, i) => (
                                    <p key={i} className="bg-gray-600 px-1 rounded-lg relative">
                                        {w}
                                        <X onClick={(e) => removeTag(e, i, "weights")} className="absolute top-[-8px] right-[0] h-3 w-3 bg-red-100 text-red-500 rounded-xl cursor-pointer" />
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-green-600 p-3 mt-4 rounded">
                        Save Product
                    </button>

                </form>
            </div>
        </div>
    );
}