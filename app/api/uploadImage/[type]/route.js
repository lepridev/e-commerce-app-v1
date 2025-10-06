import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req, { params }) => {
  try {
    const { type } = await params;

    // Ajouter "collections" aux types autorisés
    if (!["brands", "categories", "products", "collections"].includes(type)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid type. Must be 'brands', 'categories', 'products' or 'collections'.",
        }),
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: type },
        (error, result) => {
          if (error) {
            console.error(error);
            resolve(
              new Response(JSON.stringify({ error: error.message }), {
                status: 500,
              })
            );
          } else {
            resolve(
              new Response(JSON.stringify({ url: result.secure_url }), {
                status: 200,
              })
            );
          }
        }
      );

      stream.end(buffer);
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
