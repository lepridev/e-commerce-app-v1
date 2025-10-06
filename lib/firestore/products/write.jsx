// lib/firestore/products/write.js
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

    const productId = nanoid();

    const productData = {
      id: productId,
      title: data.title || "",
      price: Number(data.price) || 0,
      stock: Number(data.stock) || 0,
      categoryId: data.categoryId || "",
      category: data.category || "",
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      featureImage: data.featureImage || "",
      brandId: data.brandId || "",
      brand: data.brand || "",
      images: Array.isArray(data.images) ? data.images : [],
      salePrice: Number(data.salePrice) || 0,
      isFeatured: Boolean(data.isFeatured) || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "products", productId), productData);
    console.log("Product created successfully with ID:", productId);
    return { success: true, id: productId };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: error.message };
  }
};

export const updateProduct = async ({ data }) => {
  try {
    if (!data.id) throw new Error("Product ID is required");

    const productRef = doc(db, "products", data.id);

    const updateData = {
      title: data.title,
      price: Number(data.price),
      stock: Number(data.stock),
      categoryId: data.categoryId,
      category: data.category || "",
      description: data.description,
      shortDescription: data.shortDescription,
      featureImage: data.featureImage,
      brandId: data.brandId,
      brand: data.brand || "",
      images: Array.isArray(data.images) ? data.images : [],
      salePrice: Number(data.salePrice),
      isFeatured: Boolean(data.isFeatured),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(productRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: error.message };
  }
};

export const deleteProduct = async ({ id }) => {
  if (!id) throw new Error("Product ID is required");
  try {
    await deleteDoc(doc(db, "products", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: error.message };
  }
};
