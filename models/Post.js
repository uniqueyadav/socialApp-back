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
            return !this.image && !this.video;
        }
    },
    image: {
        type: String,
        default: "",
        required: function() {
            return !this.content && !this.video;
        }
    },
    video: {
        type: String,
        default: "",
        required: function() {
            return !this.content && !this.image;
        }
    },
    postType: {
        type: String,
        enum: ['text', 'image', 'video'],
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