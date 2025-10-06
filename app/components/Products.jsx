import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";
import AuthContextProvider from "@/contexts/AuthContext";
import AddToCartButton from "./AddToCartButton";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import { Suspense } from "react";
import MyRating from "./MyRating";

// Fonction de conversion pour les données Firestore
function convertProductData(product) {
  if (!product) return null;

  return {
    ...product,
    // Convertir les Timestamps en strings
    timestampCreate:
      product.timestampCreate?.toDate?.()?.toISOString() ||
      product.timestampCreate ||
      null,
    // S'assurer que tous les champs sont des valeurs simples
    id: String(product.id),
    title: String(product.title || ""),
    shortDescription: String(product.shortDescription || ""),
    salePrice: Number(product.salePrice || 0),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    orders: Number(product.orders || 0),
    images: Array.isArray(product.images) ? product.images : [],
  };
}

export default function ProductsGridView({ products }) {
  // Convertir les produits reçus en props
  const convertedProducts = products?.map(convertProductData) || [];

  return (
    <section className="w-full flex justify-center">
      <div className="flex flex-col gap-6 max-w-[1200px] p-6">
        <h1 className="text-center font-semibold text-xl text-gray-800">
          Tous les produits
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {convertedProducts.map((product) => (
            <ProductCard product={product} key={product?.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product }) {
  // S'assurer que le produit est converti
  const safeProduct = convertProductData(product);

  if (!safeProduct) return null;

  const hasDiscount = safeProduct.price > safeProduct.salePrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((safeProduct.price - safeProduct.salePrice) / safeProduct.price) * 100
      )
    : 0;
  const isOutOfStock = safeProduct.stock <= (safeProduct.orders ?? 0);

  return (
    <div className="flex flex-col gap-4 border border-gray-200 p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      {/* Image du produit */}
      <div className="relative w-full aspect-square">
        <Link href={`/products/${safeProduct.id}`}>
          <Image
            src={safeProduct.images[0] || "/placeholder.png"}
            alt={safeProduct.title}
            fill
            className="rounded-lg object-cover hover:scale-105 transition-transform duration-300"
            unoptimized={true}
          />
        </Link>

        {/* Badge de promotion */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discountPercentage}%
          </div>
        )}

        {/* Bouton favori */}
        <div className="absolute top-2 right-2">
          <AuthContextProvider>
            <FavoriteButton productId={safeProduct.id} />
          </AuthContextProvider>
        </div>

        {/* Badge rupture de stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Informations du produit */}
      <div className="flex flex-col gap-3 flex-1">
        {/* Titre */}
        <Link href={`/products/${safeProduct.id}`}>
          <h1 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors text-sm leading-tight">
            {safeProduct.title}
          </h1>
        </Link>

        {/* Prix */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-lg">
              {safeProduct.salePrice.toLocaleString()} CFA
            </span>
            {hasDiscount && (
              <span className="text-gray-500 text-sm line-through">
                {safeProduct.price.toLocaleString()} CFA
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-xs text-green-600 font-medium">
              Économisez{" "}
              {(safeProduct.price - safeProduct.salePrice).toLocaleString()} CFA
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
          {safeProduct.shortDescription}
        </p>

        {/* Rating et avis */}
        <Suspense
          fallback={
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          }
        >
          <RatingReview product={safeProduct} />
        </Suspense>

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/checkout?type=buynow&productId=${safeProduct.id}`}
            className="flex-1"
          >
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Indisponible" : "Acheter"}
            </button>
          </Link>

          <AuthContextProvider>
            <AddToCartButton
              productId={safeProduct.id}
              disabled={isOutOfStock}
            />
          </AuthContextProvider>
        </div>
      </div>
    </div>
  );
}

async function RatingReview({ product }) {
  try {
    const counts = await getProductReviewCounts({ productId: product?.id });

    return (
      <div className="flex items-center gap-2">
        <MyRating value={counts?.averageRating ?? 0} size="sm" />
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">
            {counts?.averageRating?.toFixed(1) || "0.0"}
          </span>
          <span>•</span>
          <span>({counts?.totalReviews || 0} avis)</span>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <MyRating value={0} size="sm" />
        <span>(0 avis)</span>
      </div>
    );
  }
}
