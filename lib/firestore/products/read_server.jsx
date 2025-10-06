// lib/firestore/products/read_server.js
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Fonction utilitaire pour convertir les Timestamps
const convertTimestamps = (data) => {
  if (!data) return null;

  const converted = { ...data };

  Object.keys(converted).forEach((key) => {
    if (
      converted[key] &&
      typeof converted[key] === "object" &&
      "toDate" in converted[key]
    ) {
      converted[key] = {
        seconds: converted[key].seconds,
        nanoseconds: converted[key].nanoseconds,
      };
    }
  });

  return converted;
};

// 🔹 Tous les produits
export const getProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return products.map((product) => convertTimestamps(product));
  } catch (error) {
    console.error("❌ Erreur récupération produits:", error);
    return [];
  }
};

// 🔹 Produits en vedette
export const getFeaturedProducts = async () => {
  try {
    const q = query(
      collection(db, "products"),
      where("isFeatured", "==", true)
    );

    const querySnapshot = await getDocs(q);

    const featuredProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Produits mis en avant (server) :", featuredProducts);

    return featuredProducts.map((product) => convertTimestamps(product));
  } catch (error) {
    console.error("Erreur getFeaturedProducts:", error);
    return [];
  }
};

// 🔹 Récupérer un produit par ID
export async function getProduct({ id }) {
  try {
    if (!id) return null;

    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      return convertTimestamps(data);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
}

// 🔹 Produits par catégorie - NOUVELLE FONCTION
export const getProductsByCategory = async ({ categoryId }) => {
  try {
    if (!categoryId) return [];

    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("categoryId", "==", categoryId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const products = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return products.map((product) => convertTimestamps(product));
  } catch (error) {
    console.error("❌ Erreur récupération produits par catégorie:", error);
    return [];
  }
};
