import { ProductCard } from "@/app/components/Products";
import SearchBox from "./components/SearchBox";
import { searchProducts } from "@/lib/firestore/products/search";

// Fonction pour rechercher les produits dans Firestore
const getProducts = async (text) => {
  if (!text || text.trim() === "") {
    return [];
  }

  try {
    const products = await searchProducts(text);
    return products;
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return [];
  }
};

export default async function Page({ searchParams }) {
  const { q } = searchParams;
  const products = await getProducts(q);

  return (
    <main className="flex flex-col gap-6 min-h-screen p-5 bg-gray-50">
      {/* En-tête de recherche */}
      <div className="flex flex-col gap-4 items-center">
        <SearchBox />
        <div className="flex flex-col gap-1 justify-center items-center">
          <h1 className="text-xs text-gray-500">Recherche avancée</h1>
          <img src="/firebase.png" className="h-5" alt="Firebase Logo" />
        </div>
      </div>

      {/* Résultats de recherche */}
      {products?.length > 0 ? (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-6 max-w-7xl w-full p-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Résultats pour "{q}"
              </h1>
              <p className="text-gray-600">
                {products.length} produit{products.length > 1 ? "s" : ""} trouvé
                {products.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard product={product} key={product?.id} />
              ))}
            </div>
          </div>
        </div>
      ) : q ? (
        // Aucun résultat trouvé
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h2>
            <p className="text-gray-600 max-w-md">
              Aucun produit ne correspond à "
              <span className="font-medium">"{q}"</span>". Essayez avec d'autres
              termes de recherche.
            </p>
          </div>
        </div>
      ) : (
        // État initial - pas encore de recherche
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Rechercher des produits
            </h2>
            <p className="text-gray-600 max-w-md">
              Utilisez la barre de recherche ci-dessus pour trouver vos produits
              préférés.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
