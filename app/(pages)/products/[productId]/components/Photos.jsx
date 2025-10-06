"use client";

import Image from "next/image";
import { useState } from "react";

export default function Photos({ imageList = [] }) {
  const [selectedImage, setSelectedImage] = useState(imageList[0]);

  // Vérification plus robuste
  if (!imageList || imageList.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-[350px] md:h-[430px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Aucune image disponible</p>
      </div>
    );
  }

  // S'assurer que selectedImage est valide
  const currentImage = selectedImage || imageList[0];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Image principale */}
      <div className="flex justify-center w-full">
        <div className="relative w-full max-w-[500px] h-[350px] md:h-[430px]">
          <Image
            src={currentImage}
            alt="Image principale du produit"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 500px"
            priority
          />
        </div>
      </div>

      {/* Galerie de vignettes - SEULEMENT si plus d'une image */}
      {imageList.length > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-3">
          {imageList.map((item, index) => (
            <div
              key={`thumbnail-${index}-${item}`} // Clé unique
              onClick={() => setSelectedImage(item)}
              className={`w-[80px] h-[80px] border-2 rounded p-1 cursor-pointer transition-all ${
                currentImage === item
                  ? "border-blue-500"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={item}
                  alt={`Vue ${index + 1} du produit`}
                  fill
                  className="object-cover rounded"
                  sizes="80px"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
