"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { useSendOrder } from "@/lib/useSendOrder";
import { CircularProgress, Button } from "@nextui-org/react";
import { useState } from "react";

export default function Page() {
  const { user } = useAuth();
  const { data: orders, error, isLoading } = useOrders({ uid: user?.uid });
  const { sendOrderToFirestore, isSending } = useSendOrder();
  const [sendingOrderId, setSendingOrderId] = useState(null);

  const handleSendToWhatsApp = async (order) => {
    setSendingOrderId(order.id);

    try {
      // 1. D'abord, sauvegarder dans Firestore
      const orderId = await sendOrderToFirestore({
        ...order,
        uid: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName,
      });

      // 2. Ensuite, préparer le message WhatsApp
      const message = formatWhatsAppMessage(order, orderId);

      // 3. Ouvrir WhatsApp avec le message
      const phoneNumber = "33612345678"; // Remplace par le numéro de l'admin
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setSendingOrderId(null);
    }
  };

  const formatWhatsAppMessage = (order, orderId) => {
    const totalAmount = order?.checkout?.line_items?.reduce(
      (prev, curr) =>
        prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity,
      0
    );

    let message = `🛒 NOUVELLE COMMANDE #${orderId}\n\n`;
    message += `Client: ${user?.displayName || "Non spécifié"}\n`;
    message += `Email: ${user?.email}\n`;
    message += `Total: ₹ ${totalAmount}\n\n`;
    message += `PRODUITS:\n`;

    order?.checkout?.line_items?.forEach((product, index) => {
      message += `${index + 1}. ${product?.price_data?.product_data?.name}\n`;
      message += `   Prix: ₹ ${product?.price_data?.unit_amount / 100}\n`;
      message += `   Quantité: ${product?.quantity}\n\n`;
    });

    message += `Merci ! 🎉`;

    return message;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-48">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Erreur: {error}</div>;
  }

  return (
    <main className="flex flex-col gap-4 p-5">
      <h1 className="text-2xl font-semibold">Mes Commandes</h1>

      {(!orders || orders?.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-3 py-11">
          <div className="flex justify-center">
            <img className="h-44" src="/svgs/Empty-pana.svg" alt="" />
          </div>
          <h1>Vous n'avez aucune commande</h1>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {orders?.map((item, orderIndex) => {
          const totalAmount = item?.checkout?.line_items?.reduce(
            (prev, curr) =>
              prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity,
            0
          );

          return (
            <div
              key={item.id || orderIndex}
              className="flex flex-col gap-2 border rounded-lg p-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center flex-wrap">
                  <h3 className="font-semibold">#{orderIndex + 1}</h3>
                  <h3 className="bg-blue-100 text-blue-500 text-xs rounded-lg px-2 py-1 uppercase">
                    {item?.paymentMode}
                  </h3>
                  <h3 className="bg-green-100 text-green-500 text-xs rounded-lg px-2 py-1 uppercase">
                    {item?.status ?? "pending"}
                  </h3>
                  <h3 className="text-green-600 font-bold">₹ {totalAmount}</h3>

                  {/* Bouton d'envoi WhatsApp */}
                  <Button
                    size="sm"
                    color="success"
                    isLoading={sendingOrderId === item.id && isSending}
                    onPress={() => handleSendToWhatsApp(item)}
                    className="ml-auto"
                    startContent={!isSending ? "📱" : null}
                  >
                    {sendingOrderId === item.id && isSending
                      ? "Envoi..."
                      : "Envoyer sur WhatsApp"}
                  </Button>
                </div>

                <h4 className="text-gray-600 text-xs">
                  {item?.timestampCreate?.toDate()?.toString()}
                </h4>
              </div>

              <div className="mt-2">
                {item?.checkout?.line_items?.map((product, productIndex) => (
                  <div
                    key={productIndex}
                    className="flex gap-2 items-center py-2"
                  >
                    <img
                      className="h-10 w-10 rounded-lg object-cover"
                      src={product?.price_data?.product_data?.images?.[0]}
                      alt="Product Image"
                    />
                    <div>
                      <h1 className="font-medium">
                        {product?.price_data?.product_data?.name}
                      </h1>
                      <h1 className="text-gray-500 text-xs">
                        CFA {product?.price_data?.unit_amount / 100}
                        <span> × </span>
                        <span>{product?.quantity?.toString()}</span>
                      </h1>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
