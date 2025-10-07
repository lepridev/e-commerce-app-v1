import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { nanoid } from "nanoid";

// Create new brand
export async function createNewBrand({ data }) {
  try {
    const brandId = nanoid();

    const brandData = {
      name: data.name,
      imageUrl: data.imageUrl || null,
      id: brandId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("📝 Création de la marque:", brandData);

    await setDoc(doc(db, "brands", brandId), brandData);

    return { success: true, id: brandId };
  } catch (error) {
    console.error("❌ Erreur création marque:", error);
    return { error: error.message };
  }
}

// Update brand
export const updateBrand = async ({ data }) => {
  try {
    if (!data.id) {
      throw new Error("ID de marque requis");
    }

    console.log("📝 Mise à jour de la marque:", data.id, data);

    const brandRef = doc(db, "brands", data.id);

    await updateDoc(brandRef, {
      name: data.name,
      imageUrl: data.imageUrl,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur mise à jour marque:", error);
    throw error;
  }
};

// Delete brand
export async function deleteBrand({ id }) {
  try {
    if (!id) {
      throw new Error("ID de marque requis");
    }

    console.log("🗑️ Suppression de la marque:", id);

    await deleteDoc(doc(db, "brands", id));

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression marque:", error);
    return { error: error.message };
  }
}
