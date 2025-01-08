import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';


// Configuration
cloudinary.config({
    cloud_name: config.CLOUDINARY_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

// Upload an image
export const uploadToCloudinary = async (filePath: string, folder: string) => {
    try {
        if (!filePath || !folder) return null;

        // upload the file on cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            use_filename: true,
            folder
        });

        // file has been uploaded successfully
        console.log("File upload on cloudinary", result.url);

        return result;
    } catch (error) {
        console.log(`Cloudinary upload error: ${error}`);
        throw new Error("Failed to upload Cloudinary")
    }
} 