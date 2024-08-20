import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getFeedsPosts,
  getUserPosts,
  likePost,
} from '../controllers/posts.js';

const router = express.Router();

// GET
router.get('/', verifyToken, getFeedsPosts);
router.get('/:userId/posts', verifyToken, getUserPosts)

// UPDATE
router.patch('/:postId', verifyToken, likePost)


export default router;
