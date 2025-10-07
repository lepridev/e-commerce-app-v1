import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";

export const createNewProduct = async ({ data }) => {
  try {
    console.log("Creating product with data:", data);

    // ✅ Validation améliorée
    if (!data.title?.trim()) {
      throw new Error("Product title is required");
    }

    if (!data.price || isNaN(data.price)) {
      throw new Error("Valid price is required");
    }

    const productId = nanoid();

    const productData = {
      id: productId,
      title: data.title.trim(),
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      categoryId: data.categoryId || "",
      category: data.category || "",
      description: data.description?.trim() || "",
      shortDescription: data.shortDescription?.trim() || "",
      featureImage: data.featureImage || "",
      brandId: data.brandId || "",
      brand: data.brand || "",
      images: Array.isArray(data.images) ? data.images : [],
      salePrice: data.salePrice ? Number(data.salePrice) : 0,
      isFeatured: Boolean(data.isFeatured),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "products", productId), productData);

    console.log("Product created successfully with ID:", productId);
    return { success: true, id: productId };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error; // ✅ Propager l'erreur pour la gérer dans l'API
  }
};

export const updateProduct = async ({ data }) => {
  try {
    if (!data.id) {
      throw new Error("Product ID is required");
    }

    const productRef = doc(db, "products", data.id);

    // ✅ Vérifier que le produit existe
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error("Product not found");
    }

    const updateData = {
      updatedAt: serverTimestamp(),
    };

    // ✅ Mettre à jour seulement les champs fournis
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined)
      updateData.description = data.description.trim();
    if (data.shortDescription !== undefined)
      updateData.shortDescription = data.shortDescription.trim();
    if (data.featureImage !== undefined)
      updateData.featureImage = data.featureImage;
    if (data.brandId !== undefined) updateData.brandId = data.brandId;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.images !== undefined)
      updateData.images = Array.isArray(data.images) ? data.images : [];
    if (data.salePrice !== undefined)
      updateData.salePrice = Number(data.salePrice);
    if (data.isFeatured !== undefined)
      updateData.isFeatured = Boolean(data.isFeatured);

    await updateDoc(productRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async ({ id }) => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const productRef = doc(db, "products", id);

    // ✅ Vérifier que le produit existe
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error("Product not found");
    }

    await deleteDoc(productRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
