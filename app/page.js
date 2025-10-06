import Header from "./components/Header";
import FeaturedProductSlider from "./components/Sliders";
import Collections from "./components/Collections";
import { getCollections } from "@/lib/firestore/collections/read_server";
import Categories from "./components/Categories";
import { getCategories } from "@/lib/firestore/categories/read_server";
import ProductsGridView from "./components/Products";
import CustomerReviews from "./components/CustomerReviews";
import Brands from "./components/Brands";
import { getBrands } from "@/lib/firestore/brands/read_server";
import Footer from "./components/Footer";
import {
  getFeaturedProducts,
  getProducts,
} from "@/lib/firestore/products/read_server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredProducts, collections, categories, products, brands] =
    await Promise.all([
      getFeaturedProducts(),
      getCollections(),
      getCategories(),
      getProducts(),
      getBrands(),
    ]);

  // 🔹 Sérialisation des données
  const sanitizedFeaturedProducts = featuredProducts.map((product) => ({
    ...product,
    createdAt: product.createdAt?.toDate?.()
      ? product.createdAt.toDate().toISOString()
      : null,
  }));

  return (
    <main className="w-screen h-screen overflow-x-hidden overflow-y-auto">
      <Header />
      <FeaturedProductSlider featuredProducts={sanitizedFeaturedProducts} />
      <Collections collections={collections} />
      <Categories categories={categories} />
      <ProductsGridView products={products} />
      <CustomerReviews />
      <Brands brands={brands} />
      <Footer />
    </main>
  );
}
