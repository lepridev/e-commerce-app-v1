"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const { user } = useAuth();

  // Numéro WhatsApp du vendeur
  const vendorWhatsAppNumber = "+2250712207890";
  const businessName = "VEXI IMPRIM";

  // Charger l'adresse sauvegardée depuis localStorage
  useEffect(() => {
    if (user?.uid) {
      loadSavedAddress();
    } else {
      setIsLoadingAddress(false);
    }
  }, [user]);

  const loadSavedAddress = () => {
    try {
      const savedAddress = localStorage.getItem(`user_address_${user.uid}`);
      if (savedAddress) {
        const parsedAddress = JSON.parse(savedAddress);
        setAddress(parsedAddress);
        console.log("✅ Adresse chargée depuis le stockage local");
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement de l'adresse:", error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const saveAddress = (addressData) => {
    if (!user?.uid) return;

    try {
      localStorage.setItem(
        `user_address_${user.uid}`,
        JSON.stringify(addressData)
      );
      console.log("💾 Adresse sauvegardée");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
    }
  };

  const handleAddress = (key, value) => {
    const newAddress = { ...(address ?? {}), [key]: value };
    setAddress(newAddress);

    // Sauvegarder automatiquement après un délai
    setTimeout(() => {
      saveAddress(newAddress);
    }, 500);
  };

  const clearSavedAddress = () => {
    if (!user?.uid) return;

    try {
      localStorage.removeItem(`user_address_${user.uid}`);
      setAddress(null);
      toast.success("Adresse effacée");
      console.log("🗑️ Adresse effacée");
    } catch (error) {
      console.error("❌ Erreur lors de l'effacement:", error);
    }
  };

  const totalPrice = productList?.reduce((prev, curr) => {
    return prev + curr?.quantity * curr?.product?.salePrice;
  }, 0);

  // Fonction pour envoyer la commande à Firestore
  const sendOrderToFirestore = async (orderData) => {
    try {
      const orderWithMetadata = {
        ...orderData,
        uid: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || address?.fullName,
        status: "pending",
        paymentMode: "whatsapp",
        timestampCreate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderWithMetadata);
      console.log("✅ Commande sauvegardée dans Firestore:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Erreur Firestore:", error);
      throw error;
    }
  };

  const generateWhatsAppMessage = (orderId = "") => {
    const productsText = productList
      ?.map(
        (item) =>
          `• ${item?.product?.title} - ${item?.quantity} x CFA ${
            item?.product?.salePrice
          } = CFA ${item?.product?.salePrice * item?.quantity}`
      )
      .join("\n");

    const message = `
🛒 **NOUVELLE COMMANDE** - ${businessName}
${orderId ? `📋 **N° Commande:** ${orderId}` : ""}

👤 **Informations client:**
• Nom: ${address?.fullName}
• Téléphone: ${address?.mobile}
• Email: ${address?.email || "Non fourni"}
${user?.uid ? `• ID Client: ${user.uid}` : ""}

📍 **Adresse de livraison:**
${address?.addressLine1}
${address?.addressLine2 ? address.addressLine2 + "\n" : ""}
${address?.pincode ? "Code postal: " + address.pincode + "\n" : ""}
${address?.city ? "Ville: " + address.city + "\n" : ""}
${address?.state ? "Région: " + address.state + "\n" : ""}

📦 **Produits commandés:**
${productsText}

💰 **Total: CFA ${totalPrice}**
💳 **Mode de paiement: Paiement à la livraison**

${address?.orderNote ? `📝 **Notes du client:** ${address.orderNote}` : ""}

---
*Commande générée depuis le site web*
    `.trim();

    return encodeURIComponent(message);
  };

  const sendWhatsAppOrder = (orderId = "") => {
    const message = generateWhatsAppMessage(orderId);
    const whatsappUrl = `https://wa.me/${vendorWhatsAppNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // Validation des données
      if (totalPrice <= 0) {
        throw new Error("Le prix doit être supérieur à 0");
      }
      if (!address?.fullName || !address?.mobile || !address?.addressLine1) {
        throw new Error("Veuillez remplir tous les détails de l'adresse");
      }

      if (!productList || productList?.length === 0) {
        throw new Error("La liste des produits est vide");
      }

      const phoneRegex = /^[0-9]{9,15}$/;
      if (!phoneRegex.test(address.mobile.replace(/\s/g, ""))) {
        throw new Error("Veuillez entrer un numéro de téléphone valide");
      }

      // Sauvegarder une dernière fois avant envoi
      saveAddress(address);

      // Préparer les données de la commande pour Firestore
      const orderData = {
        address: address,
        products: productList.map((item) => ({
          productId: item?.product?.id,
          title: item?.product?.title,
          featureImage: item?.product?.featureImage,
          salePrice: item?.product?.salePrice,
          quantity: item?.quantity,
          subtotal: item?.product?.salePrice * item?.quantity,
        })),
        totalAmount: totalPrice,
        businessName: businessName,
        vendorWhatsApp: vendorWhatsAppNumber,
      };

      // 1. D'abord, sauvegarder dans Firestore
      const orderId = await sendOrderToFirestore(orderData);

      // 2. Ensuite, ouvrir WhatsApp avec l'ID de commande
      sendWhatsAppOrder(orderId);

      toast.success("Commande envoyée sur WhatsApp !");
      confetti();
    } catch (error) {
      console.error("❌ Erreur lors de la commande:", error);
      toast.error(error?.message || "Une erreur est survenue");
    }
    setIsLoading(false);
  };

  // Si on charge l'adresse, afficher un indicateur
  if (isLoadingAddress) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement de vos informations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Colonne gauche - Informations client (8/12 sur desktop) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Adresse de Livraison
                </h1>
                {address && (
                  <button
                    onClick={clearSavedAddress}
                    className="text-sm text-red-600 hover:text-red-700 underline transition-colors"
                    title="Effacer mes informations sauvegardées"
                  >
                    Effacer mes infos
                  </button>
                )}
              </div>

              {address && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 text-green-700">
                    <CheckSquare2Icon size={20} className="flex-shrink-0" />
                    <div>
                      <span className="font-semibold">
                        Vos informations sont sauvegardées
                      </span>
                      <p className="text-sm text-green-600 mt-1">
                        Elles seront pré-remplies automatiquement lors de votre
                        prochaine commande
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      id="full-name"
                      name="full-name"
                      placeholder="Nom Complet *"
                      value={address?.fullName ?? ""}
                      onChange={(e) =>
                        handleAddress("fullName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                    {address?.fullName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    placeholder="Numéro de Téléphone *"
                    value={address?.mobile ?? ""}
                    onChange={(e) => handleAddress("mobile", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                  {address?.mobile && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={address?.email ?? ""}
                    onChange={(e) => handleAddress("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2 relative">
                  <input
                    type="text"
                    id="address-line-1"
                    name="address-line-1"
                    placeholder="Adresse de livraison *"
                    value={address?.addressLine1 ?? ""}
                    onChange={(e) =>
                      handleAddress("addressLine1", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                  {address?.addressLine1 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <input
                    type="text"
                    id="address-line-2"
                    name="address-line-2"
                    placeholder="Adresse de livraison 2 (optionnel)"
                    value={address?.addressLine2 ?? ""}
                    onChange={(e) =>
                      handleAddress("addressLine2", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <input
                  type="number"
                  id="pincode"
                  name="pincode"
                  placeholder="Code Postal"
                  value={address?.pincode ?? ""}
                  onChange={(e) => handleAddress("pincode", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Ville"
                  value={address?.city ?? ""}
                  onChange={(e) => handleAddress("city", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="Région"
                  value={address?.state ?? ""}
                  onChange={(e) => handleAddress("state", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />

                <div className="md:col-span-2">
                  <textarea
                    id="delivery-notes"
                    name="delivery-notes"
                    placeholder="Notes concernant votre commande, ex: notes spéciales pour la livraison, horaires de livraison préférés..."
                    value={address?.orderNote ?? ""}
                    onChange={(e) => handleAddress("orderNote", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl mt-6 border border-blue-200">
                <p className="text-sm text-blue-800">
                  💾{" "}
                  <strong className="font-semibold">
                    Sauvegarde automatique
                  </strong>
                  <br />
                  Vos informations sont automatiquement sauvegardées et seront
                  pré-remplies lors de vos prochaines commandes.
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Récapitulatif (4/12 sur desktop) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Récapitulatif des produits */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Récapitulatif
                </h1>
                <div className="space-y-4">
                  {productList?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <Image
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        src={item?.product?.featureImage}
                        width={56}
                        height={56}
                        alt={item?.product?.title}
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-medium text-gray-900 truncate">
                          {item?.product?.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-600 font-semibold text-xs">
                            CFA {item?.product?.salePrice?.toLocaleString()}
                          </span>
                          <span className="text-gray-400">×</span>
                          <span className="text-gray-600 text-xs">
                            {item?.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          CFA{" "}
                          {(
                            item?.product?.salePrice * item?.quantity
                          )?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Total</h2>
                  <h2 className="text-xl font-bold text-green-600">
                    CFA {totalPrice?.toLocaleString()}
                  </h2>
                </div>
              </div>

              {/* Paiement et validation */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Paiement</h2>
                  <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                    <CheckSquare2Icon className="text-green-600" size={16} />
                    <span className="text-green-700 font-semibold text-xs">
                      À la livraison
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mb-4">
                  <p className="text-xs text-blue-800">
                    <strong>Comment ça marche ?</strong>
                    <br />
                    1. Sauvegarde automatique de vos infos
                    <br />
                    2. Envoi de la commande sur WhatsApp
                    <br />
                    3. Confirmation avec le vendeur
                  </p>
                </div>

                <div className="flex gap-2 items-center mb-4">
                  <CheckSquare2Icon
                    className="text-green-500 flex-shrink-0"
                    size={14}
                  />
                  <span className="text-xs text-gray-600">
                    J'accepte les{" "}
                    <span className="text-green-700 font-medium cursor-pointer hover:underline">
                      conditions de vente
                    </span>
                  </span>
                </div>

                <Button
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  onClick={handlePlaceOrder}
                  className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold py-4 text-sm rounded-xl transition-colors"
                  startContent={
                    !isLoading && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="flex-shrink-0"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.447" />
                      </svg>
                    )
                  }
                >
                  {isLoading ? "Envoi en cours..." : "📱 Envoyer sur WhatsApp"}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Commande enregistrée et envoyée au vendeur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
