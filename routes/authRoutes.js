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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, "profile-" + Date.now() + path.extname(file.originalname));
    }
});

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

router.post('/signup', upload.single('profilePic'), registerUser);

router.post('/login', loginUser);

router.put('/profile', protect, upload.single('profilePic'), updateUserProfile);

router.post('/follow/:id', protect, followUnfollowUser);

router.get('/suggested', protect, getSuggestedUsers);

router.get('/:id/friends', protect, getUserFriends);

module.exports = router;