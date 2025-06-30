const express = require('express');
const { createPost, getAllPosts, getPostById, updatePost, deletePost, getMyPosts, toggleLike, getMyFavoritePosts } = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPost);

router.get('/', getAllPosts);
router.get('/my-posts', authMiddleware, getMyPosts);
router.get('/my-favorites', authMiddleware, getMyFavoritePosts); 
router.get('/:id', getPostById);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, toggleLike);

module.exports = router;