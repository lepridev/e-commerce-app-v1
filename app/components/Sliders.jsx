"use client";

import Slider from "react-slick";
import Link from "next/link";
import AuthContextProvider from "@/contexts/AuthContext";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";
import Image from "next/image";

export default function FeaturedProductSlider({ featuredProducts }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  if (!featuredProducts?.length) return <p>Aucun produit mis en avant.</p>;

  return (
    <div className="overflow-hidden">
      <Slider {...settings}>
        {featuredProducts.map((product) => (
          <div key={product.id}>
            <div className="flex flex-col-reverse md:flex-row gap-6 bg-[#f8f8f8] p-5 md:px-24 md:py-20 w-full">
              {/* TEXTE */}
              <div className="flex-1 flex flex-col justify-center md:gap-10 gap-4">
                <h2 className="text-gray-500 text-xs md:text-base">
                  NOUVEAUTES
                </h2>
                <div className="flex flex-col gap-4">
                  <Link href={`/products/${product.id}`}>
                    <h1 className="md:text-4xl text-xl font-semibold">
                      {product.title}
                    </h1>
                  </Link>
                  <p className="text-gray-600 md:text-sm text-xs max-w-96 line-clamp-2">
                    {product.shortDescription}
                  </p>
                </div>
                <AuthContextProvider>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <Link
                      href={`/checkout?type=buynow&productId=${product.id}`}
                    >
                      <button className="bg-blue-500 text-white text-xs md:text-sm px-4 py-1.5 rounded-lg">
                        COMMANDER MAINTENANT
                      </button>
                    </Link>
                    <AddToCartButton productId={product.id} type="large" />
                    <FavoriteButton productId={product.id} />
                  </div>
                </AuthContextProvider>
              </div>

              {/* IMAGE */}
              <div className="flex-1 flex justify-center items-center">
                <Link href={`/products/${product.id}`}>
                  <Image
                    className="h-[14rem] md:h-[23rem] object-contain"
                    src={product.featureImage}
                    alt={product.title}
                    width={500}
                    height={500}
                  />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
