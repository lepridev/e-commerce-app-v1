import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const deleteOrder = async (orderId) => {
  try {
    await deleteDoc(doc(db, "orders", orderId));
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    throw error;
  }
};
