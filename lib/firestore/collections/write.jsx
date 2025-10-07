import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";

// ✅ CREATE NEW COLLECTION
export async function createNewCollection({ data }) {
  try {
    if (!data?.imageUrl) {
      throw new Error("L'image est requise");
    }
    if (!data?.title?.trim()) {
      throw new Error("Le titre est requis");
    }
    if (!data?.products || data?.products?.length === 0) {
      throw new Error("Au moins un produit est requis");
    }

    const collectionId = nanoid();

    const collectionData = {
      title: data.title.trim(),
      subTitle: data.subTitle || "",
      products: data.products,
      imageUrl: data.imageUrl,
      id: collectionId,
      timestampCreate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("📝 Création de la collection:", collectionData);

    await setDoc(doc(db, "collections", collectionId), collectionData);

    return { success: true, id: collectionId };
  } catch (error) {
    console.error("❌ Erreur création collection:", error);
    return { error: error.message };
  }
}

// ✅ UPDATE COLLECTION
export async function updateCollection({ data }) {
  try {
    if (!data.id) {
      throw new Error("ID de collection requis");
    }
    if (!data?.title?.trim()) {
      throw new Error("Le titre est requis");
    }
    if (!data?.products || data?.products?.length === 0) {
      throw new Error("Au moins un produit est requis");
    }
    if (!data?.imageUrl) {
      throw new Error("L'image est requise");
    }

    console.log("📝 Mise à jour de la collection:", data.id, data);

    const collectionRef = doc(db, "collections", data.id);

    await updateDoc(collectionRef, {
      title: data.title.trim(),
      subTitle: data.subTitle || "",
      products: data.products,
      imageUrl: data.imageUrl,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur mise à jour collection:", error);
    return { error: error.message };
  }
}

// ✅ DELETE COLLECTION
export async function deleteCollection({ id }) {
  try {
    if (!id) {
      throw new Error("ID de collection requis");
    }

    console.log("🗑️ Suppression de la collection:", id);

    await deleteDoc(doc(db, "collections", id));

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur suppression collection:", error);
    return { error: error.message };
  }
}
