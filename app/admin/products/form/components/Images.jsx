export default function Images({
  data,
  setFeatureImage,
  featureImage,
  imageList,
  setImageList,
}) {
  return (
    <section className="flex flex-col gap-3 bg-white border p-4 rounded-xl">
      <h1 className="font-semibold">Images</h1>

      {/* 🔹 Feature Image */}
      <div className="flex flex-col gap-1">
        {/* Image déjà sauvegardée (API) */}
        {data?.featureImage && !featureImage && (
          <div className="flex justify-center">
            <img
              className="h-20 object-cover rounded-lg"
              src={data?.featureImage}
              alt="Feature"
            />
          </div>
        )}

        {/* Nouvelle image sélectionnée (local) */}
        {featureImage && (
          <div className="flex justify-center">
            <img
              className="h-20 object-cover rounded-lg"
              src={URL.createObjectURL(featureImage)}
              alt="Preview Feature"
            />
          </div>
        )}

        <label
          className="text-gray-500 text-xs"
          htmlFor="product-feature-image"
        >
          Feature Image <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          id="product-feature-image"
          name="product-feature-image"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              setFeatureImage(e.target.files[0]);
            }
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
        />
      </div>

      {/* 🔹 Other Images */}
      <div className="flex flex-col gap-1">
        {/* Images déjà sauvegardées */}
        {!imageList?.length && data?.images?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {data?.images?.map((item, index) => (
              <img
                key={index}
                className="w-20 object-cover rounded-lg"
                src={item}
                alt={`Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Nouvelles images sélectionnées */}
        {imageList?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {imageList.map((item, index) => (
              <img
                key={index}
                className="w-20 object-cover rounded-lg"
                src={URL.createObjectURL(item)}
                alt={`Preview ${index + 1}`}
              />
            ))}
          </div>
        )}

        <label className="text-gray-500 text-xs" htmlFor="product-images">
          Images <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          id="product-images"
          name="product-images"
          multiple
          accept="image/*"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files);
            setImageList(newFiles);
          }}
          className="border px-4 py-2 rounded-lg w-full outline-none"
        />
      </div>
    </section>
  );
}
