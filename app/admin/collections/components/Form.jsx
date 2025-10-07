"use client";

import { getCollection } from "@/lib/firestore/collections/read_server";
import {
  createNewCollection,
  updateCollection,
} from "@/lib/firestore/collections/write";
import { useProduct, useProducts } from "@/lib/firestore/products/read";
import { Button } from "@nextui-org/react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Form() {
  const [data, setData] = useState({
    title: "",
    subTitle: "",
    products: [],
    imageUrl: "",
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { data: products } = useProducts({ pageLimit: 2000 });
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const res = await getCollection({ id });
      if (!res) {
        toast.error("Collection non trouvée !");
        router.push("/admin/collections");
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
    setData((prevData) => ({
      ...prevData,
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

      console.log("📤 Upload de l'image de collection:", image.name);

      const res = await fetch("/api/uploadImage/collections", {
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
    if (!data?.title?.trim()) {
      toast.error("Le titre est requis");
      return false;
    }
    if (!data?.products || data?.products?.length === 0) {
      toast.error("Au moins un produit est requis");
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
      console.log("🚀 Création d'une nouvelle collection...");

      // Upload de l'image
      console.log("📤 Upload de l'image...");
      const imageUrl = await uploadImage();

      const collectionData = {
        title: data.title.trim(),
        subTitle: data.subTitle || "",
        products: data.products,
        imageUrl: imageUrl,
      };

      console.log("📝 Création de la collection:", collectionData);

      const result = await createNewCollection({ data: collectionData });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Collection créée avec succès !");

      // Reset du formulaire
      setData({
        title: "",
        subTitle: "",
        products: [],
        imageUrl: "",
      });
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
      console.log("🔄 Mise à jour de la collection...");

      // Upload de la nouvelle image si fournie
      const imageUrl = await uploadImage();

      const collectionData = {
        id: id,
        title: data.title.trim(),
        subTitle: data.subTitle || "",
        products: data.products,
        imageUrl: imageUrl,
      };

      console.log("📝 Mise à jour de la collection:", collectionData);

      const result = await updateCollection({ data: collectionData });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Collection mise à jour avec succès !");
      router.push("/admin/collections");
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
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
        {id ? "Modifier" : "Créer"} une collection
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Image Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Image {!id && <span className="text-red-500">*</span>}
          </label>

          {/* Aperçu de la nouvelle image */}
          {image && (
            <div className="flex justify-center items-center p-3 border rounded-lg bg-gray-50">
              <img
                className="h-20 object-contain"
                src={URL.createObjectURL(image)}
                alt="Aperçu"
              />
            </div>
          )}

          {/* Image actuelle (en mode édition) */}
          {!image && data?.imageUrl && (
            <div className="flex justify-center items-center p-3 border rounded-lg bg-gray-50">
              <img
                className="h-20 object-contain"
                src={data.imageUrl}
                alt="Image actuelle"
              />
            </div>
          )}

          <input
            onChange={(e) => {
              if (e.target.files.length > 0) {
                setImage(e.target.files[0]);
              }
            }}
            type="file"
            accept="image/*"
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Formats: JPEG, PNG, WebP • Max: 5MB
            {id && " • Laisser vide pour conserver l'image actuelle"}
          </p>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Entrer le titre"
            value={data?.title ?? ""}
            onChange={(e) => handleData("title", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            required
          />
        </div>

        {/* Sub Title */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">Sous-titre</label>
          <input
            type="text"
            value={data?.subTitle ?? ""}
            onChange={(e) => handleData("subTitle", e.target.value)}
            placeholder="Entrer le sous-titre"
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Products List */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 text-sm">
            Produits sélectionnés ({data?.products?.length || 0})
            <span className="text-red-500"> *</span>
          </label>
          <div className="flex flex-wrap gap-2 min-h-12">
            {data?.products?.map((productId) => (
              <ProductCard
                key={productId}
                productId={productId}
                onRemove={removeProduct}
              />
            ))}
            {(!data?.products || data.products.length === 0) && (
              <p className="text-gray-400 text-sm italic">
                Aucun produit sélectionné
              </p>
            )}
          </div>
        </div>

        {/* Product Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-sm">
            Ajouter un produit <span className="text-red-500">*</span>
          </label>
          <select
            onChange={(e) => {
              addProduct(e.target.value);
              e.target.value = ""; // Reset select
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
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
        className="hover:bg-blue-600 rounded-full p-1 transition-colors"
        disabled={!onRemove}
      >
        <X size={12} />
      </button>
    </div>
  );
}
