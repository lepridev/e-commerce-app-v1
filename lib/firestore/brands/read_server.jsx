import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Get all brands
export const getBrands = async () => {
  const snapshot = await getDocs(collection(db, "brands"));

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null, // ✅ conversion
      updatedAt: data.updatedAt?.toDate().toISOString() || null, // ✅ conversion
    };
  });
};

// Get a single brand
export const getBrand = async ({ id }) => {
  const ref = doc(db, "brands", id);
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
