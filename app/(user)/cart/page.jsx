"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/lib/firestore/products/read";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user } = useAuth();
  const { data, isLoading } = useUser({ uid: user?.uid });
  const router = useRouter();

  const handleCommanderClick = () => {
    // Réinitialiser la pastille du panier
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartCleared"));
    }

    // Rediriger vers la page de checkout
    router.push("/checkout?type=cart");
  };

  if (isLoading) {
    return (
      <div className="p-10 flex w-full justify-center">
        <CircularProgress />
      </div>
    );
  }

  const cartItemsCount = data?.carts?.length || 0;
  const isCartEmpty = cartItemsCount === 0;

  // Calculer le prix total en utilisant les données des produits
  const totalPrice = calculateTotalPrice(data?.carts);

  return (
    <main className="flex flex-col gap-3 justify-center items-center p-5">
      <h1 className="text-2xl font-semibold">Votre panier</h1>

      {isCartEmpty ? (
        <div className="flex flex-col gap-5 justify-center items-center h-full w-full py-20">
          <div className="flex justify-center">
            <Image
              className=""
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
            {data?.carts?.map((item, key) => {
              return <ProductItem item={item} key={item?.id} />;
            })}
          </div>

          {/* Résumé du panier */}
          <div className="w-full md:max-w-[900px] bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Nombre d'articles:</span>
              <span className="font-semibold">{cartItemsCount}</span>
            </div>
          </div>

          <div>
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

function ProductItem({ item }) {
  const { user } = useAuth();
  const { data, mutate } = useUser({ uid: user?.uid });

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: product } = useProduct({ productId: item?.id });

  const handleRemove = async () => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce produit du panier ?"))
      return;
    setIsRemoving(true);
    try {
      const newList = data?.carts?.filter((d) => d?.id != item?.id);
      await updateCarts({ list: newList, uid: user?.uid });
      mutate();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
    setIsRemoving(false);
  };

  const handleUpdate = async (quantity) => {
    if (quantity < 1) return;

    setIsUpdating(true);
    try {
      const newList = data?.carts?.map((d) => {
        if (d?.id === item?.id) {
          return {
            ...d,
            quantity: parseInt(quantity),
          };
        } else {
          return d;
        }
      });
      await updateCarts({ list: newList, uid: user?.uid });
      mutate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
    setIsUpdating(false);
  };

  // Calculer le prix total pour cet article
  const itemTotal = product?.salePrice ? product.salePrice * item?.quantity : 0;

  return (
    <div className="flex gap-3 items-center border px-3 py-3 rounded-xl hover:shadow-md transition-shadow">
      <div className="h-14 w-14 p-1 flex-shrink-0">
        <Image
          className="w-full h-full object-cover rounded-lg"
          src={product?.featureImage}
          width={56}
          height={56}
          alt={product?.title}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <h1 className="text-sm font-semibold line-clamp-2">{product?.title}</h1>
        <h1 className="text-green-500 text-sm">
          CFA {product?.salePrice}{" "}
          {product?.price > product?.salePrice && (
            <span className="line-through text-xs text-gray-500">
              CFA {product?.price}
            </span>
          )}
        </h1>

        <div className="flex justify-between items-center">
          <div className="flex text-xs items-center gap-2">
            <Button
              onClick={() => {
                handleUpdate(item?.quantity - 1);
              }}
              isDisabled={isUpdating || item?.quantity <= 1}
              isIconOnly
              size="sm"
              className="h-6 w-6 min-w-6"
            >
              <Minus size={12} />
            </Button>
            <span className="w-8 text-center font-medium">
              {item?.quantity}
            </span>
            <Button
              onClick={() => {
                handleUpdate(item?.quantity + 1);
              }}
              isDisabled={isUpdating}
              isIconOnly
              size="sm"
              className="h-6 w-6 min-w-6"
            >
              <Plus size={12} />
            </Button>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-green-600">
              CFA {itemTotal}
            </div>
          </div>
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

  // Parcourir chaque article du panier
  cartItems.forEach((item) => {
    // Vérifier si l'article a un prix direct
    if (item.salePrice) {
      total += item.salePrice * item.quantity;
      console.log(
        `Article ${item.id}: ${item.salePrice} x ${item.quantity} = ${
          item.salePrice * item.quantity
        }`
      );
    }
    // Si l'article a un produit associé avec un prix
    else if (item.product?.salePrice) {
      total += item.product.salePrice * item.quantity;
      console.log(
        `Article ${item.id} (via product): ${item.product.salePrice} x ${
          item.quantity
        } = ${item.product.salePrice * item.quantity}`
      );
    }
    // Si aucune information de prix n'est disponible
    else {
      console.warn(`Impossible de trouver le prix pour l'article ${item.id}`);
    }
  });

  console.log("Total calculé:", total);
  return total;
}

// Version alternative si la première ne fonctionne pas
function calculateTotalPriceAlternative(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

  console.log("Structure des données du panier:", cartItems);

  // Afficher la structure complète pour debug
  cartItems.forEach((item, index) => {
    console.log(`Article ${index}:`, item);
    console.log(`Propriétés de l'article:`, Object.keys(item));
    if (item.product) {
      console.log(`Propriétés du produit:`, Object.keys(item.product));
    }
  });

  // Essayer différentes structures de données possibles
  const total = cartItems.reduce((sum, item) => {
    // Essayer différentes propriétés possibles pour le prix
    const price =
      item.salePrice ||
      item.price ||
      item.product?.salePrice ||
      item.product?.price ||
      0;

    const quantity = item.quantity || 1;
    const itemTotal = price * quantity;

    console.log(
      `Article ${item.id}: prix=${price}, quantité=${quantity}, total=${itemTotal}`
    );

    return sum + itemTotal;
  }, 0);

  return total;
}
