import type { RequestHandler } from 'express';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const fileUploadHandler: RequestHandler = (req, _res, next) => {
    const form = formidable({
        multiples: false,
        maxFileSize: 5 * 1024 * 1024,
        filter: ({ mimetype }) => {
            return mimetype ? mimetype.includes('image') : false;
        },
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(new Error(err.message, { cause: { status: 400 } }));
            return;
        }

        const flatFields = Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [
                k,
                Array.isArray(v) ? v[0] : v,
            ]),
        );

        const file = files.image;
        const upFile = Array.isArray(file) ? file[0] : file;

        if (upFile) {
            try {
                const result = await cloudinary.uploader.upload(
                    upFile.filepath,
                    {
                        folder: `recipes/user_${req.userId}`,
                        public_id: `recipe_${Date.now()}`,
                    },
                );
                req.body = { ...flatFields, imageUrl: result.secure_url };
                next();
            } catch {
                next(
                    new Error('Cloudinary upload failed', {
                        cause: { status: 500 },
                    }),
                );
                return;
            }
        } else {
            req.body = { ...flatFields };
            next();
        }
    });
};

export default fileUploadHandler;
