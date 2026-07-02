import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

/**
 * Extract the Cloudinary public_id from a stored secure_url.
 * assumes plain upload URLs (no transformation segments) — that's all
 * we ever generate in fileUploadHandler. Returns null if the URL isn't a
 * Cloudinary upload URL.
 */
export const publicIdFromUrl = (url: string): string | null => {
    const marker = '/upload/';
    const i = url.indexOf(marker);
    if (i === -1) return null;
    return url
        .slice(i + marker.length)
        .replace(/^v\d+\//, '') // drop version segment
        .replace(/\.[^./]+$/, ''); // drop file extension
};

/** Delete the Cloudinary asset behind a stored imageUrl, if any. */
export const deleteImageByUrl = async (url?: string | null) => {
    if (!url) return;
    const publicId = publicIdFromUrl(url);
    if (publicId) await cloudinary.uploader.destroy(publicId);
};
