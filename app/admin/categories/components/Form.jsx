"use client";

import { getCategory } from "@/lib/firestore/categories/read_server";
import {
  createNewCategory,
  updateCategory,
} from "@/lib/firestore/categories/write";
import { Button } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Form() {
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchData = async () => {
    try {
      const res = await getCategory({ id });
      if (!res) {
        toast.error("Category Not Found!");
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
    setData((prev) => ({
      ...(prev ?? {}),
      [key]: value,
    }));
  };

  const uploadImage = async () => {
    if (!image) throw new Error("No image selected");

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Image upload failed");

    return result.url;
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!image) {
        toast.error("Image is required");
        setIsLoading(false);
        return;
      }
      if (!data?.slug || !data?.name) {
        toast.error("Name and Slug are required");
        setIsLoading(false);
        return;
      }

      const imageUrl = await uploadImage();

      await createNewCategory({ data: { ...data, imageUrl } });

      toast.success("Successfully Created");
      setData(null);
      setImage(null);
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      if (!data?.slug || !data?.name) {
        toast.error("Name and Slug are required");
        setIsLoading(false);
        return;
      }

      const imageUrl = image ? await uploadImage() : data?.imageUrl;

      if (!imageUrl) {
        toast.error("Image is required");
        setIsLoading(false);
        return;
      }

      await updateCategory({ data: { ...data, imageUrl } });

      toast.success("Successfully Updated");
      setData(null);
      setImage(null);
      router.push(`/admin/categories`);
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">
        {id ? "Modifier" : "Créer"} une catégorie
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (id) handleUpdate();
          else handleCreate();
        }}
        className="flex flex-col gap-3"
      >
        {/* Image */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Image <span className="text-red-500">*</span>
          </label>

          {image && (
            <div className="flex justify-center items-center p-3">
              <img
                className="h-20"
                src={URL.createObjectURL(image)}
                alt="Preview"
              />
            </div>
          )}

          {id && data?.imageUrl && !image && (
            <div className="flex justify-center items-center p-3">
              <img className="h-20" src={data.imageUrl} alt="Current Image" />
            </div>
          )}

          <input
            id="category-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                setImage(e.target.files[0]);
              }
            }}
            className="border px-4 py-2 rounded-lg w-full"
          />
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Entrer Nom"
            value={data?.name ?? ""}
            onChange={(e) => handleData("name", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Slug"
            value={data?.slug ?? ""}
            onChange={(e) => handleData("slug", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </div>

        <Button isLoading={isLoading} isDisabled={isLoading} type="submit">
          {id ? "Modifier" : "Créer"}
        </Button>
      </form>
    </div>
  );
}
