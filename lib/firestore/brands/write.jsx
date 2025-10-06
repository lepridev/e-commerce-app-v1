import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc, // ✅ ajoute ceci
} from "firebase/firestore";
import { nanoid } from "nanoid";

// Create new brand
export async function createNewBrand({ data }) {
  try {
    const brandId = nanoid(); // ID unique
    await setDoc(doc(db, "brands", brandId), {
      ...data,
      id: brandId,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: brandId };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { error: error.message };
  }
}

// Update brand
export const updateBrand = async ({ data }) => {
  try {
    if (!data.id) throw new Error("Brand ID is required");

    const brandRef = doc(db, "brands", data.id);
    await updateDoc(brandRef, {
      name: data.name,
      imageUrl: data.imageUrl || null,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
};

// Delete brand
export async function deleteBrand({ id }) {
  if (!id) throw new Error("Brand ID is required");
  try {
    await deleteDoc(doc(db, "brands", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { error: error.message };
  }
}
