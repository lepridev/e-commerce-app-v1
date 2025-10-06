import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import MyRating from "@/app/components/MyRating";
import AuthContextProvider from "@/contexts/AuthContext";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getCategory } from "@/lib/firestore/categories/read_server";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import Link from "next/link";
import { Suspense } from "react";

export default function Details({ product }) {
  const hasDiscount = product?.price > product?.salePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product?.price - product?.salePrice) / product?.price) * 100)
    : 0;
  const isOutOfStock = product?.stock <= (product?.orders ?? 0);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Catégorie et Marque */}
      <div className="flex gap-3">
        <Category categoryId={product?.categoryId} />
        <Brand brandId={product?.brandId} />
      </div>

      {/* Titre */}
      <h1 className="font-semibold text-xl md:text-4xl leading-tight">
        {product?.title}
      </h1>

      {/* Rating et Avis */}
      <Suspense
        fallback={<div className="text-gray-400">Chargement des avis...</div>}
      >
        <RatingReview product={product} />
      </Suspense>

      {/* Description courte */}
      <h2 className="text-gray-600 text-sm leading-relaxed line-clamp-3 md:line-clamp-4">
        {product?.shortDescription}
      </h2>

      {/* Prix */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-bold text-green-600">
            CFA {product?.salePrice?.toLocaleString()}
          </span>

          {hasDiscount && (
            <span className="text-lg text-gray-500 line-through">
              CFA {product?.price?.toLocaleString()}
            </span>
          )}
        </div>

        {hasDiscount && (
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
              -{discountPercentage}%
            </span>
            <span className="text-xs text-gray-500">
              Économisez CFA{" "}
              {(product?.price - product?.salePrice)?.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/checkout?type=buynow&productId=${product?.id}`}>
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors duration-200"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Rupture de stock" : "Commander maintenant"}
          </button>
        </Link>

        <AuthContextProvider>
          <AddToCartButton
            type={"cute"}
            productId={product?.id}
            disabled={isOutOfStock}
          />
        </AuthContextProvider>

        <AuthContextProvider>
          <FavoriteButton productId={product?.id} />
        </AuthContextProvider>
      </div>

      {/* Statut du stock */}
      {isOutOfStock ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h3 className="text-red-600 font-semibold text-sm">
            ⚠️ Produit en rupture de stock
          </h3>
          <p className="text-red-500 text-xs mt-1">
            Nous serons bientôt réapprovisionnés
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h3 className="text-green-600 font-semibold text-sm">
            ✅ En stock - {product?.stock} disponibles
          </h3>
        </div>
      )}

      {/* Description détaillée */}
      <div className="flex flex-col gap-3 py-4">
        <h3 className="font-semibold text-lg text-gray-800">
          Description du produit
        </h3>
        <div
          className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product?.description ?? "" }}
        ></div>
      </div>
    </div>
  );
}

async function Category({ categoryId }) {
  const category = await getCategory({ id: categoryId });

  if (!category) return null;

  return (
    <Link href={`/categories/${categoryId}`}>
      <div className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-full hover:border-gray-300 transition-colors">
        {category?.imageURL && (
          <img
            className="h-4 w-4 object-contain"
            src={category?.imageURL}
            alt={category?.name}
          />
        )}
        <h4 className="text-xs font-medium text-gray-700">{category?.name}</h4>
      </div>
    </Link>
  );
}

async function Brand({ brandId }) {
  const brand = await getBrand({ id: brandId });

  if (!brand) return null;

  return (
    <div className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-full">
      {brand?.imageURL && (
        <img
          className="h-4 w-4 object-contain"
          src={brand?.imageURL}
          alt={brand?.name}
        />
      )}
      <h4 className="text-xs font-medium text-gray-700">{brand?.name}</h4>
    </div>
  );
}

async function RatingReview({ product }) {
  try {
    const counts = await getProductReviewCounts({ productId: product?.id });

    return (
      <div className="flex gap-3 items-center">
        <MyRating value={counts?.averageRating ?? 0} />
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span className="font-semibold">
            {counts?.averageRating?.toFixed(1)}
          </span>
          <span className="text-gray-400">•</span>
          <span>({counts?.totalReviews || 0} avis)</span>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex gap-3 items-center text-gray-400 text-sm">
        <MyRating value={0} />
        <span>(0 avis)</span>
      </div>
    );
  }
}
