"use client";

import { createNewBrand } from "@/lib/firestore/brands/write";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Form() {
  const [data, setData] = useState({ name: "" });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

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

      const imageUrl = await uploadImage();
      const result = await createNewBrand({ data: { ...data, imageUrl } });

      if (result.error) throw new Error(result.error);

      toast.success("Brand created successfully");
      setData({ name: "" });
      setImage(null);
      router.refresh(); // 🔄 recharge la liste
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">Créer une marque</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="flex flex-col gap-3"
      >
        {/* Upload Image */}
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
          <input
            id="brand-image"
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

        {/* Brand Name */}
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

        <div className="flex gap-2">
          <Button isLoading={isLoading} isDisabled={isLoading} type="submit">
            Créer
          </Button>
        </div>
      </form>
    </div>
  );
}
