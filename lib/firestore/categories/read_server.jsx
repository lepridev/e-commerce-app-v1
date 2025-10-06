import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Get all categories
export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, "categories"));

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null,
      updatedAt: data.updatedAt?.toDate().toISOString() || null,
    };
  });
};

// Get a single category
export const getCategory = async ({ id }) => {
  const ref = doc(db, "categories", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString() || null,
    updatedAt: data.updatedAt?.toDate().toISOString() || null,
  };
};
