"use client";

import { getCollection } from "@/lib/firestore/collections/read_server";
import { updateCollection } from "@/lib/firestore/collections/write";
import { useProduct, useProducts } from "@/lib/firestore/products/read";
import { Button } from "@nextui-org/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditForm({ id }) {
  const [data, setData] = useState(null);
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

    const res = await fetch("/api/uploadImage/collections", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Image upload failed");

    return result.url;
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
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

      let imageUrl = data?.imageUrl;

      if (image) {
        imageUrl = await uploadImage();
      }

      if (!imageUrl) {
        toast.error("Image is required");
        setIsLoading(false);
        return;
      }

      const collectionData = { ...data, imageUrl };

      await updateCollection({ data: collectionData });

      toast.success("Successfully Updated");
      router.push("/admin/collections");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">Modifier la collection</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="collection-image" className="text-gray-500 text-sm">
            Image <span className="text-red-500">*</span>
          </label>

          {image && (
            <div className="flex justify-center items-center p-3">
              <img
                className="h-20"
                src={URL.createObjectURL(image)}
                alt="New preview"
              />
            </div>
          )}

          {!image && data?.imageUrl && (
            <div className="flex justify-center items-center p-3">
              <img className="h-20" src={data.imageUrl} alt="Current" />
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
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="collection-title" className="text-gray-500 text-sm">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="collection-title"
            name="collection-title"
            type="text"
            placeholder="Enter Title"
            value={data?.title ?? ""}
            onChange={(e) => {
              handleData("title", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </div>

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
            onChange={(e) => {
              handleData("subTitle", e.target.value);
            }}
            placeholder="Enter Sub Title"
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {data?.products?.map((productId) => (
            <ProductCard
              productId={productId}
              key={productId}
              setData={setData}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="collection-products"
            className="text-gray-500 text-sm"
          >
            Sélectionner un produit <span className="text-red-500">*</span>
          </label>
          <select
            id="collection-products"
            name="collection-products"
            onChange={(e) => {
              if (e.target.value) {
                setData((prevData) => {
                  let list = [...(prevData?.products ?? [])];
                  if (!list.includes(e.target.value)) {
                    list.push(e.target.value);
                  }
                  return {
                    ...prevData,
                    products: list,
                  };
                });
                e.target.value = ""; // Reset select
              }
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
          Modifier
        </Button>
      </form>
    </div>
  );
}

function ProductCard({ productId, setData }) {
  const { data: product } = useProduct({ productId: productId });

  return (
    <div className="flex gap-3 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
      <h2>{product?.title}</h2>
      <button
        onClick={(e) => {
          e.preventDefault();
          setData((prevData) => {
            let list = [...prevData?.products];
            list = list?.filter((item) => item != productId);
            return {
              ...prevData,
              products: list,
            };
          });
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}
