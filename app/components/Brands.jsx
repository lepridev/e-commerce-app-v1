"use client";

import Slider from "react-slick";

export default function Brands({ brands = [] }) {
  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          initialSlide: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  if (brands.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-8 justify-center overflow-hidden md:p-10 p-5">
      <Slider {...settings}>
        {brands.map((brand) => (
          <div
            key={brand.id} // ✅ clé unique
            className="min-w-[100px] flex flex-col items-center"
          >
            <img
              src={brand.imageUrl}
              alt={brand.name}
              className="w-20 h-20 object-contain"
            />
            <p className="text-sm mt-2">{brand.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}
