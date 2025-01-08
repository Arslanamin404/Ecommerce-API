# **Cloudinary and Multer Integration for Image Uploads**

This documentation outlines how to integrate **Cloudinary** and **Multer** for uploading and managing images in a Node.js application.

---
u
## **1. Cloudinary Setup**

### **1.1 Install Cloudinary SDK**

Run the following command to install the Cloudinary SDK:

```bash
npm install cloudinary
```

### **1.2 Cloudinary Configuration**

Add the following code to configure Cloudinary with your credentials:

```typescript
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/env";

// Configuration
cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});
```

### **1.3 Image Upload Function**

The `uploadToCloudinary` function handles file uploads to Cloudinary:

```typescript
export const uploadToCloudinary = async (filePath: string, folder: string) => {
  try {
    if (!filePath || !folder) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      use_filename: true,
      folder,
    });

    console.log("File uploaded to Cloudinary:", result.url);
    return result;
  } catch (error) {
    console.error(`Cloudinary upload error: ${error}`);
    throw new Error("Failed to upload to Cloudinary");
  }
};
```

#### Key Options:

- **resource_type: "auto"**, Automatically detects the type of resource (image, video, etc.).
- **use_filename: true**, Keeps the original filename.
- **folder**, Organizes uploads into folders in your Cloudinary account.

---

## **2. Multer Setup**

Multer is a util function for handling file uploads in Node.js. In this setup, Multer saves files locally before uploading them to Cloudinary.

### **2.1 Install Multer**

Run the following command to install Multer:

```bash
npm install multer
```

### **2.2 Configure Multer**

Set up Multer for handling file uploads locally before transferring them to Cloudinary:

```typescript
import multer, { FileFilterCallback, StorageEngine } from "multer";
import path from "path";

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("./public/uploads")); // Temporary storage
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit: 2 MB
});
```

---

## **3. Profile Picture Upload Flow**

### **3.1 Controller Function**

This function handles uploading the profile picture to Cloudinary and updating the user profile:

```typescript
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

static async handle_update_profile_picture(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.file) {
            return API_Response(res, 400, false, "No file uploaded");
        }

        const user = req.user; // User fetched from authentication middleware
        if (!user) {
            return API_Response(res, 404, false, "User not found.");
        }

        const profilePicturePath = req.file.path;
        const folder = "profilePictures";

        // Upload to Cloudinary
        const result = await uploadToCloudinary(profilePicturePath, folder);

        // Delete local file after successful upload
        fs.unlinkSync(profilePicturePath);

        // Update user's profile picture URL
        user.profilePicture = result?.secure_url;
        await user.save();

        return API_Response(res, 200, true, "Profile picture updated successfully.", undefined, {
            profile_picture: user.profilePicture
        });
    } catch (error) {
        next(error);
    }
}
```

---

## **4. Key Components**

### 1. Multer Util function

Handles file uploads and temporary local storage:

- Validates file type (JPEG, PNG, JPG).
- Restricts file size to 2 MB.
- Saves files to ./public/uploads.

### 2. Cloudinary Upload

Uploads files from the local server to Cloudinary for secure, scalable storage.

### 3. Cleanup

Deletes temporary files from the local directory using fs.unlinkSync to free up disk space.

### 4. User Model Update

Saves the Cloudinary image URL to the user’s profile in the database.

---

## **5. Error Handling**

### **Handled Errors**

1. No file uploaded.
2. Invalid file type.
3. User not found.
4. Cloudinary upload failure.

### **How Errors are Managed**

- Specific error messages are provided for debugging and user feedback.
- Temporary files are deleted after the upload process.

---

## **6. Dependencies**

Install all necessary dependencies using npm:

```bash
npm install cloudinary multer express fs path
```

---

## **7. Usage Example**

### **Express Route**

Set up an Express route to handle profile picture uploads:

```typescript
import { Router } from "express";
import { upload } from "../middlewares/multer";
import { handle_update_profile_picture } from "../controllers/userController";

const router = Router();

router.post(
  "/update-profile-picture",
  upload.single("profilePicture"),
  handle_update_profile_picture
);

export default router;
```

---

## **8. Notes**

### **Environment Variables**

Store sensitive credentials in a `.env` file:

```
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Best Practices**

- Always clean up temporary files after uploading to Cloudinary.
- Validate user authentication before allowing uploads.

---
