"use client";

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getCategory } from "@/lib/firestore/categories/read_server";
import { updateCategory } from "@/lib/firestore/categories/write";

export default function EditForm({ id }) {
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await getCategory({ id });
      if (!res) {
        toast.error("Category not found!");
      } else {
        setData(res);
      }
    } catch (err) {
      toast.error(err?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleData = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const uploadImage = async () => {
    if (!image) return data?.imageUrl;

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

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      if (!data?.slug || !data?.name) {
        toast.error("Name and Slug are required");
        setIsLoading(false);
        return;
      }

      const imageUrl = await uploadImage();
      await updateCategory({ data: { ...data, imageUrl } });

      toast.success("Category updated successfully");
      router.push("/admin/categories");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">Modifier une catégorie</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="flex flex-col gap-3"
      >
        {/* Image */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Image <span className="text-red-500">*</span>
          </label>
          {image && (
            <div className="flex justify-center p-3">
              <img
                className="h-20"
                src={URL.createObjectURL(image)}
                alt="Preview"
              />
            </div>
          )}
          {!image && data?.imageUrl && (
            <div className="flex justify-center p-3">
              <img className="h-20" src={data.imageUrl} alt="Current" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
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
            value={data.name}
            onChange={(e) => handleData("name", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
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
            value={data.slug}
            onChange={(e) => handleData("slug", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
          />
        </div>

        <Button isLoading={isLoading} type="submit">
          Modifier
        </Button>
      </form>
    </div>
  );
}
