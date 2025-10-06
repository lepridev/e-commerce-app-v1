"use client";

import { useOrder } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";
import { useParams } from "next/navigation";
import ChangeOrderStatus from "./components/ChangeStatus";

export default function Page() {
  const { orderId } = useParams();
  const { data: order, error, isLoading } = useOrder({ id: orderId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <CircularProgress size="lg" />
        <span className="ml-3 text-gray-600">Chargement de la commande...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <p className="text-lg font-semibold">Commande non trouvée</p>
          <p className="text-gray-600">La commande #{orderId} n'existe pas.</p>
        </div>
      </div>
    );
  }

  // Calcul du montant total - utilisez maintenant order.totalAmount directement
  const totalAmount =
    order?.totalAmount ||
    order?.checkout?.line_items?.reduce((prev, curr) => {
      return prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity;
    }, 0);

  // L'adresse est maintenant directement dans order.address, pas besoin de parsing JSON
  const address = order?.address || {};

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête de la commande */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Détails de la Commande
          </h1>
          <p className="text-gray-600 mt-1">N° de commande: {orderId}</p>
        </div>
        <ChangeOrderStatus order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Détails de la commande */}
        <div className="space-y-6">
          {/* Informations de la commande */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations de la Commande
            </h2>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 text-sm font-medium rounded-full px-3 py-1">
                {order?.paymentMode || "Non spécifié"}
              </span>
              <span
                className={`text-sm font-medium rounded-full px-3 py-1 ${
                  order?.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order?.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : order?.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order?.status || "pending"}
              </span>
              <span className="bg-purple-100 text-purple-700 text-sm font-medium rounded-full px-3 py-1">
                CFA {totalAmount?.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Date de commande:</strong>{" "}
                {order?.timestampCreate?.toDate()?.toLocaleDateString("fr-FR")}
              </p>
              <p>
                <strong>Heure:</strong>{" "}
                {order?.timestampCreate?.toDate()?.toLocaleTimeString("fr-FR")}
              </p>
              <p>
                <strong>Client:</strong> {order?.userName || address?.fullName}
              </p>
              <p>
                <strong>Email:</strong> {order?.userEmail}
              </p>
              <p>
                <strong>ID Client:</strong> {order?.uid}
              </p>
            </div>
          </div>

          {/* Produits commandés */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Produits Commandés
            </h2>

            <div className="space-y-4">
              {/* Utilisez order.products si disponible, sinon order.checkout.line_items */}
              {(order?.products || order?.checkout?.line_items)?.map(
                (product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      src={
                        product?.featureImage ||
                        product?.price_data?.product_data?.images?.[0] ||
                        "/images/placeholder-product.jpg"
                      }
                      alt={
                        product?.title ||
                        product?.price_data?.product_data?.name ||
                        "Produit"
                      }
                      onError={(e) => {
                        e.target.src = "/images/placeholder-product.jpg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {product?.title ||
                          product?.price_data?.product_data?.name ||
                          "Produit sans nom"}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>
                          Prix unitaire: CFA{" "}
                          {product?.salePrice?.toLocaleString() ||
                            (
                              product?.price_data?.unit_amount / 100
                            )?.toLocaleString()}
                        </span>
                        <span>Quantité: {product?.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        CFA{" "}
                        {(
                          product?.salePrice * product?.quantity ||
                          (product?.price_data?.unit_amount / 100) *
                            product?.quantity
                        )?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">
                  CFA {totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Adresse de livraison */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Adresse de Livraison
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {address?.fullName || "Non spécifié"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {address?.mobile || "Non spécifié"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {address?.email || "Non spécifié"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse ligne 1
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {address?.addressLine1 || "Non spécifié"}
                </p>
              </div>

              {address?.addressLine2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse ligne 2
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {address.addressLine2}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {address?.pincode || "Non spécifié"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {address?.city || "Non spécifié"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Région
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {address?.state || "Non spécifié"}
                  </p>
                </div>
              </div>

              {address?.orderNote && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes de livraison
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {address.orderNote}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              Informations Client
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>
                <strong>Nom:</strong> {order?.userName}
              </p>
              <p>
                <strong>Email:</strong> {order?.userEmail}
              </p>
              <p>
                <strong>ID:</strong> {order?.uid}
              </p>
              <p>
                <strong>WhatsApp Vendeur:</strong> {order?.vendorWhatsApp}
              </p>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Informations Importantes
            </h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>
                • Statut actuel: <strong>{order?.status || "pending"}</strong>
              </li>
              <li>
                • Mode de paiement: <strong>{order?.paymentMode}</strong>
              </li>
              <li>
                • Contactez le client: <strong>{address?.mobile}</strong>
              </li>
              <li>• Notes: {address?.orderNote || "Aucune note"}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
