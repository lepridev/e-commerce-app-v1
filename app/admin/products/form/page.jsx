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
        // Pré-remplir les images existantes
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

  // ✅ FONCTION UPLOAD CORRECTE - ADAPTÉE À VOTRE API
  const uploadImage = async (file) => {
    if (!file) throw new Error("No image selected");

    try {
      // Si c'est déjà une URL (image existante), la retourner directement
      if (typeof file === "string") {
        return file;
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Uploading image:", file.name);

      const res = await fetch("/api/uploadImage/products", {
        method: "POST",
        body: formData,
      });

      // ✅ VÉRIFIER LE STATUT HTTP
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Upload failed with status: ${res.status}`
        );
      }

      const result = await res.json();
      console.log("📥 Upload response:", result);

      // ✅ VOTRE API RETOURNE { url: "..." } - UTILISER result.url
      if (!result.url) {
        console.error(
          "❌ No URL in response. Available fields:",
          Object.keys(result)
        );
        throw new Error("Upload response missing URL");
      }

      console.log("✅ Upload successful:", result.url);
      return result.url;
    } catch (error) {
      console.error("❌ Upload error:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  // ✅ FONCTION UPLOAD MULTIPLE CORRECTE
  const uploadMultipleImages = async (files) => {
    try {
      // Filtrer les URLs existantes
      const existingUrls = files.filter((file) => typeof file === "string");

      // Filtrer les nouveaux fichiers à uploader
      const newFiles = files.filter((file) => typeof file !== "string");

      if (newFiles.length === 0) {
        return existingUrls;
      }

      console.log(`📤 Uploading ${newFiles.length} new images...`);

      const uploadPromises = newFiles.map((file) => uploadImage(file));
      const newUrls = await Promise.all(uploadPromises);

      const allUrls = [...existingUrls, ...newUrls].filter((url) => url);

      console.log(`✅ All images uploaded: ${allUrls.length} total`);
      return allUrls;
    } catch (error) {
      console.error("❌ Multiple upload error:", error);
      throw error;
    }
  };

  // ✅ FONCTION CREATE CORRECTE
  const handleCreate = async () => {
    setIsLoading(true);

    try {
      // Validation des champs requis
      if (!data?.title?.trim()) {
        toast.error("Le titre est requis");
        setIsLoading(false);
        return;
      }
      if (!data?.price || isNaN(data.price) || data.price <= 0) {
        toast.error("Un prix valide est requis");
        setIsLoading(false);
        return;
      }
      if (!data?.categoryId) {
        toast.error("La catégorie est requise");
        setIsLoading(false);
        return;
      }
      if (!data?.brandId) {
        toast.error("La marque est requise");
        setIsLoading(false);
        return;
      }
      if (!featureImage) {
        toast.error("L'image principale est requise");
        setIsLoading(false);
        return;
      }

      console.log("🚀 Starting product creation...");

      // Upload de l'image principale
      console.log("📤 Uploading feature image...");
      const featureImageUrl = await uploadImage(featureImage);

      // Upload des images de la galerie
      console.log("📤 Uploading gallery images...");
      const galleryImageUrls =
        imageList.length > 0 ? await uploadMultipleImages(imageList) : [];

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

      console.log("📝 Creating product with data:", productData);

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
      console.error("❌ Error creating product:", error);
      toast.error(error.message || "Échec de la création du produit");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FONCTION UPDATE CORRECTE
  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      // Validation des champs requis
      if (!data?.title?.trim()) {
        toast.error("Le titre est requis");
        setIsLoading(false);
        return;
      }
      if (!data?.price || isNaN(data.price) || data.price <= 0) {
        toast.error("Un prix valide est requis");
        setIsLoading(false);
        return;
      }
      if (!data?.categoryId) {
        toast.error("La catégorie est requise");
        setIsLoading(false);
        return;
      }
      if (!data?.brandId) {
        toast.error("La marque est requise");
        setIsLoading(false);
        return;
      }

      console.log("🔄 Starting product update...");

      let featureImageUrl = data.featureImage;
      let galleryImageUrls = data.images || [];

      // Upload de la nouvelle image principale si fournie (et si c'est un nouveau fichier)
      if (featureImage && typeof featureImage !== "string") {
        console.log("📤 Uploading new feature image...");
        featureImageUrl = await uploadImage(featureImage);
      }

      // Upload des nouvelles images de galerie
      if (imageList.length > 0) {
        console.log("📤 Processing gallery images...");
        galleryImageUrls = await uploadMultipleImages(imageList);
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

      console.log("📝 Updating product with data:", productData);

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
      console.error("❌ Error updating product:", error);
      toast.error(error.message || "Échec de la mise à jour du produit");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ GESTION DE LA SOUMISSION DU FORMULAIRE
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
      console.error("❌ Form submission error:", error);
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
        {/* Colonne de gauche - Détails de base */}
        <div className="flex-1 flex">
          <BasicDetails
            data={data}
            handleData={handleData}
            brands={brands}
            categories={categories}
          />
        </div>

        {/* Colonne de droite - Images et description */}
        <div className="flex-1 flex flex-col gap-5 h-full">
          <Images
            data={data}
            featureImage={featureImage}
            setFeatureImage={setFeatureImage}
            imageList={imageList}
            setImageList={setImageList}
          />

          <Description data={data} handleData={handleData} />

          {/* Section de débogage (optionnelle) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 rounded-xl p-4 border">
              <h2 className="font-semibold mb-3 text-sm">Debug Information</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-500">Brand ID</label>
                  <p className="font-medium truncate">
                    {data.brandId || "Non sélectionné"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500">Category ID</label>
                  <p className="font-medium truncate">
                    {data.categoryId || "Non sélectionné"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500">Feature Image</label>
                  <p className="font-medium truncate text-xs">
                    {featureImage
                      ? typeof featureImage === "string"
                        ? "✅ Existante"
                        : "📤 Nouveau fichier"
                      : "❌ Non définie"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500">Gallery Images</label>
                  <p className="font-medium">{imageList.length} image(s)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
