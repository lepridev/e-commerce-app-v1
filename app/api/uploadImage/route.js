// app/api/uploadImage/products/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      // ✅ TOUJOURS renvoyer du JSON
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Votre logique d'upload Cloudinary ici...
    const uploadResult = await uploadToCloudinary(file);

    // ✅ RÉPONSE JSON VALIDE
    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);

    // ✅ ERREUR EN JSON
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
