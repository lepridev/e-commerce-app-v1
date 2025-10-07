import { ProductCard } from "@/app/components/Products";
import SearchBox from "./components/SearchBox";
import { searchProducts } from "@/lib/firestore/products/search";

const getProducts = async (text) => {
  if (!text || text.trim() === "") {
    return [];
  }

  try {
    const products = await searchProducts(text);
    return products;
  } catch (error) {
    console.error("Erreur recherche:", error);
    return [];
  }
};

export default async function Page({ searchParams }) {
  const { q } = searchParams;
  const products = await getProducts(q);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Recherche</h1>
            <p className="text-gray-600 text-lg">
              Trouvez les produits qui vous correspondent
            </p>
          </div>
          <SearchBox />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {products?.length > 0 ? (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {products.length}
                  </span>
                  produit{products.length > 1 ? "s" : ""} trouvé
                  {products.length > 1 ? "s" : ""} pour
                  <span className="font-semibold text-gray-900 ml-1">
                    "{q}"
                  </span>
                </p>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="transform hover:scale-[1.02] transition-transform duration-200"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : q ? (
          // No Results State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Aucun résultat
            </h2>
            <p className="text-gray-600 max-w-md text-lg mb-8">
              Aucun produit ne correspond à "
              <span className="font-medium text-gray-900">{q}</span>". Essayez
              avec d'autres termes.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector("input");
                  if (input) input.focus();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Nouvelle recherche
              </button>
            </div>
          </div>
        ) : (
          // Initial State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Commencez votre recherche
            </h2>
            <p className="text-gray-600 max-w-md text-lg">
              Utilisez la barre de recherche ci-dessus pour découvrir nos
              produits. Recherchez par nom, catégorie ou description.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">
            Système de recherche propulsé par Firebase Firestore
          </p>
        </div>
      </div>
    </main>
  );
}
