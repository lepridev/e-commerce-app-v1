import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";

// ✅ CREATE NEW CATEGORY
export async function createNewCategory({ data }) {
  try {
    const categoryId = nanoid();

    const categoryData = {
      name: data.name,
      slug: data.slug,
      imageUrl: data.imageUrl || null,
      id: categoryId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("📝 Création de la catégorie:", categoryData);

    await setDoc(doc(db, "categories", categoryId), categoryData);

    return { success: true, id: categoryId };
  } catch (error) {
    console.error("❌ Erreur création catégorie:", error);
    return { error: error.message };
  }
}

// ✅ UPDATE CATEGORY
export async function updateCategory({ data }) {
  try {
    if (!data.id) {
      throw new Error("ID de catégorie requis");
    }

    console.log("📝 Mise à jour de la catégorie:", data.id, data);

    const categoryRef = doc(db, "categories", data.id);

    await updateDoc(categoryRef, {
      name: data.name,
      slug: data.slug,
      imageUrl: data.imageUrl,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur mise à jour catégorie:", error);
    return { error: error.message };
  }
}

// ✅ DELETE CATEGORY
export async function deleteCategory({ id }) {
  try {
    if (!id) {
      throw new Error("ID de catégorie requis");
    }

    console.log("🗑️ Suppression de la catégorie:", id);

    await deleteDoc(doc(db, "categories", id));

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression catégorie:", error);
    return { error: error.message };
  }
}
