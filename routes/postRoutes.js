// const express = require('express');
// const router = express.Router();
// const {
//     createPost,
//     getAllPosts,
//     getUserPosts,
//     likePost,
//     addComment
// } = require('../controllers/postController');
// const { protect } = require('../middleware/authMiddleware');

// // 1. Get All Posts (Public Feed)
// // GET /api/posts
// router.get('/', getAllPosts);

// // 2. Create a Post (Private)
// // POST /api/posts
// router.post('/', protect, createPost);

// // 3. Like/Unlike a Post (Private)
// // PUT /api/posts/:id/like
// router.put('/:id/like', protect, likePost);

// // 4. Add a Comment (Private)
// // POST /api/posts/:id/comment
// router.post('/:id/comment', protect, addComment);
// router.get('/user/:userId', getUserPosts);

// module.exports = router;

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

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files is folder mein save hongi (Ensure ye folder exist karta ho)
    },
    filename: (req, file, cb) => {
        // File ka naam unique banane ke liye: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter (Optional: Sirf images aur videos allow karne ke liye)
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
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- ROUTES ---

// 1. Get All Posts (Public Feed)
router.get('/', getAllPosts);

// 2. Create a Post (Private) - Ab 'upload.single' middleware add kiya hai
// 'file' wahi naam hona chahiye jo frontend ke FormData mein use hoga
router.post('/', protect, upload.single('file'), createPost);

// 3. Like/Unlike a Post (Private)
router.put('/:id/like', protect, likePost);

// 4. Add a Comment (Private)
router.post('/:id/comment', protect, addComment);

// 5. Get User Specific Posts
router.get('/user/:userId', getUserPosts);

module.exports = router;