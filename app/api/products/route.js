import { NextResponse } from "next/server";
import { createNewProduct } from "@/lib/firestore/products/write";

export async function POST(req) {
  try {
    // ✅ Vérifier que la requête a un body
    if (!req.body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

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
      isFeatured,
    } = body;

    // ✅ Validation améliorée
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!shortDescription?.trim()) {
      return NextResponse.json(
        { error: "Short description is required" },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json({ error: "Brand is required" }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!price || isNaN(price)) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!featureImage) {
      return NextResponse.json(
        { error: "Feature image is required" },
        { status: 400 }
      );
    }

    // ✅ Utiliser votre fonction de création
    const result = await createNewProduct({
      data: {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        brandId,
        categoryId,
        stock: parseInt(stock) || 0,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : 0,
        description: description?.trim() || "",
        featureImage,
        images: Array.isArray(images) ? images : [],
        isFeatured: Boolean(isFeatured),
      },
    });

    // ✅ Vérifier le résultat
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // ✅ Réponse JSON valide
    return NextResponse.json(
      {
        success: true,
        id: result.id,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);

    // ✅ Toujours renvoyer une réponse JSON valide
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
