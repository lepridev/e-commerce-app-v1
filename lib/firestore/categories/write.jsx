// lib/firestore/categories/write.js
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";

// ✅ Create new category
export async function createNewCategory({ data }) {
  try {
    const categoryId = nanoid(); // ID unique généré
    await setDoc(doc(db, "categories", categoryId), {
      ...data,
      id: categoryId, // on stocke l'id dans le doc
      createdAt: serverTimestamp(),
    });
    return { success: true, id: categoryId };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: error.message };
  }
}

// ✅ Update category
export async function updateCategory({ data }) {
  try {
    if (!data.id) throw new Error("Category ID is required");

    const categoryRef = doc(db, "categories", data.id);
    await updateDoc(categoryRef, {
      name: data.name,
      slug: data.slug,
      imageUrl: data.imageUrl || null,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: error.message };
  }
}

// ✅ Delete category
export async function deleteCategory({ id }) {
  if (!id) throw new Error("Category ID is required");
  try {
    await deleteDoc(doc(db, "categories", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }
}
