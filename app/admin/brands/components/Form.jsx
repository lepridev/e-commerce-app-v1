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

  // ✅ FONCTION UPLOAD CORRECTE POUR LA PRODUCTION
  const uploadImage = async () => {
    if (!image) throw new Error("Aucune image sélectionnée");

    try {
      // Validation du fichier
      if (!image.type.startsWith("image/")) {
        throw new Error("Le fichier doit être une image");
      }

      // Limite de taille (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (image.size > maxSize) {
        throw new Error("L'image est trop volumineuse (max 5MB)");
      }

      const formData = new FormData();
      formData.append("file", image);

      console.log("📤 Upload de l'image de marque:", image.name);

      const res = await fetch("/api/uploadImage/brands", {
        // ✅ Note: "brands" pas "uploadImage"
        method: "POST",
        body: formData,
      });

      // ✅ GESTION AMÉLIORÉE DES ERREURS 500
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
      console.log("📥 Réponse d'upload:", result);

      if (!result.url) {
        throw new Error("L'API n'a pas retourné d'URL d'image");
      }

      console.log("✅ Upload réussi:", result.url);
      return result.url;
    } catch (error) {
      console.error("❌ Erreur d'upload:", error);

      let userMessage = error.message;
      if (error.message.includes("500")) {
        userMessage =
          "Erreur serveur lors de l'upload. Vérifiez la configuration Cloudinary.";
      } else if (error.message.includes("413")) {
        userMessage = "Fichier trop volumineux. Maximum 5MB autorisé.";
      } else if (error.message.includes("400")) {
        userMessage = "Format de fichier non supporté.";
      }

      throw new Error(userMessage);
    }
  };

  // ✅ FONCTION CREATE AVEC GESTION D'ERREURS
  const handleCreate = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Validation
      if (!data?.name?.trim()) {
        toast.error("Le nom de la marque est requis");
        setIsLoading(false);
        return;
      }

      if (!image) {
        toast.error("L'image de la marque est requise");
        setIsLoading(false);
        return;
      }

      console.log("🚀 Création d'une nouvelle marque...");

      // Upload de l'image
      console.log("📤 Upload de l'image...");
      const imageUrl = await uploadImage();

      // Création de la marque
      const result = await createNewBrand({
        data: {
          name: data.name.trim(),
          imageUrl,
        },
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Marque créée avec succès !");

      // Reset du formulaire
      setData({ name: "" });
      setImage(null);

      // Rechargement
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur lors de la création de la marque:", error);
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

          {/* Aperçu de l'image */}
          {image && (
            <div className="flex justify-center items-center p-3 border rounded-lg bg-gray-50">
              <img
                className="h-20 object-contain"
                src={URL.createObjectURL(image)}
                alt="Aperçu"
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
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Formats: JPEG, PNG, WebP • Max: 5MB
          </p>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Entrer le nom de la marque"
            value={data?.name ?? ""}
            onChange={(e) => handleData("name", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Indicateur de statut */}
        {isLoading && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
              <p className="text-sm text-blue-700">Création en cours...</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            type="submit"
            color="primary"
            className="w-full"
          >
            {isLoading ? "Création..." : "Créer la marque"}
          </Button>
        </div>
      </form>
    </div>
  );
}
