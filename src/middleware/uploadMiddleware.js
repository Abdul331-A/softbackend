import multer from 'multer';
import path from 'path';

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check the fieldname used in the frontend/Postman
        if (file.fieldname === 'profilePic') {
            // Save profile pictures here
            cb(null, 'uploads/profiles/'); 
        } else if (file.fieldname === 'postMedia') {
            // Save post images/videos here
            cb(null, 'uploads/posts/'); 
        } else {
            // Default folder for other uploads
            cb(null, 'uploads/'); 
        }
    },
    filename: (req, file, cb) => {
        // unique filename: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File Filter (To accept videos for posts but only images for profile)
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
        // Profile Pic: Allow ONLY images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Profile picture must be an image!'), false);
        }
    } else if (file.fieldname === 'postMedia') {
        // Post Media: Allow Images AND Videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Post media must be an image or video!'), false);
        }
    } else {
        cb(null, true);
    }
};

// Initialize Multer
export const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Optional: Limit file size to 50MB
});