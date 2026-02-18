import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
// import fs from "fs";


export const createPost = async (req, res) => {
    try {
        const hasMedia = req.files && req.files.length > 0;
        const hasCaption = req.body.caption;
        const { location } = req.body;

        if (!hasMedia && !hasCaption) {
            return res.status(400).json({
                success: false,
                message: "Either post media or caption is required",
            });
        }

        let mediaArray = [];

        if (hasMedia) {
            for (const file of req.files) {
                const isVideo = file.mimetype.startsWith("video/");

                // 1️⃣ Upload to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(
                    file.path,
                    {
                        resource_type: isVideo ? "video" : "image",
                        folder: "posts",
                    }
                );

                let thumbnailUrl = null;

                // 2️⃣ Create thumbnail ONLY for video
                if (isVideo) {
                    thumbnailUrl = cloudinary.url(uploadResult.public_id, {
                        resource_type: "video",
                        format: "jpg",
                        transformation: [
                            { width: 400, height: 300, crop: "fill" },
                            { start_offset: "2" }, // 2nd second frame
                        ],
                    });
                }

                // 3️⃣ Push to media array (schema based)
                mediaArray.push({
                    mediaUrl: uploadResult.secure_url,
                    thumbnailUrl: thumbnailUrl, // null for image
                    mediaType: isVideo ? "video" : "image",
                    public_id: uploadResult.public_id,
                    location: location || null
                });

                // 4️⃣ Delete local temp file
                // fs.unlinkSync(file.path);
            }
        }

        // 5️⃣ Save post
        const newPost = await Post.create({
            user: req.user._id,
            media: mediaArray,
            caption: req.body.caption || "",
            location: location || ""
        });

        // User.category.push(newPost._id);
        // await User.save();

        res.status(201).json({
            success: true,
            newData: newPost,

        });

    } catch (error) {
        console.error("Post Creation Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create post",
        });
    }
};


export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id }).populate({ path: "user", select: "username profilePic category", populate: { path: "category", select: "media caption createdAt" } }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, getData: posts });

    } catch (error) {

        res.status(500).json({ success: false, message: "Server Error" });

    }
}

export const editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        let { caption, location, deleteMediaIds } = req.body;

        // 🔎 Find Post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // 🔐 Owner Check
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // =========================
        // 🗑 DELETE MEDIA SECTION
        // =========================

        if (typeof deleteMediaIds === "string") {
            deleteMediaIds = JSON.parse(deleteMediaIds);
        }

        if (Array.isArray(deleteMediaIds) && deleteMediaIds.length > 0) {

            const mediaToDelete = post.media.filter(media =>
                deleteMediaIds.includes(media._id.toString())
            );

            // Delete from Cloudinary
            for (let media of mediaToDelete) {
                if (media.public_id) {
                    await cloudinary.uploader.destroy(media.public_id);
                }
            }

            // Remove from DB
            post.media = post.media.filter(media =>
                !deleteMediaIds.includes(media._id.toString())
            );
        }

        // =========================
        // ➕ ADD NEW MEDIA SECTION
        // =========================

        if (req.files && req.files.length > 0) {

            const uploadedMedia = await Promise.all(
                req.files.map(async (file) => {

                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "posts",
                        resource_type: "auto"
                    });

                    return {
                        mediaUrl: result.secure_url,
                        public_id: result.public_id,
                        mediaType: file.mimetype.startsWith("video/")
                            ? "video"
                            : "image",
                        thumbnailUrl: null
                    };
                })
            );

            post.media.push(...uploadedMedia);
        }

        // =========================
        // ✏️ UPDATE TEXT FIELDS
        // =========================

        if (caption !== undefined) post.caption = caption;
        if (location !== undefined) post.location = location;

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        console.error("EDIT POST ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};



export const toggleLikePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.userId;

        // Check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Toggle like
        if (post.likes.includes(userId)) {
            // User already liked the post, remove like
            post.likes.pull(userId);
        } else {
            // User hasn't liked the post, add like
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const getUserPost = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const post = await Post.find({ user: userId }).populate("user", "username profilePicture").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: post });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



export const getFeedPosts = async (req, res) => {
    try {
        const user = req.user.userId;
        const post = await Post.find({ user: { $ne: user } }).populate({ path: "user", select: "username profilePic category", populate: { path: "category", select: "media caption createdAt" } }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: post });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        console.log(postId);

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ success: false, message: "Invalid post ID" });
        }


        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Post.deleteOne({ _id: postId });
        res.status(200).json({ success: true, deleteData: post, message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

