import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
// import fs from "fs";


export const createPost = async (req, res) => {
    try {
        const hasMedia = req.files && req.files.length > 0;
        const hasCaption = req.body.caption;

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
                });

                // 4️⃣ Delete local temp file
                // fs.unlinkSync(file.path);
            }
        }

        // 5️⃣ Save post
        const newPost = await Post.create({
            user: req.user.userId,
            media: mediaArray,
            caption: req.body.caption || "",
        });

        // User.category.push(newPost._id);
        // await User.save();

        res.status(201).json({
            success: true,
            newData: newPost,

        });

    } catch (error) {
        console.error("Post Creation Error:", error);

        // cleanup temp files
        // if (req.files && req.files.length > 0) {
        //     req.files.forEach((file) => {
        //         if (fs.existsSync(file.path)) {
        //             fs.unlinkSync(file.path);
        //         }
        //     });
        // }

        res.status(500).json({
            success: false,
            message: "Failed to create post",
        });
    }
};


export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.userId }).populate({path:"user", select:"username profilePic category",populate:{path:"category", select:"media caption createdAt"}}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, getData: posts });

    } catch (error) {

        res.status(500).json({ success: false, message: "Server Error" });

    }
}

export const editPost = async (req, res) => {
    try {

        console.log("✅ editPost called");
        console.log("Params:", req.params);
        console.log("Body:", req.body);
        console.log("User:", req.user);


        const postId = req.params.postId;
        const { caption } = req.body;

        console.log(postId, caption);


        if (!caption) {
            return res.status(400).json({ success: false, message: "caption is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        post.caption = caption;
        await post.save();
        res.status(200).json({ success: true, UpdateData: post, message: "Post updated successfully" });

    } catch (error) {
        console.log("EDIT POST ERROR:", error);
        res.status(500).json({ success: false, message: "Server Error" });

    }
}


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
        const post = await Post.find({ user: { $ne: user } }).populate({path:"user", select:"username profilePic category",populate:{path:"category", select:"media caption createdAt"}}).sort({ createdAt: -1 });
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

        if (post.user.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Post.deleteOne({ _id: postId });
        res.status(200).json({ success: true, deleteData: post, message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

