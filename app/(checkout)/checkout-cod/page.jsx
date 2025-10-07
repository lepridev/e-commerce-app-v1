import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { admin, adminDB } from "@/lib/firebase_admin";
import Link from "next/link";

const fetchCheckout = async (checkoutId) => {
  // ✅ Vérification cruciale
  if (!checkoutId) {
    throw new Error("Checkout ID is required");
  }

  const list = await adminDB
    .collectionGroup("checkout_sessions_cod")
    .where("id", "==", checkoutId)
    .get();

  if (list.docs.length === 0) {
    throw new Error("Invalid Checkout ID");
  }
  return list.docs[0].data();
};

const processOrder = async ({ checkout }) => {
  // ✅ Vérifier si checkout existe
  if (!checkout?.id) {
    throw new Error("Invalid checkout data");
  }

  const order = await adminDB.doc(`orders/${checkout.id}`).get();
  if (order.exists) {
    return false;
  }

  const uid = checkout?.metadata?.uid;

  await adminDB.doc(`orders/${checkout.id}`).set({
    checkout: checkout,
    payment: {
      amount: checkout?.line_items?.reduce((prev, curr) => {
        return (
          prev + (curr?.price_data?.unit_amount || 0) * (curr?.quantity || 0)
        );
      }, 0),
    },
    uid: uid,
    id: checkout.id,
    paymentMode: "cod",
    timestampCreate: admin.firestore.Timestamp.now(),
  });

  const productList =
    checkout?.line_items?.map((item) => {
      return {
        productId: item?.price_data?.product_data?.metadata?.productId,
        quantity: item?.quantity || 0,
      };
    }) || [];

  const user = await adminDB.doc(`users/${uid}`).get();

  const productIdsList = productList.map((item) => item?.productId);

  const newCartList = (user?.data()?.carts ?? []).filter(
    (cartItem) => !productIdsList.includes(cartItem?.id)
  );

  await adminDB.doc(`users/${uid}`).set(
    {
      carts: newCartList,
    },
    { merge: true }
  );

  const batch = adminDB.batch();

  productList.forEach((item) => {
    if (item.productId) {
      batch.update(adminDB.doc(`products/${item.productId}`), {
        orders: admin.firestore.FieldValue.increment(item.quantity),
      });
    }
  });

  await batch.commit();
  return true;
};

export default async function Page({ searchParams }) {
  // ✅ Sécuriser l'accès aux searchParams
  const safeSearchParams = await searchParams;
  const { checkout_id } = safeSearchParams || {};

  let checkout = null;
  let result = false;
  let error = null;

  try {
    if (checkout_id) {
      checkout = await fetchCheckout(checkout_id);
      result = await processOrder({ checkout });
    } else {
      error = "No checkout ID provided";
    }
  } catch (err) {
    console.error("Checkout COD error:", err);
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
            alt="Cash on Delivery success"
          />
        </div>

        {error ? (
          <>
            <h1 className="text-2xl font-semibold text-red-600">
              Order Processing Error
            </h1>
            <p className="text-gray-600">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">
              Your Order Is{" "}
              <span className="font-bold text-green-600">Successfully</span>{" "}
              Placed
            </h1>
            <p className="text-gray-600">
              {result
                ? "Order processed successfully!"
                : "Order already exists"}
            </p>
          </>
        )}

        <div className="flex items-center gap-4 text-sm mt-4">
          <Link href="/">
            <button className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg bg-white hover:bg-blue-50 transition-colors">
              Continue Shopping
            </button>
          </Link>

          <Link href="/account">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Go To Orders Page
            </button>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
