import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const GET = async () => {
  try {
    const brandsSnapshot = await getDocs(collection(db, "brands"));
    const categoriesSnapshot = await getDocs(collection(db, "categories"));

    const brands = brandsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify({ brands, categories }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
