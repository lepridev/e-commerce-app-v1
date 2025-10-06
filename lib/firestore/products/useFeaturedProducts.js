import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function useFeaturedProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isFeatured", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) setData(products);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false; // empêche les mises à jour après un unmount
    };
  }, []);

  return { data, loading };
}
