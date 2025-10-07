"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { useSendOrder } from "@/lib/useSendOrder";
import { deleteOrder } from "@/lib/firestore/orders/delete";
import { updateOrderStatus } from "@/lib/firestore/orders/write";
import {
  CircularProgress,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useState } from "react";
import {
  Eye,
  Send,
  ShoppingBag,
  User,
  Mail,
  CheckCircle,
  Trash2,
} from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const {
    data: orders,
    error,
    isLoading,
    mutate,
  } = useOrders({ uid: user?.uid });
  const { sendOrderToFirestore, isSending } = useSendOrder();
  const [sendingOrderId, setSendingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleSendToWhatsApp = async (order) => {
    setSendingOrderId(order.id);

    try {
      // 1. Mettre à jour le statut dans Firestore
      await updateOrderStatus({
        id: order.id,
        status: "completed",
      });

      // 2. Ensuite, sauvegarder dans Firestore (si nécessaire)
      const orderId = await sendOrderToFirestore({
        ...order,
        uid: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName,
        status: "completed",
        completedAt: new Date(),
      });

      // 3. Préparer le message WhatsApp
      const message = formatWhatsAppMessage(order, orderId);

      // 4. Ouvrir WhatsApp avec le message
      const phoneNumber = "002250712207890";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

      // 5. Rafraîchir la liste des commandes
      await mutate();

      // 6. Ouvrir WhatsApp
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setSendingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setIsDeleting(orderId);

    try {
      // Supprimer la commande de Firestore
      await deleteOrder(orderId);

      // Rafraîchir les données pour refléter la suppression
      await mutate();

      console.log("Commande supprimée avec succès:", orderId);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la commande");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatWhatsAppMessage = (order, orderId) => {
    const totalAmount = calculateOrderTotal(order);

    let message = `🛒 NOUVELLE COMMANDE #${orderId}\n\n`;
    message += `👤 Client: ${user?.displayName || "Non spécifié"}\n`;
    message += `📧 Email: ${user?.email}\n`;
    message += `💰 Total: ₹ ${totalAmount}\n`;
    message += `📅 Date: ${new Date().toLocaleDateString("fr-FR")}\n\n`;
    message += `📦 PRODUITS COMMANDÉS:\n`;

    order?.checkout?.line_items?.forEach((product, index) => {
      const productName = product?.price_data?.product_data?.name;
      const productPrice = product?.price_data?.unit_amount / 100;
      const quantity = product?.quantity;
      const subtotal = productPrice * quantity;

      message += `\n${index + 1}. ${productName}\n`;
      message += `   💰 Prix unitaire: ₹ ${productPrice}\n`;
      message += `   📦 Quantité: ${quantity}\n`;
      message += `   🧮 Sous-total: ₹ ${subtotal}\n`;
    });

    message += `\n💰 TOTAL GÉNÉRAL: ₹ ${totalAmount}\n\n`;
    message += `✅ Commande validée et confirmée\n`;
    message += `Merci ! 🎉`;

    return message;
  };

  const openOrderPreview = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderPreview = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const calculateOrderTotal = (order) => {
    return order?.checkout?.line_items?.reduce(
      (prev, curr) =>
        prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity,
      0
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100 border border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-100 border border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-100 border border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border border-gray-200";
    }
  };

  // Filtrer les commandes : seulement celles qui ne sont pas complétées
  const pendingOrders = orders?.filter((order) => order.status !== "completed");

  // Commandes validées
  const validatedOrders = orders?.filter(
    (order) => order.status === "completed"
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <CircularProgress label="Chargement des commandes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-red-500 p-4 text-center">
          <div className="text-lg font-semibold mb-2">Erreur de chargement</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header avec résumé */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Mes Commandes
          </h1>
          <p className="text-gray-600 mb-4">
            Consultez l'historique de vos commandes
          </p>

          {/* Résumé des commandes */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {pendingOrders?.length || 0}
              </div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {validatedOrders?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Validées</div>
            </div>
          </div>
        </div>

        {(!pendingOrders || pendingOrders?.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-6 py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-48 h-48">
              <img
                className="w-full h-full object-contain"
                src="/svgs/Empty-pana.svg"
                alt="Aucune commande"
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {orders?.length > 0
                  ? "Toutes les commandes sont traitées"
                  : "Aucune commande"}
              </h2>
              <p className="text-gray-600">
                {orders?.length > 0
                  ? "Vos commandes ont été validées"
                  : "Vous n'avez pas encore passé de commande"}
              </p>
            </div>
          </div>
        )}

        {/* Orders List - CORRIGÉ : utiliser uniquement item.id comme clé */}
        <div className="space-y-4">
          {pendingOrders?.map((item) => {
            // Retirer orderIndex du paramètre
            const totalAmount = calculateOrderTotal(item);
            const orderDate = item?.timestampCreate?.toDate();

            return (
              <div
                key={item.id} // Utiliser uniquement l'ID Firestore
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Commande #{item.id.slice(-6)}{" "}
                          {/* Utiliser les derniers caractères de l'ID */}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {orderDate?.toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item?.status
                        )}`}
                      >
                        {item?.status || "En attente"}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ₹ {totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Products Preview */}
                  <div className="mb-4">
                    <div className="flex -space-x-2 mb-3">
                      {item?.checkout?.line_items
                        ?.slice(0, 4)
                        .map((product, index) => (
                          <img
                            key={`${item.id}-product-${index}`} // Clé unique pour chaque produit
                            className="h-10 w-10 rounded-lg border-2 border-white object-cover shadow-sm"
                            src={product?.price_data?.product_data?.images?.[0]}
                            alt={product?.price_data?.product_data?.name}
                          />
                        ))}
                      {item?.checkout?.line_items?.length > 4 && (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                          +{item?.checkout?.line_items?.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {item?.checkout?.line_items?.length} produit(s) •{" "}
                      {item?.paymentMode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => openOrderPreview(item)}
                      startContent={<Eye className="h-4 w-4" />}
                    >
                      Voir le détail
                    </Button>

                    {/* Bouton Supprimer */}
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isLoading={isDeleting === item.id}
                      onPress={() => handleDeleteOrder(item.id)}
                      startContent={
                        isDeleting !== item.id && <Trash2 className="h-4 w-4" />
                      }
                    >
                      {isDeleting === item.id ? "Suppression..." : "Supprimer"}
                    </Button>

                    {/* Bouton Valider */}
                    <Button
                      size="sm"
                      color="success"
                      isLoading={sendingOrderId === item.id && isSending}
                      onPress={() => handleSendToWhatsApp(item)}
                      startContent={!isSending && <Send className="h-4 w-4" />}
                      className="ml-auto"
                    >
                      {sendingOrderId === item.id && isSending
                        ? "Validation..."
                        : "Valider et envoyer"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section des commandes validées - CORRIGÉ */}
        {validatedOrders && validatedOrders.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Commandes Validées
            </h2>
            <div className="space-y-4">
              {validatedOrders.map((item) => {
                // Retirer index
                const totalAmount = calculateOrderTotal(item);
                const orderDate = item?.timestampCreate?.toDate();

                return (
                  <div
                    key={item.id} // Utiliser uniquement l'ID Firestore
                    className="bg-green-50 border border-green-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Commande validée #{item.id.slice(-6)}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {orderDate?.toLocaleDateString("fr-FR")} • ₹{" "}
                            {totalAmount}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">
                        ✅ Validée
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeOrderPreview}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
            <h2 className="text-xl font-bold">Détail de la commande</h2>
            {selectedOrder && (
              <p className="text-sm text-gray-600">
                {selectedOrder?.timestampCreate
                  ?.toDate()
                  ?.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            )}
          </ModalHeader>

          <ModalBody className="py-6">
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informations client
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Nom:</span>
                      <p className="font-medium">
                        {user?.displayName || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Résumé de la commande
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder?.checkout?.line_items?.map(
                      (product, index) => (
                        <div
                          key={`${selectedOrder.id}-product-${index}`} // Clé unique
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={product?.price_data?.product_data?.images?.[0]}
                            alt={product?.price_data?.product_data?.name}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {product?.price_data?.product_data?.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              ₹ {product?.price_data?.unit_amount / 100} ×{" "}
                              {product?.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{" "}
                              {(product?.price_data?.unit_amount / 100) *
                                product?.quantity}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode de paiement:</span>
                      <span className="font-medium">
                        {selectedOrder?.paymentMode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span
                        className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(
                          selectedOrder?.status
                        )}`}
                      >
                        {selectedOrder?.status || "En attente"}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ₹ {calculateOrderTotal(selectedOrder)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-gray-200">
            <Button variant="light" onPress={closeOrderPreview}>
              Fermer
            </Button>

            <Button
              color="danger"
              variant="flat"
              onPress={() => {
                handleDeleteOrder(selectedOrder.id);
                closeOrderPreview();
              }}
              startContent={<Trash2 className="h-4 w-4" />}
              isLoading={isDeleting === selectedOrder?.id}
            >
              Supprimer
            </Button>

            <Button
              color="success"
              onPress={() => {
                closeOrderPreview();
                handleSendToWhatsApp(selectedOrder);
              }}
              startContent={<Send className="h-4 w-4" />}
              isLoading={sendingOrderId === selectedOrder?.id && isSending}
            >
              Valider et envoyer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
