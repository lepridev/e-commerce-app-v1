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
    category: "", // Ajouter ce champ
    brand: "", // Ajouter ce champ
    isFeatured: false,
    shortDescription: "",
  });
  const [featureImage, setFeatureImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ajouter les hooks pour récupérer brands et categories
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

  // Effet pour mettre à jour automatiquement les noms quand les IDs changent
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

  // Fonction pour uploader une image vers Cloudinary
  const uploadImage = async (file) => {
    if (!file) throw new Error("No image selected");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploadImage/products", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Image upload failed");

    return result.url;
  };

  // Fonction pour uploader plusieurs images
  const uploadMultipleImages = async (files) => {
    const uploadPromises = files.map((file) => uploadImage(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      // Validation des champs requis
      if (!data?.title || !data?.price) {
        toast.error("Title and Price are required");
        setIsLoading(false);
        return;
      }
      if (!data?.categoryId || !data?.brandId) {
        toast.error("Category and Brand are required");
        setIsLoading(false);
        return;
      }
      if (!featureImage) {
        toast.error("Feature image is required");
        setIsLoading(false);
        return;
      }

      // Upload de l'image principale
      const featureImageUrl = await uploadImage(featureImage);

      // Upload des images de la galerie
      const galleryImageUrls =
        imageList.length > 0 ? await uploadMultipleImages(imageList) : [];

      console.log("Creating product with:", {
        brandId: data.brandId,
        brand: data.brand,
        categoryId: data.categoryId,
        category: data.category,
      });

      // Création du produit avec tous les champs
      await createNewProduct({
        data: {
          ...data,
          featureImage: featureImageUrl,
          images: galleryImageUrls,
          price: Number(data.price),
          salePrice: Number(data.salePrice),
          stock: Number(data.stock),
          isFeatured: Boolean(data.isFeatured),
          // brand et category sont déjà dans data grâce aux useEffect
        },
      });

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
      toast.success("Product is successfully Created!");
    } catch (error) {
      console.log("Error creating product:", error?.message);
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Validation des champs requis
      if (!data?.title || !data?.price) {
        toast.error("Title and Price are required");
        setIsLoading(false);
        return;
      }
      if (!data?.categoryId || !data?.brandId) {
        toast.error("Category and Brand are required");
        setIsLoading(false);
        return;
      }

      let featureImageUrl = data.featureImage;
      let galleryImageUrls = data.images || [];

      // Upload de la nouvelle image principale si fournie
      if (featureImage) {
        featureImageUrl = await uploadImage(featureImage);
      }

      // Upload des nouvelles images de galerie si fournies
      if (imageList.length > 0) {
        const newGalleryUrls = await uploadMultipleImages(imageList);
        galleryImageUrls = [...galleryImageUrls, ...newGalleryUrls];
      }

      console.log("Updating product with:", {
        brandId: data.brandId,
        brand: data.brand,
        categoryId: data.categoryId,
        category: data.category,
      });

      // Mise à jour du produit avec tous les champs
      await updateProduct({
        data: {
          ...data,
          featureImage: featureImageUrl,
          images: galleryImageUrls,
          price: Number(data.price),
          salePrice: Number(data.salePrice),
          stock: Number(data.stock),
          isFeatured: Boolean(data.isFeatured),
          // brand et category sont déjà dans data grâce aux useEffect
        },
      });

      toast.success("Product is successfully Updated!");
      router.push(`/admin/products`);
    } catch (error) {
      console.log("Error updating product:", error?.message);
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (id) {
          handleUpdate();
        } else {
          handleCreate();
        }
      }}
      className="flex flex-col gap-4 p-5"
    >
      <div className="flex justify-between w-full items-center">
        <h1 className="font-semibold text-xl">
          {id ? "Update Product" : "Create New Product"}
        </h1>
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          type="submit"
          color="primary"
        >
          {id ? "Update" : "Create"}
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

          {/* Section pour afficher les noms sélectionnés */}
          <div className="bg-gray-50 rounded-xl p-4 border">
            <h2 className="font-semibold mb-3">Selected Values</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-xs">Selected Brand</label>
                <p className="font-medium">{data.brand || "Not selected"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">
                  Selected Category
                </label>
                <p className="font-medium">{data.category || "Not selected"}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">Brand ID</label>
                <p className="font-medium text-sm">
                  {data.brandId || "Not selected"}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">Category ID</label>
                <p className="font-medium text-sm">
                  {data.categoryId || "Not selected"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
