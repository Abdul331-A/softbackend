import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary.js';

const storage = new CloudinaryStorage({

    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'uploads/others';
        let resourceType = 'image'; // Default to image

        // Logic to determine folder based on fieldname
        if (file.fieldname === 'profilePic') {
            folderName = 'uploads/profiles';
        } else if (file.fieldname === 'postMedia') {
            folderName = 'uploads/posts';
        }

        // Logic to determine resource_type (Crucial for video uploads)
        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }

        return {
            folder: folderName,
            resource_type: resourceType, // 'image', 'video', or 'auto'
            public_id: `${file.fieldname}-${Date.now()}`, // Optional: Custom filename
            // allowed_formats: ['jpg', 'png', 'mp4', 'mov'], // Optional: restrict formats here
        };
    },
});

// 3. File Filter (Kept exactly the same as your original code)
const fileFilter = (req, file, cb) => {
    // Android real device videos
    if (file.mimetype === "application/octet-stream") {
        return cb(null, true);
    }

    if (file.fieldname === 'profilePic') {
        // Profile Pic: Allow ONLY images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Profile picture must be an image!'), false);
        }
    } else if (file.fieldname === 'postMedia') {
        // Post Media: Allow Images AND Videos
        if (
            file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Post media must be an image or video!'), false);
        }
    } else {
        cb(null, true);
    }
};


// 4. Initialize Multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB
});