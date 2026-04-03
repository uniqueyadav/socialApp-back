const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    bio: {
        type: String,
        default: "Hey there! I am using SocialApp.",
        maxlength: 160
    },
    // --- Following & Followers Logic ---
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Ye batata hai ki array mein User ki IDs hongi
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);