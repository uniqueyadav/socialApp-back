const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createPost,
    getAllPosts,
    getUserPosts,
    likePost,
    addComment
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', getAllPosts);
router.post('/', protect, upload.single('file'), createPost);
router.put('/:id/like', protect, likePost);

router.post('/:id/comment', protect, addComment);

router.get('/user/:userId', getUserPosts);

module.exports = router;