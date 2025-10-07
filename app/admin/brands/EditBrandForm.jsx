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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();

  // Charger la marque existante
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setIsLoadingData(true);
        const ref = doc(db, "brands", brandId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setData(snap.data());
        } else {
          toast.error("Marque non trouvée");
        }
      } catch (err) {
        console.error("❌ Erreur de chargement:", err);
        toast.error("Erreur lors du chargement de la marque");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  // ✅ FONCTION UPLOAD CORRECTE
  const uploadImage = async () => {
    // Si aucune nouvelle image, garder l'ancienne
    if (!image) return data?.imageUrl;

    try {
      // Validation du fichier
      if (!image.type.startsWith("image/")) {
        throw new Error("Le fichier doit être une image");
      }

      const maxSize = 5 * 1024 * 1024;
      if (image.size > maxSize) {
        throw new Error("L'image est trop volumineuse (max 5MB)");
      }

      const formData = new FormData();
      formData.append("file", image);

      console.log("📤 Upload de la nouvelle image...");

      const res = await fetch("/api/uploadImage/brands", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = `Erreur serveur (${res.status})`;

        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const textError = await res.text().catch(() => null);
          if (textError) {
            errorMessage = `Erreur: ${textError.substring(0, 100)}...`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await res.json();

      if (!result.url) {
        throw new Error("L'API n'a pas retourné d'URL d'image");
      }

      console.log("✅ Upload réussi:", result.url);
      return result.url;
    } catch (error) {
      console.error("❌ Erreur d'upload:", error);

      let userMessage = error.message;
      if (error.message.includes("500")) {
        userMessage = "Erreur serveur lors de l'upload.";
      }

      throw new Error(userMessage);
    }
  };

  // ✅ SAUVEGARDE AVEC GESTION D'ERREURS
  const handleSave = async () => {
    if (isLoading || !data) return;

    setIsLoading(true);

    try {
      // Validation
      if (!data?.name?.trim()) {
        toast.error("Le nom de la marque est requis");
        setIsLoading(false);
        return;
      }

      console.log("🔄 Mise à jour de la marque...");

      // Upload de la nouvelle image si fournie
      const imageUrl = await uploadImage();

      await updateBrand({
        data: {
          name: data.name.trim(),
          imageUrl: imageUrl,
          id: brandId,
        },
      });

      toast.success("✅ Marque mise à jour avec succès !");
      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      console.error("❌ Erreur de mise à jour:", err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
        <p className="text-red-500">Marque non trouvée</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">Modifier la marque</h1>

      {/* Aperçu image */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-500 text-sm">Image</label>

        {image ? (
          <div className="flex justify-center items-center p-3 border rounded-lg bg-gray-50">
            <Image
              src={URL.createObjectURL(image)}
              alt="Nouvelle image"
              width={80}
              height={80}
              className="h-20 object-contain"
            />
          </div>
        ) : (
          data.imageUrl && (
            <div className="flex justify-center items-center p-3 border rounded-lg bg-gray-50">
              <Image
                src={data.imageUrl}
                alt="Image actuelle"
                width={80}
                height={80}
                className="h-20 object-contain"
              />
            </div>
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
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Laisser vide pour conserver l'image actuelle
        </p>
      </div>

      {/* Nom */}
      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-sm">Nom</label>
        <input
          type="text"
          value={data.name || ""}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Indicateur de statut */}
      {isLoading && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <p className="text-sm text-blue-700">Mise à jour en cours...</p>
          </div>
        </div>
      )}

      <Button
        isLoading={isLoading}
        onClick={handleSave}
        color="primary"
        className="w-full"
      >
        {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
      </Button>
    </div>
  );
}
