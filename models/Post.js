const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userProfilePic: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        required: function() {
            // Agar image aur video dono nahi hain, tabhi content mandatory hai
            return !this.image && !this.video;
        }
    },
    image: {
        type: String,
        default: "",
        required: function() {
            // Agar content aur video dono nahi hain, tabhi image mandatory hai
            return !this.content && !this.video;
        }
    },
    video: {
        type: String,
        default: "",
        required: function() {
            // Agar content aur image dono nahi hain, tabhi video mandatory hai
            return !this.content && !this.image;
        }
    },
    postType: {
        type: String,
        enum: ['text', 'image', 'video'], // 'content' ki jagah 'text' use karna zyada clear hai
        default: 'text'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        username: String,
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);