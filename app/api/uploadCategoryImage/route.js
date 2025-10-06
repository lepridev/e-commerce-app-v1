import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req) => {
  try {
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
        { folder: "categories" },
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
