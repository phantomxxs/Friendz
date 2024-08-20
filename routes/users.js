import express from 'express';
import {
  getUser,
  getRandomUsers,
  getUserFriends,
  handleFriendRequest
} from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// READ
router.get('/', verifyToken, getUser);
router.get('/add-friends', verifyToken, getRandomUsers)
router.get('/friends', verifyToken, getUserFriends);

// UPDATE
router.patch('/friends/request', verifyToken, handleFriendRequest);


export default router;
