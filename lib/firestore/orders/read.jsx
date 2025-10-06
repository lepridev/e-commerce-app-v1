import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  onSnapshot as onDocSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Hook pour récupérer les commandes avec écoute en temps réel
export function useOrders({ uid, admin = false } = {}) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const subscribeToOrders = () => {
      try {
        let q;

        if (admin) {
          // Query pour l'admin - toutes les commandes
          q = query(
            collection(db, "orders"),
            orderBy("timestampCreate", "desc")
          );
        } else if (uid) {
          // Query pour un utilisateur spécifique
          q = query(
            collection(db, "orders"),
            where("uid", "==", uid),
            orderBy("timestampCreate", "desc")
          );
        } else {
          setData([]);
          setIsLoading(false);
          return;
        }

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setData(orders);
            setError(null);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error fetching orders:", err);
            setError(err.message);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up subscription:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    subscribeToOrders();

    // Nettoyer l'abonnement
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [uid, admin]);

  return {
    data,
    error,
    isLoading,
  };
}

// Hook pour récupérer une commande spécifique avec écoute en temps réel
export function useOrder({ id } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onDocSnapshot(
      doc(db, "orders", id),
      (snapshot) => {
        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching order:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return {
    data,
    error,
    isLoading,
  };
}
