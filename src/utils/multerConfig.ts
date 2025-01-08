import multer, { FileFilterCallback, StorageEngine } from "multer"
import path from "path"
import { Request } from "express"

const storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads`)); // Save files in the "uploads" folder
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
})


function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    // The function should call `cb` with a boolean to indicate if the file should be accepted
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        // To accept the file pass `true` and To reject the file pass `false`:
        cb(null, true);
    } else {
        cb(new Error('Invalid file type only JPEG, PNG, JPG are allowed')); // Reject with an error
    }
}



export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } //2mb file size limit
})