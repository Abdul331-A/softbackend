import mongoose from "mongoose";
import { Post } from "../models/Post";



export const createPost = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: "Post media is required" });
        }
        const isVideo = req.file.mimetype.startsWith('video/');
        const type = isVideo ? "video" : "image";

        const newPost = new Post({
            user: req.user.userId,
            mediaUrl: req.file.path,
            mediaType: type,
            caption: req.body.caption || ""
        });
        const savedPost = await newPost.save();

        res.status(201).json({ success: true, data: savedPost });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
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

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const post=await Post.find({user:userId}).populate("user","username profilePicture").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: post });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getFeedPosts = async (req, res) => {
    try {
        const user=req.user.userId;
        
    } catch (error) {
        
    }
};