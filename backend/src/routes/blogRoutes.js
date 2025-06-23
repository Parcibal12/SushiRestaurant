const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', blogController.getAllPosts);
router.get('/my-posts', authMiddleware, blogController.getMyPosts);
router.get('/:id', blogController.getPostById);



router.post('/', authMiddleware, upload.single('image'), blogController.createPost);
router.put('/:id', authMiddleware, blogController.updatePost);
router.delete('/:id', authMiddleware, blogController.deletePost);

module.exports = router;