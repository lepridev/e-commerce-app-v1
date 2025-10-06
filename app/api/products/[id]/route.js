// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 👉 Ici tu devrais remplacer par ton DB client (Mongo, Prisma, etc.)
let products = []; // stockage temporaire en mémoire

// GET single product
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const product = products.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE product
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    let productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...body,
      updatedAt: new Date(),
    };

    products[productIndex] = updatedProduct;

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteDoc(doc(db, "products", id));
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
