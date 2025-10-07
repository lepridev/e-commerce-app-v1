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
  const [data, setData] = useState({ name: "", slug: "" });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const res = await getCategory({ id });
      if (!res) {
        toast.error("Catégorie non trouvée !");
      } else {
        setData(res);
      }
    } catch (error) {
      console.error("❌ Erreur de chargement:", error);
      toast.error(error?.message);
    } finally {
      setIsLoadingData(false);
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

  // ✅ FONCTION UPLOAD CORRECTE POUR LA PRODUCTION
  const uploadImage = async () => {
    if (!image) {
      if (id && data?.imageUrl) {
        return data.imageUrl; // Garder l'image existante en mode édition
      }
      throw new Error("Aucune image sélectionnée");
    }

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

      console.log("📤 Upload de l'image de catégorie:", image.name);

      const res = await fetch("/api/uploadImage/categories", {
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

  // ✅ VALIDATION DU FORMULAIRE
  const validateForm = () => {
    if (!data?.name?.trim()) {
      toast.error("Le nom est requis");
      return false;
    }
    if (!data?.slug?.trim()) {
      toast.error("Le slug est requis");
      return false;
    }
    if (!id && !image) {
      toast.error("L'image est requise pour la création");
      return false;
    }
    return true;
  };

  // ✅ FONCTION CREATE AVEC GESTION D'ERREURS
  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("🚀 Création d'une nouvelle catégorie...");

      // Upload de l'image
      console.log("📤 Upload de l'image...");
      const imageUrl = await uploadImage();

      const categoryData = {
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        imageUrl: imageUrl,
      };

      console.log("📝 Création de la catégorie:", categoryData);

      const result = await createNewCategory({ data: categoryData });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Catégorie créée avec succès !");

      // Reset du formulaire
      setData({ name: "", slug: "" });
      setImage(null);

      // Rechargement
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur lors de la création:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FONCTION UPDATE AVEC GESTION D'ERREURS
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log("🔄 Mise à jour de la catégorie...");

      // Upload de la nouvelle image si fournie
      const imageUrl = await uploadImage();

      const categoryData = {
        id: id,
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        imageUrl: imageUrl,
      };

      console.log("📝 Mise à jour de la catégorie:", categoryData);

      const result = await updateCategory({ data: categoryData });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Catégorie mise à jour avec succès !");
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour:", error);
      toast.error(error.message);
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
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
            Image {!id && <span className="text-red-500">*</span>}
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

          {id && data?.imageUrl && !image && (
            <div className="flex justify-center items-center p-3 border rounded-lg bg-gray-50">
              <img
                className="h-20 object-contain"
                src={data.imageUrl}
                alt="Image actuelle"
              />
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
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Formats: JPEG, PNG, WebP • Max: 5MB
            {id && " • Laisser vide pour conserver l'image actuelle"}
          </p>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Entrer le nom"
            value={data?.name ?? ""}
            onChange={(e) => handleData("name", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Entrer le slug"
            value={data?.slug ?? ""}
            onChange={(e) => handleData("slug", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Format recommandé: minuscules avec tirets (ex: vetements-homme)
          </p>
        </div>

        {/* Indicateur de statut */}
        {isLoading && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
              <p className="text-sm text-blue-700">
                {id ? "Mise à jour en cours..." : "Création en cours..."}
              </p>
            </div>
          </div>
        )}

        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          type="submit"
          color="primary"
          className="w-full"
        >
          {id ? "Modifier" : "Créer"}
        </Button>
      </form>
    </div>
  );
}
