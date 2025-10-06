import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Payload reçu :", body);

    const {
      title,
      shortDescription,
      brandId,
      categoryId,
      stock,
      price,
      salePrice,
      description,
      featureImage,
      images,
      isFeatured, // <-- inclus
    } = body;

    if (
      !title ||
      !shortDescription ||
      !brandId ||
      !categoryId ||
      !price ||
      !featureImage
    ) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const docRef = await addDoc(collection(db, "products"), {
      title,
      shortDescription,
      brandId,
      categoryId,
      stock,
      price,
      salePrice,
      description,
      featureImage,
      images,
      isFeatured: isFeatured || false, // <-- valeur par défaut
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ id: docRef.id }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
