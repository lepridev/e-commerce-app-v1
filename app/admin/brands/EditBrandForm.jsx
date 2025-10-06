"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateBrand } from "@/lib/firestore/brands/write";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditBrandForm({ brandId }) {
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Charger la marque existante
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const ref = doc(db, "brands", brandId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setData(snap.data());
        } else {
          toast.error("Brand not found");
        }
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchBrand();
  }, [brandId]);

  // Upload image → API route
  const uploadImage = async () => {
    if (!image) return data.imageUrl; // garder l'ancienne si rien n'est choisi

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

  // Sauvegarde modification
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const imageUrl = await uploadImage();

      await updateBrand({
        data: {
          ...data,
          imageUrl,
          id: brandId,
        },
      });

      toast.success("Brand updated successfully");
      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">Edit Brand</h1>

      {/* Aperçu image */}
      <div className="flex flex-col gap-2">
        {image ? (
          <Image
            src={URL.createObjectURL(image)}
            alt="Preview"
            width={80}
            height={80}
            className="h-20 object-cover"
          />
        ) : (
          data.imageUrl && (
            <Image
              src={data.imageUrl}
              alt="Current"
              width={80}
              height={80}
              className="h-20 object-cover"
            />
          )
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              setImage(e.target.files[0]);
            }
          }}
          className="border px-4 py-2 rounded-lg"
        />
      </div>

      {/* Nom */}
      <input
        type="text"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        className="border px-4 py-2 rounded-lg"
      />

      <Button isLoading={isLoading} onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}
