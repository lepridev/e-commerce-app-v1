"use client";

import { useEffect, useState } from "react";
import BasicDetails from "./components/BasicDetails";
import Images from "./components/Images";
import Description from "./components/Description";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import {
  createNewProduct,
  updateProduct,
} from "@/lib/firestore/products/write";
import { useRouter, useSearchParams } from "next/navigation";
import { getProduct } from "@/lib/firestore/products/read_server";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";

export default function Page() {
  const [data, setData] = useState({
    title: "",
    description: "",
    price: 0,
    salePrice: 0,
    stock: 0,
    categoryId: "",
    brandId: "",
    category: "",
    brand: "",
    isFeatured: false,
    shortDescription: "",
  });
  const [featureImage, setFeatureImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const fetchData = async () => {
    try {
      const res = await getProduct({ id: id });
      if (!res) {
        throw new Error("Product Not Found");
      } else {
        setData(res);
        if (res.featureImage) {
          setFeatureImage(res.featureImage);
        }
        if (res.images && res.images.length > 0) {
          setImageList(res.images);
        }
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

  useEffect(() => {
    if (data.brandId) {
      const selectedBrand = brands.find((brand) => brand.id === data.brandId);
      if (selectedBrand) {
        setData((prev) => ({ ...prev, brand: selectedBrand.name }));
      }
    }
  }, [data.brandId, brands]);

  useEffect(() => {
    if (data.categoryId) {
      const selectedCategory = categories.find(
        (category) => category.id === data.categoryId
      );
      if (selectedCategory) {
        setData((prev) => ({ ...prev, category: selectedCategory.name }));
      }
    }
  }, [data.categoryId, categories]);

  const handleData = (key, value) => {
    setData((prevData) => {
      return {
        ...(prevData ?? {}),
        [key]: value,
      };
    });
  };

  // ✅ FONCTION UPLOAD ROBUSTE POUR LA PRODUCTION
  const uploadImage = async (file) => {
    if (!file) throw new Error("Aucune image sélectionnée");

    try {
      // Si c'est déjà une URL, la retourner directement
      if (typeof file === "string") {
        return file;
      }

      // Validation du fichier
      if (!file.type.startsWith("image/")) {
        throw new Error("Le fichier doit être une image");
      }

      // Limite de taille (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("L'image est trop volumineuse (max 5MB)");
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Upload de l'image:", file.name, "Taille:", file.size);

      const res = await fetch("/api/uploadImage/products", {
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
          // Si la réponse n'est pas du JSON, essayer de récupérer le texte
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

      // Messages d'erreur plus explicites
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

  // ✅ FONCTION UPLOAD MULTIPLE AVEC GESTION D'ERREURS
  const uploadMultipleImages = async (files) => {
    try {
      const existingUrls = files.filter((file) => typeof file === "string");
      const newFiles = files.filter((file) => typeof file !== "string");

      if (newFiles.length === 0) {
        return existingUrls;
      }

      console.log(`📤 Upload de ${newFiles.length} nouvelles images...`);

      // Upload séquentiel pour éviter de surcharger le serveur
      const newUrls = [];
      for (const file of newFiles) {
        try {
          const url = await uploadImage(file);
          newUrls.push(url);
        } catch (error) {
          console.error(`❌ Échec de l'upload d'une image:`, error);
          // Continuer avec les autres images même si une échoue
          toast.error(`Échec de l'upload d'une image: ${error.message}`);
        }
      }

      const allUrls = [...existingUrls, ...newUrls].filter((url) => url);

      if (allUrls.length === 0) {
        throw new Error("Aucune image n'a pu être uploadée");
      }

      console.log(`✅ Upload terminé: ${allUrls.length} images`);
      return allUrls;
    } catch (error) {
      console.error("❌ Erreur d'upload multiple:", error);
      throw error;
    }
  };

  // ✅ VALIDATION DES DONNÉES
  const validateForm = () => {
    if (!data?.title?.trim()) {
      toast.error("Le titre est requis");
      return false;
    }
    if (!data?.price || isNaN(data.price) || data.price <= 0) {
      toast.error("Un prix valide est requis");
      return false;
    }
    if (!data?.categoryId) {
      toast.error("La catégorie est requise");
      return false;
    }
    if (!data?.brandId) {
      toast.error("La marque est requise");
      return false;
    }
    if (!featureImage) {
      toast.error("L'image principale est requise");
      return false;
    }
    return true;
  };

  // ✅ FONCTION CREATE AVEC GESTION D'ERREURS AMÉLIORÉE
  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    let uploadSuccess = false;

    try {
      console.log("🚀 Début de la création du produit...");

      // Upload de l'image principale
      console.log("📤 Upload de l'image principale...");
      const featureImageUrl = await uploadImage(featureImage);

      // Upload des images de la galerie
      console.log("📤 Upload des images de la galerie...");
      const galleryImageUrls =
        imageList.length > 0 ? await uploadMultipleImages(imageList) : [];

      uploadSuccess = true;

      const productData = {
        title: data.title.trim(),
        description: data.description || "",
        shortDescription: data.shortDescription || "",
        price: Number(data.price),
        salePrice: Number(data.salePrice) || 0,
        stock: Number(data.stock) || 0,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: Boolean(data.isFeatured),
        featureImage: featureImageUrl,
        images: galleryImageUrls,
      };

      console.log("📝 Création du produit avec les données:", productData);

      // Création du produit
      const result = await createNewProduct({
        data: productData,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Reset du formulaire
      setData({
        title: "",
        description: "",
        price: 0,
        salePrice: 0,
        stock: 0,
        categoryId: "",
        brandId: "",
        category: "",
        brand: "",
        isFeatured: false,
        shortDescription: "",
      });
      setFeatureImage(null);
      setImageList([]);

      toast.success("✅ Produit créé avec succès !");
      router.push("/admin/products");
    } catch (error) {
      console.error("❌ Erreur lors de la création du produit:", error);

      let errorMessage = error.message;
      if (!uploadSuccess) {
        errorMessage = "Échec de l'upload des images: " + errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FONCTION UPDATE AVEC GESTION D'ERREURS AMÉLIORÉE
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    let uploadSuccess = true;

    try {
      console.log("🔄 Début de la mise à jour du produit...");

      let featureImageUrl = data.featureImage;
      let galleryImageUrls = data.images || [];

      // Upload de la nouvelle image principale si fournie
      if (featureImage && typeof featureImage !== "string") {
        console.log("📤 Upload de la nouvelle image principale...");
        try {
          featureImageUrl = await uploadImage(featureImage);
        } catch (error) {
          uploadSuccess = false;
          throw error;
        }
      }

      // Upload des nouvelles images de galerie
      if (imageList.length > 0) {
        console.log("📤 Traitement des images de la galerie...");
        try {
          galleryImageUrls = await uploadMultipleImages(imageList);
        } catch (error) {
          uploadSuccess = false;
          throw error;
        }
      }

      const productData = {
        id: id,
        title: data.title.trim(),
        description: data.description || "",
        shortDescription: data.shortDescription || "",
        price: Number(data.price),
        salePrice: Number(data.salePrice) || 0,
        stock: Number(data.stock) || 0,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: Boolean(data.isFeatured),
        featureImage: featureImageUrl,
        images: galleryImageUrls,
      };

      console.log("📝 Mise à jour du produit avec les données:", productData);

      // Mise à jour du produit
      const result = await updateProduct({
        data: productData,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Produit mis à jour avec succès !");
      router.push("/admin/products");
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du produit:", error);

      let errorMessage = error.message;
      if (!uploadSuccess) {
        errorMessage = "Échec de l'upload des images: " + errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ GESTION DE LA SOUMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    try {
      if (id) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } catch (error) {
      console.error("❌ Erreur de soumission du formulaire:", error);
      toast.error("Erreur lors de la soumission du formulaire");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
      <div className="flex justify-between w-full items-center">
        <h1 className="font-semibold text-xl">
          {id ? "Modifier le produit" : "Créer un nouveau produit"}
        </h1>
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          type="submit"
          color="primary"
          className="min-w-24"
        >
          {id ? "Modifier" : "Créer"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 flex">
          <BasicDetails
            data={data}
            handleData={handleData}
            brands={brands}
            categories={categories}
          />
        </div>

        <div className="flex-1 flex flex-col gap-5 h-full">
          <Images
            data={data}
            featureImage={featureImage}
            setFeatureImage={setFeatureImage}
            imageList={imageList}
            setImageList={setImageList}
          />

          <Description data={data} handleData={handleData} />

          {/* Indicateur de statut */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                }`}
              ></div>
              <p className="text-sm text-blue-700">
                {isLoading ? "Upload en cours..." : "Prêt pour l'upload"}
              </p>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Formats supportés: JPEG, PNG, WebP • Max: 5MB par image
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
