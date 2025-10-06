"use client";

import { getCollection } from "@/lib/firestore/collections/read_server";
import {
  createNewCollection,
  updateCollection,
} from "@/lib/firestore/collections/write";
import { useProduct, useProducts } from "@/lib/firestore/products/read";
import { Button } from "@nextui-org/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Form({ id }) {
  const [data, setData] = useState({
    title: "",
    subTitle: "",
    products: [],
    imageUrl: "",
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: products } = useProducts({ pageLimit: 2000 });
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await getCollection({ id });
      if (!res) {
        toast.error("Collection Not Found!");
        router.push("/admin/collections");
      } else {
        setData(res);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleData = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const uploadImage = async () => {
    if (!image) throw new Error("No image selected");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("/api/uploadImage/collections", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Upload API error:", result);
        throw new Error(
          result.error || `Upload failed with status ${res.status}`
        );
      }

      if (!result.url) {
        throw new Error("No URL returned from upload");
      }

      return result.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!image) {
        toast.error("Image is required");
        setIsLoading(false);
        return;
      }
      if (!data?.title) {
        toast.error("Title is required");
        setIsLoading(false);
        return;
      }
      if (!data?.products || data?.products?.length === 0) {
        toast.error("At least one product is required");
        setIsLoading(false);
        return;
      }

      const imageUrl = await uploadImage();
      const collectionData = { ...data, imageUrl };

      await createNewCollection({ data: collectionData });

      toast.success("Creation réussie");
      setData({
        title: "",
        subTitle: "",
        products: [],
        imageUrl: "",
      });
      setImage(null);
    } catch (error) {
      console.error("Create error:", error);
      toast.error(error?.message || "Échec de la création de la collection");
    }
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      if (!data?.title) {
        toast.error("Titre obligatoire");
        setIsLoading(false);
        return;
      }
      if (!data?.products || data?.products?.length === 0) {
        toast.error("Au moins un produit est requis");
        setIsLoading(false);
        return;
      }

      let imageUrl = data?.imageUrl;

      if (image) {
        imageUrl = await uploadImage();
      }

      if (!imageUrl) {
        toast.error("Image est requise");
        setIsLoading(false);
        return;
      }

      const collectionData = { ...data, imageUrl };

      await updateCollection({ data: collectionData });

      toast.success("Successfully Updated");
      router.push("/admin/collections");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.message || "Échec de la mise à jour de la collection");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const addProduct = (productId) => {
    if (productId && !data?.products?.includes(productId)) {
      setData((prevData) => ({
        ...prevData,
        products: [...(prevData.products || []), productId],
      }));
    }
  };

  const removeProduct = (productId) => {
    setData((prevData) => ({
      ...prevData,
      products: prevData.products?.filter((id) => id !== productId) || [],
    }));
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">{id ? "Modifier" : "Créer"} Collection</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Image Upload */}
        <div className="flex flex-col gap-1">
          <label htmlFor="collection-image" className="text-gray-500 text-sm">
            Image <span className="text-red-500">*</span>
          </label>

          {/* Preview de la nouvelle image */}
          {image && (
            <div className="flex justify-center items-center p-3">
              <img
                className="h-20 object-cover"
                src={URL.createObjectURL(image)}
                alt="New preview"
              />
            </div>
          )}

          {/* Image actuelle (en mode édition) */}
          {!image && data?.imageUrl && (
            <div className="flex justify-center items-center p-3">
              <img
                className="h-20 object-cover"
                src={data.imageUrl}
                alt="Current"
              />
            </div>
          )}

          <input
            onChange={(e) => {
              if (e.target.files.length > 0) {
                setImage(e.target.files[0]);
              }
            }}
            id="collection-image"
            name="collection-image"
            type="file"
            accept="image/*"
            className="border px-4 py-2 rounded-lg w-full"
            required
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label htmlFor="collection-title" className="text-gray-500 text-sm">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="collection-title"
            name="collection-title"
            type="text"
            placeholder="Entrer le titre"
            value={data?.title ?? ""}
            onChange={(e) => handleData("title", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>

        {/* Sub Title */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="collection-sub-title"
            className="text-gray-500 text-sm"
          >
            Sous-titre
          </label>
          <input
            id="collection-sub-title"
            name="collection-sub-title"
            type="text"
            value={data?.subTitle ?? ""}
            onChange={(e) => handleData("subTitle", e.target.value)}
            placeholder="Entrer le sous-titre"
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </div>

        {/* Products List */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 text-sm">
            Produits sélectionnés ({data?.products?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2">
            {data?.products?.map((productId) => (
              <ProductCard
                key={productId}
                productId={productId}
                onRemove={removeProduct}
              />
            ))}
          </div>
        </div>

        {/* Product Selection */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="collection-products"
            className="text-gray-500 text-sm"
          >
            Ajouter un produit <span className="text-red-500">*</span>
          </label>
          <select
            id="collection-products"
            name="collection-products"
            onChange={(e) => {
              addProduct(e.target.value);
              e.target.value = ""; // Reset select
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          >
            <option value="">Sélectionner un produit</option>
            {products?.map((item) => (
              <option
                key={item?.id}
                disabled={data?.products?.includes(item?.id)}
                value={item?.id}
              >
                {item?.title}
              </option>
            ))}
          </select>
        </div>

        <Button isLoading={isLoading} isDisabled={isLoading} type="submit">
          {id ? "Modifier" : "Créer"}
        </Button>
      </form>
    </div>
  );
}

function ProductCard({ productId, onRemove }) {
  const { data: product } = useProduct({ productId });

  if (!product) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
      <span className="max-w-[120px] truncate">{product?.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onRemove(productId);
        }}
        className="hover:bg-blue-600 rounded-full p-1"
      >
        <X size={12} />
      </button>
    </div>
  );
}
