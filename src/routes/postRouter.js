import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { createPost, deletePost, getFeedPosts, getMyPosts, getUserPost, toggleLikePost } from '../controller/postController.js';
import protect from '../middleware/authMiddleware.js';



const postRouter = express.Router();


//create post 
postRouter.post('/create-post', protect, upload.single('media'), createPost);

//get my posts
postRouter.get('/my-posts', protect, getMyPosts);

//get user posts
postRouter.get('/user-posts/:userId', protect, getUserPost);

postRouter.get('/feed', protect, getFeedPosts);

postRouter.post('/toggle-like/:postId', protect, toggleLikePost);

postRouter.delete('/delete-post/:postId', protect, deletePost);

export default postRouter;