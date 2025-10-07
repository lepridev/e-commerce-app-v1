import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { adminDB } from "@/lib/firebase_admin";
import Link from "next/link";

const fetchCheckout = async (checkoutId) => {
  // ✅ Ajout de la vérification pour checkoutId undefined
  if (!checkoutId) {
    throw new Error("Checkout ID is required");
  }

  const list = await adminDB
    .collectionGroup("checkout_sessions")
    .where("id", "==", checkoutId)
    .get();

  if (list.docs.length === 0) {
    throw new Error("Invalid Checkout ID");
  }
  return list.docs[0].data();
};

export default async function Page({ searchParams }) {
  const { checkout_id } = searchParams;

  // ✅ Gestion sécurisée des erreurs
  let checkout = null;
  let error = null;

  try {
    if (checkout_id) {
      checkout = await fetchCheckout(checkout_id);
    }
  } catch (err) {
    console.error("Error fetching checkout:", err);
    error = err.message;
  }

  return (
    <main>
      <Header />
      <section className="min-h-screen flex flex-col gap-3 justify-center items-center">
        <div className="flex justify-center w-full">
          <img
            src="/svgs/Mobile payments-rafiki.svg"
            className="h-48"
            alt="Payment failed illustration"
          />
        </div>

        <h1 className="text-2xl font-semibold">
          {error ? "Checkout Error" : "Your Payment Was Not Successful"}
        </h1>

        {/* ✅ Message d'erreur informatif */}
        {error && (
          <p className="text-red-500 text-sm max-w-md text-center">{error}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <Link href={"/"}>
            <button className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg bg-white hover:bg-blue-50 transition-colors">
              Continue Shopping
            </button>
          </Link>

          {/* ✅ Bouton Retry seulement si checkout est disponible */}
          {checkout?.url && (
            <Link href={checkout.url}>
              <button className="bg-blue-600 border px-5 py-2 rounded-lg text-white hover:bg-blue-700 transition-colors">
                Retry Payment
              </button>
            </Link>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
