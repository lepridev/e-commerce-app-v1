import { db } from "@/lib/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";

// Récupérer un produit par ID
export const getProduct = async ({ id }) => {
  const productRef = ref(db, `products/${id}`);
  const snapshot = await get(productRef);

  if (snapshot.exists()) {
    return { id, ...snapshot.val() };
  }
  return null;
};

// Récupérer les produits en vedette
export const getFeaturedProducts = async () => {
  const productsRef = ref(db, "products");
  const q = query(productsRef, orderByChild("isFeatured"), equalTo(true));
  const snapshot = await get(q);

  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, product]) => ({
    id,
    ...product,
  }));
};

// Récupérer tous les produits triés par date
export const getProducts = async () => {
  const productsRef = ref(db, "products");
  const q = query(productsRef, orderByChild("timestampCreate"));
  const snapshot = await get(q);

  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val())
    .sort((a, b) => b[1].timestampCreate - a[1].timestampCreate) // tri descendant
    .map(([id, product]) => ({
      id,
      ...product,
    }));
};

// Récupérer les produits par catégorie
export const getProductsByCategory = async ({ categoryId }) => {
  const productsRef = ref(db, "products");
  const q = query(productsRef, orderByChild("categoryId"));
  const snapshot = await get(q);

  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val())
    .filter(([id, product]) => product.categoryId === categoryId)
    .map(([id, product]) => ({
      id,
      ...product,
    }));
};

// Récupérer collections
export const getCollections = async () => {
  const collectionsRef = ref(db, "collections");
  const snapshot = await get(collectionsRef);

  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, collection]) => ({
    id,
    ...collection,
  }));
};

// Récupérer catégories
export const getCategories = async () => {
  const categoriesRef = ref(db, "categories");
  const snapshot = await get(categoriesRef);

  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, category]) => ({
    id,
    ...category,
  }));
};

// Récupérer marques
export const getBrands = async () => {
  const brandsRef = ref(db, "brands");
  const snapshot = await get(brandsRef);

  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, brand]) => ({
    id,
    ...brand,
  }));
};
