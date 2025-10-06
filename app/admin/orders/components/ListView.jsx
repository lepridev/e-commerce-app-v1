"use client";

import { useOrders } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";
import Link from "next/link";

export default function ListView({ orders: propOrders }) {
  // Si les orders sont passés en props, on les utilise, sinon on les récupère via le hook
  const { data: hookOrders, error, isLoading } = useOrders({ admin: true });
  const orders = propOrders || hookOrders;

  if (isLoading && !propOrders) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress size="lg" />
        <span className="ml-3 text-gray-600">Chargement des commandes...</span>
      </div>
    );
  }

  if (error && !propOrders) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 bg-white border rounded-2xl">
        <div className="flex justify-center">
          <svg
            className="w-24 h-24 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune commande
          </h2>
          <p className="text-gray-600 max-w-md">
            Aucune commande n'a été passée pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        // Utilisez order.totalAmount directement ou calculez à partir des produits
        const totalAmount =
          order?.totalAmount ||
          order?.products?.reduce(
            (prev, product) => prev + product?.salePrice * product?.quantity,
            0
          );

        // L'adresse est maintenant directement dans order.address
        const address = order?.address || {};

        return (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block bg-white border rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Commande #{order.id?.slice(-8) || order.id}
                  </h3>
                  <span
                    className={`text-xs font-medium rounded-full px-3 py-1 ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status || "pending"}
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-3 py-1">
                    {order.paymentMode || "Non spécifié"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p>
                      <strong>Client:</strong>{" "}
                      {order.userName || address.fullName || "Non spécifié"}
                    </p>
                    <p>
                      <strong>Téléphone:</strong>{" "}
                      {address.mobile || "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Date:</strong>{" "}
                      {order.timestampCreate
                        ?.toDate()
                        ?.toLocaleDateString("fr-FR")}
                    </p>
                    <p>
                      <strong>Total:</strong>{" "}
                      <span className="text-green-600 font-semibold">
                        CFA {totalAmount?.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="mt-3 text-xs text-gray-500">
                  <p>
                    <strong>Email:</strong> {order.userEmail || address.email}
                    {address.orderNote && (
                      <span className="ml-3">
                        <strong>Note:</strong> {address.orderNote}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Produits */}
              <div className="lg:text-right">
                <div className="flex -space-x-2 mb-2 justify-end">
                  {/* Utilisez order.products au lieu de order.checkout.line_items */}
                  {(order.products || order.checkout?.line_items || [])
                    ?.slice(0, 3)
                    .map((product, index) => (
                      <img
                        key={index}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
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
                    ))}
                  {(order.products?.length ||
                    order.checkout?.line_items?.length ||
                    0) > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                      +
                      {(order.products?.length ||
                        order.checkout?.line_items?.length ||
                        0) - 3}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {order.products?.length ||
                    order.checkout?.line_items?.length ||
                    0}{" "}
                  produit(s)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.businessName || "VEXI IMPRIM"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
