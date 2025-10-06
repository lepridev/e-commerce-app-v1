// hooks/useSendOrder.js
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const useSendOrder = () => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendOrderToFirestore = async (orderData) => {
    setIsSending(true);
    setError(null);

    try {
      const orderWithMetadata = {
        ...orderData,
        status: "pending",
        paymentMode: "whatsapp",
        timestampCreate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderWithMetadata);
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return { sendOrderToFirestore, isSending, error };
};
