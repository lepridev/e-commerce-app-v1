"use client";

import Link from "next/link";
import ListView from "./components/ListView";
import { useOrders } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";

export default function Page() {
  // Ajouter { admin: true } pour récupérer toutes les commandes
  const { data: orders, error, isLoading } = useOrders({ admin: true });

  console.log("orders", orders);

  if (isLoading) {
    return (
      <main className="flex flex-col gap-4 p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        </div>
        <div className="flex justify-center items-center py-20">
          <CircularProgress size="lg" />
          <span className="ml-3 text-gray-600">
            Chargement des commandes...
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col gap-4 p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <div className="text-sm text-gray-600">
          {orders?.length || 0} commande(s) trouvée(s)
        </div>
      </div>

      {/* Passez les orders en props à ListView */}
      <ListView orders={orders} />
    </main>
  );
}
