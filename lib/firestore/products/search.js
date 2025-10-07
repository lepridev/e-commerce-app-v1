import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const searchProducts = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    const products = [];
    const searchTermLower = searchTerm.toLowerCase().trim();

    querySnapshot.forEach((doc) => {
      const productData = doc.data();

      // Normaliser les données
      const title = (productData.title || "").toLowerCase();
      const description = (productData.description || "").toLowerCase();
      const shortDescription = (
        productData.shortDescription || ""
      ).toLowerCase();
      const categoryId = (productData.categoryId || "").toLowerCase();
      const brand = (productData.brand || "").toLowerCase();

      // Recherche insensible à la casse
      const matchesTitle = title.includes(searchTermLower);
      const matchesDescription = description.includes(searchTermLower);
      const matchesShortDescription =
        shortDescription.includes(searchTermLower);
      const matchesCategory = categoryId.includes(searchTermLower);
      const matchesBrand = brand.includes(searchTermLower);

      if (
        matchesTitle ||
        matchesDescription ||
        matchesShortDescription ||
        matchesCategory ||
        matchesBrand
      ) {
        products.push({
          id: doc.id,
          ...productData,
        });
      }
    });

    return products;
  } catch (error) {
    console.error("Erreur recherche:", error);
    return [];
  }
};
