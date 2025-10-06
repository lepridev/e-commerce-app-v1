import { ProductCard } from "@/app/components/Products";
import { getProductsByCategory } from "@/lib/firestore/products/read_server";

export default async function RelatedProducts({ categoryId }) {
  // Vérifiez que categoryId est bien défini
  if (!categoryId) {
    console.error("categoryId is undefined");
    return null;
  }

  try {
    const products = await getProductsByCategory({ categoryId });

    // Si aucun produit n'est trouvé
    if (!products || products.length === 0) {
      return (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-5 max-w-[900px] p-5">
            <h1 className="text-center font-semibold text-lg">
              Produits similaires
            </h1>
            <p className="text-center text-gray-500">
              Aucun produit trouvé dans cette catégorie.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex justify-center">
        <div className="flex flex-col gap-5 max-w-[900px] p-5">
          <h1 className="text-center font-semibold text-lg">
            Produits similaires
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((item) => (
              <ProductCard product={item} key={item.id} />
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching related products:", error);
    return (
      <div className="w-full flex justify-center">
        <div className="flex flex-col gap-5 max-w-[900px] p-5">
          <h1 className="text-center font-semibold text-lg">
            Produits similaires
          </h1>
          <p className="text-center text-red-500">
            Erreur lors du chargement des produits.
          </p>
        </div>
      </div>
    );
  }
}
