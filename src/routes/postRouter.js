import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { createPost, deletePost, editPost, getFeedPosts, getMyPosts, getUserPost, toggleLikePost } from '../controller/postController.js';
import protect from '../middleware/authMiddleware.js';



const postRouter = express.Router();


//create post 
postRouter.post('/create-post', protect, upload.single('media'), createPost);

//get my posts
postRouter.get('/my-posts', protect, getMyPosts);

//edit post
postRouter.put('/edit-post/:postId', protect, editPost);

//get user posts
postRouter.get('/user-posts/:userId', protect, getUserPost);

//get feed posts
postRouter.get('/feed', protect, getFeedPosts);

//toggle like
postRouter.post('/toggle-like/:postId', protect, toggleLikePost);

//delete post
postRouter.delete('/delete-post/:postId', protect, deletePost);

export default postRouter;