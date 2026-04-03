const Post = require('../models/Post');

exports.createPost = async(req, res) => {
    try {
        const { content, postType } = req.body;
        let fileUrl = "";
        let finalPostType = postType;
        if (req.file) {
            fileUrl = `uploads/${req.file.filename}`;
            if (req.file.mimetype.startsWith('image/')) {
                finalPostType = 'image';
            } else if (req.file.mimetype.startsWith('video/')) {
                finalPostType = 'video';
            }
        } else {
            fileUrl = req.body.image || req.body.video || "";
            if (!finalPostType) {
                finalPostType = req.body.image ? 'image' : req.body.video ? 'video' : 'text';
            }
        }

        if (!content && !fileUrl) {
            return res.status(400).json({
                message: "Please provide at least text, an image, or a video."
            });
        }

        const post = await Post.create({
            user: req.user._id,
            username: req.user.username,
            userProfilePic: req.user.profilePic,
            content,
            image: finalPostType === 'image' ? fileUrl : "",
            video: finalPostType === 'video' ? fileUrl : "",
            postType: finalPostType || 'text',
        });

        const fullPost = await Post.findById(post._id).populate('user', 'username profilePic');

        res.status(201).json(fullPost);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

exports.getAllPosts = async(req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

exports.likePost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user._id.toString();
        if (post.likes.includes(req.user._id)) {

            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {

            post.likes.push(req.user._id);
        }

        await post.save();

        const updatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

exports.addComment = async(req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = {
            user: req.user._id,
            username: req.user.username,
            text,
            createdAt: new Date(),
        };

        post.comments.unshift(newComment);
        await post.save();

        const updatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

exports.getUserPosts = async(req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json(posts || []);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};