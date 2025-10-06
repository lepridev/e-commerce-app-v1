"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";

export default function BasicDetails({ data, handleData }) {
  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();

  // Trouver les noms correspondants aux IDs sélectionnés
  const selectedBrand = brands.find((brand) => brand.id === data?.brandId);
  const selectedCategory = categories.find(
    (category) => category.id === data?.categoryId
  );

  // Fonction pour s'assurer que chaque élément a une clé unique
  const getSafeKey = (item, index, prefix) => {
    return item?.id ? `${prefix}-${item.id}` : `${prefix}-${index}`;
  };

  return (
    <section className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
      <h1 className="font-semibold">Basic Details</h1>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs" htmlFor="product-title">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Title"
          id="product-title"
          name="product-title"
          value={data?.title ?? ""}
          onChange={(e) => {
            handleData("title", e.target.value);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-gray-500 text-xs"
          htmlFor="product-short-decription"
        >
          Short Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Short Description"
          id="product-short-decription"
          name="product-short-decription"
          value={data?.shortDescription ?? ""}
          onChange={(e) => {
            handleData("shortDescription", e.target.value);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs" htmlFor="product-brand">
          Brand <span className="text-red-500">*</span>
        </label>
        <select
          id="product-brand"
          name="product-brand"
          value={data?.brandId ?? ""}
          onChange={(e) => {
            handleData("brandId", e.target.value);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        >
          <option value="">Select Brand</option>
          {brands?.map((item, index) => {
            if (!item) return null; // Ignorer les éléments undefined
            return (
              <option value={item?.id} key={getSafeKey(item, index, "brand")}>
                {item?.name}
              </option>
            );
          })}
        </select>
        {/* Afficher le nom de la brand sélectionnée */}
        {selectedBrand && (
          <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-700">
              <span className="font-medium">Selected Brand:</span>{" "}
              {selectedBrand.name}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs" htmlFor="product-category">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="product-category"
          name="product-category"
          value={data?.categoryId ?? ""}
          onChange={(e) => {
            handleData("categoryId", e.target.value);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        >
          <option value="">Select Category</option>
          {categories?.map((item, index) => {
            if (!item) return null; // Ignorer les éléments undefined
            return (
              <option
                value={item?.id}
                key={getSafeKey(item, index, "category")}
              >
                {item?.name}
              </option>
            );
          })}
        </select>
        {/* Afficher le nom de la catégorie sélectionnée */}
        {selectedCategory && (
          <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Selected Category:</span>{" "}
              {selectedCategory.name}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs" htmlFor="product-stock">
          Stock <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="Enter Stock"
          id="product-stock"
          name="product-stock"
          value={data?.stock ?? ""}
          onChange={(e) => {
            handleData("stock", e.target.valueAsNumber);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs" htmlFor="product-price">
          Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="Enter Price"
          id="product-price"
          name="product-price"
          value={data?.price ?? ""}
          onChange={(e) => {
            handleData("price", e.target.valueAsNumber);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs" htmlFor="product-sale-price">
          Sale Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="Enter Sale Price"
          id="product-sale-price"
          name="product-sale-price"
          value={data?.salePrice ?? ""}
          onChange={(e) => {
            handleData("salePrice", e.target.valueAsNumber);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-gray-500 text-xs"
          htmlFor="product-is-featured-product"
        >
          Is Featured Product <span className="text-red-500">*</span>
        </label>
        <select
          id="product-is-featured-product"
          name="product-is-featured-product"
          value={data?.isFeatured ? "yes" : "no"}
          onChange={(e) => {
            handleData("isFeatured", e.target.value === "yes" ? true : false);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
          required
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {/* Section d'information sur les sélections */}
      {(selectedBrand || selectedCategory) && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selection Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Brand ID:</span>
              <p className="font-medium">{data?.brandId || "Not selected"}</p>
            </div>
            <div>
              <span className="text-gray-500">Brand Name:</span>
              <p className="font-medium">
                {selectedBrand?.name || "Not selected"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Category ID:</span>
              <p className="font-medium">
                {data?.categoryId || "Not selected"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Category Name:</span>
              <p className="font-medium">
                {selectedCategory?.name || "Not selected"}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
