import { Cloudinary } from "@cloudinary/url-gen";

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your-cloud-name",
  },
});

// Cloudinary'den resim URL'si oluştur
export const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary
    .image(publicId)
    .setDeliveryType("fetch")
    .resize(transformations.resize || {})
    .format("auto")
    .quality("auto")
    .toURL();
};

// Görüntü yükleme fonksiyonu
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ecommerce_upload"
  );

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your-cloud-name"
      }/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (data.secure_url) {
      return { url: data.secure_url, publicId: data.public_id };
    }
    throw new Error("Upload failed");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default cloudinary;
