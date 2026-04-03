const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    registerUser,
    loginUser,
    updateUserProfile,
    getUserFriends,
    followUnfollowUser,
    getSuggestedUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// --- Multer Storage Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dhyan rakhein ki 'uploads/' folder backend root mein ho
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Unique filename banane ke liye timestamp use kiya hai
        cb(null, "profile-" + Date.now() + path.extname(file.originalname));
    }
});

// File filter (optional: sirf images allow karne ke liye)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 1. Signup Route (Ab isme upload.single('profilePic') add kiya hai)
// Isse naya user registration ke waqt hi photo upload kar payega
router.post('/signup', upload.single('profilePic'), registerUser);

// 2. Login Route
router.post('/login', loginUser);

// 3. Update Profile Route (Private)
router.put('/profile', protect, upload.single('profilePic'), updateUserProfile);

// 4. Follow/Unfollow Route (Private)
router.post('/follow/:id', protect, followUnfollowUser);

// 5. Get Suggested Users (Private)
router.get('/suggested', protect, getSuggestedUsers);

// 6. Get Followers/Following List (Private)
router.get('/:id/friends', protect, getUserFriends);

module.exports = router;