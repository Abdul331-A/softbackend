import mongoose from "mongoose";
import { Post } from "../models/Post.js";



export const createPost = async (req, res) => {
    try {
        // 1. Check if media exists (specifically checking req.files array)
        const hasMedia = req.files && req.files.length > 0;

        // 2. Check if caption exists
        const hasCaption = req.body.caption;

        // 3. LOGIC CHANGE: Only return error if BOTH media and caption are missing
        if (!hasMedia && !hasCaption) {
            return res.status(400).json({
                success: false,
                message: "Either post media or caption is required"
            });
        }

        let mediaArray = [];

        if (hasMedia) {
            mediaArray = req.files.map((file) => {
                const isVideo = file.mimetype.startsWith("video/");
                return {
                    mediaUrl: file.path,
                    mediaType: isVideo ? "video" : "image"
                };
            });
        }

        const newPost = new Post({
            user: req.user.userId,
            media: mediaArray,
            // 4. This line already handles the optional caption correctly
            caption: req.body.caption || "",
        });

        console.log("caption ready", req.body.caption);
        console.log("this media", mediaArray);

        const savedPost = await newPost.save();

        res.status(201).json({ success: true, data: savedPost });

    } catch (error) {
        // Cleanup loop for multiple files (req.files)
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Failed to delete temp file:", err);
                });
            });
        }

        console.error("Post Creation Error:", error);
        res.status(500).json({ success: false, message: "Failed to create post" });
    }
};

export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.userId }).populate("user", "username profilePicture").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: posts });
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
        res.status(200).json({ success: true, data: post, message: "Post updated successfully" });

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
        const post = await Post.find({ user: { $ne: user } }).populate("user", "username profilePicture").sort({ createdAt: -1 });
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
        res.status(200).json({ success: true, message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

