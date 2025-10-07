"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/lib/firestore/products/read";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user } = useAuth();
  const { data, isLoading, mutate } = useUser({ uid: user?.uid });
  const router = useRouter();
  const [cartItemsWithProducts, setCartItemsWithProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Charger les produits pour chaque article du panier
  useEffect(() => {
    const loadProducts = async () => {
      if (!data?.carts || data.carts.length === 0) {
        setCartItemsWithProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);

      // Pour chaque article du panier, on va chercher les détails du produit
      const itemsWithProducts = await Promise.all(
        data.carts.map(async (item) => {
          return {
            ...item,
            // On retourne l'article tel quel, les prix seront chargés dans ProductItem
          };
        })
      );

      setCartItemsWithProducts(itemsWithProducts);
      setIsLoadingProducts(false);
    };

    loadProducts();
  }, [data?.carts]);

  const handleCommanderClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartCleared"));
    }
    router.push("/checkout?type=cart");
  };

  if (isLoading || isLoadingProducts) {
    return (
      <div className="p-10 flex w-full justify-center">
        <CircularProgress label="Chargement du panier..." />
      </div>
    );
  }

  const cartItemsCount =
    data?.carts?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  const isCartEmpty = cartItemsCount === 0;

  // Calculer le prix total basé sur les produits chargés
  const totalPrice = calculateTotalPrice(cartItemsWithProducts);

  return (
    <main className="flex flex-col gap-3 justify-center items-center p-5 min-h-screen">
      <h1 className="text-2xl font-semibold">Votre panier</h1>

      {isCartEmpty ? (
        <div className="flex flex-col gap-5 justify-center items-center h-full w-full py-20">
          <div className="flex justify-center">
            <Image
              width={200}
              height={200}
              src="/svgs/Empty-pana.svg"
              alt="Panier vide"
            />
          </div>
          <h1 className="text-gray-600 font-semibold text-center">
            Veuillez ajouter des produits au panier
          </h1>
          <Link href="/">
            <Button className="bg-blue-500 text-white">
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="p-5 w-full md:max-w-[900px] gap-4 grid grid-cols-1 md:grid-cols-2">
            {data?.carts?.map((item) => (
              <ProductItem
                item={item}
                key={item?.id}
                onUpdate={mutate}
                userData={data}
              />
            ))}
          </div>

          {/* Résumé du panier */}
          <div className="w-full md:max-w-[900px] bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Nombre d'articles:</span>
              <span className="font-semibold">{cartItemsCount}</span>
            </div>
            {/* <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-green-600">
                CFA {totalPrice}
              </span>
            </div> */}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Articles distincts:</span>
                <span className="font-medium">{data?.carts?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleCommanderClick}
              className="bg-green-600 text-white px-8 py-3 text-md font-semibold"
              size="lg"
            >
              📱 Commander via WhatsApp
            </Button>

            <p className="text-xs text-gray-500 text-center mt-2 max-w-md">
              Vous serez redirigé vers le formulaire de commande pour finaliser
              votre achat
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function ProductItem({ item, onUpdate, userData }) {
  const { user } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: product, isLoading: isLoadingProduct } = useProduct({
    productId: item?.id,
  });

  const handleRemove = async () => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce produit du panier ?"))
      return;

    setIsRemoving(true);
    try {
      const newList = userData?.carts?.filter((d) => d?.id !== item?.id);
      await updateCarts({ list: newList, uid: user?.uid });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpdate = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      const newList = userData?.carts?.map((d) => {
        if (d?.id === item?.id) {
          return {
            ...d,
            quantity: parseInt(newQuantity),
          };
        }
        return d;
      });

      await updateCarts({ list: newList, uid: user?.uid });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculer le prix total pour cet article
  const itemPrice = product?.salePrice || product?.price || 0;
  const itemTotal = itemPrice * (item?.quantity || 1);

  if (isLoadingProduct) {
    return (
      <div className="flex gap-3 items-center border px-3 py-3 rounded-xl">
        <div className="h-14 w-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-center border px-3 py-3 rounded-xl hover:shadow-md transition-shadow bg-white">
      <div className="h-14 w-14 p-1 flex-shrink-0">
        <Image
          className="w-full h-full object-cover rounded-lg"
          src={product?.featureImage || "/placeholder-image.jpg"}
          width={56}
          height={56}
          alt={product?.title || "Produit"}
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
          }}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <h1 className="text-sm font-semibold line-clamp-2">
          {product?.title || "Produit non trouvé"}
        </h1>

        {product ? (
          <h1 className="text-green-500 text-sm">
            CFA {itemPrice}
            {product?.price > product?.salePrice && product?.salePrice && (
              <span className="line-through text-xs text-gray-500 ml-2">
                CFA {product?.price}
              </span>
            )}
          </h1>
        ) : (
          <h1 className="text-red-500 text-xs">Produit non disponible</h1>
        )}

        <div className="flex justify-between items-center">
          <div className="flex text-xs items-center gap-2">
            <Button
              onClick={() => handleUpdate((item?.quantity || 1) - 1)}
              isDisabled={isUpdating || (item?.quantity || 1) <= 1}
              isIconOnly
              size="sm"
              className="h-6 w-6 min-w-6"
            >
              <Minus size={12} />
            </Button>
            <span className="w-8 text-center font-medium">
              {item?.quantity || 1}
            </span>
            <Button
              onClick={() => handleUpdate((item?.quantity || 1) + 1)}
              isDisabled={isUpdating}
              isIconOnly
              size="sm"
              className="h-6 w-6 min-w-6"
            >
              <Plus size={12} />
            </Button>
          </div>

          {product && (
            <div className="text-right">
              <div className="text-sm font-semibold text-green-600">
                CFA {itemTotal}
              </div>
              <div className="text-xs text-gray-500">
                {item?.quantity || 1} × CFA {itemPrice}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <Button
          onClick={handleRemove}
          isLoading={isRemoving}
          isDisabled={isRemoving}
          isIconOnly
          color="danger"
          size="sm"
          className="h-8 w-8 min-w-8"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}

// Fonction corrigée pour calculer le prix total
function calculateTotalPrice(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

  console.log("Calcul du prix total pour les articles:", cartItems);

  let total = 0;

  cartItems.forEach((item) => {
    // Pour l'instant, on retourne 0 car les prix sont chargés dans ProductItem
    // Cette fonction sera améliorée quand on aura la structure complète
    console.log(`Article ${item.id}:`, item);
  });

  // Solution temporaire : on calcule le total côté client via les produits chargés
  // Dans une vraie application, il faudrait avoir les prix dans le panier
  return total;
}

// Version alternative qui utilise les données des produits
function calculateTotalPriceFromProducts(cartItems, products) {
  if (!cartItems || cartItems.length === 0) return 0;

  return cartItems.reduce((total, item) => {
    const product = products.find((p) => p.id === item.id);
    const price = product?.salePrice || product?.price || 0;
    const quantity = item.quantity || 1;
    return total + price * quantity;
  }, 0);
}
