// const Post = require('../models/Post');

// // @desc    Create a new post (Text, Image, or Both)
// // @route   POST /api/posts
// // @access  Private (Needs Auth)
// exports.createPost = async(req, res) => {
//     try {
//         const { content, image, video, postType } = req.body;

//         // 1. Validation: Kam se kam ek cheez honi chahiye
//         if (!content && !image && !video) {
//             return res.status(400).json({
//                 message: "Please provide at least text, an image, or a video."
//             });
//         }

//         // 2. Database mein save karo
//         const post = await Post.create({
//             user: req.user._id, // authMiddleware se aaya
//             username: req.user.username,
//             userProfilePic: req.user.profilePic,
//             content,
//             image: image || "",
//             video: video || "",
//             postType: postType || (image ? 'image' : video ? 'video' : 'text'),
//         });

//         // Naya post return karne se pehle user details populate karo
//         const fullPost = await Post.findById(post._id).populate('user', 'username profilePic');

//         res.status(201).json(fullPost);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error: " + error.message });
//     }
// };

// // @desc    Get all posts for the feed
// // @route   GET /api/posts
// // @access  Public
// exports.getAllPosts = async(req, res) => {
//     try {
//         // Latest posts pehle + User details populate
//         const posts = await Post.find()
//             .populate('user', 'username profilePic')
//             .sort({ createdAt: -1 });

//         res.json(posts);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error: " + error.message });
//     }
// };

// // @desc    Like or Unlike a post
// // @route   PUT /api/posts/:id/like
// // @access  Private
// exports.likePost = async(req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);

//         if (!post) return res.status(404).json({ message: "Post not found" });

//         const userId = req.user._id.toString();

//         // Check if user already liked the post
//         if (post.likes.includes(req.user._id)) {
//             // Unlike logic
//             post.likes = post.likes.filter((id) => id.toString() !== userId);
//         } else {
//             // Like logic
//             post.likes.push(req.user._id);
//         }

//         await post.save();

//         // Updated post with user details return karo
//         const updatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
//         res.json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error: " + error.message });
//     }
// };

// // @desc    Add a comment to a post
// // @route   POST /api/posts/:id/comment
// // @access  Private
// exports.addComment = async(req, res) => {
//     try {
//         const { text } = req.body;
//         if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

//         const post = await Post.findById(req.params.id);
//         if (!post) return res.status(404).json({ message: "Post not found" });

//         const newComment = {
//             user: req.user._id,
//             username: req.user.username,
//             text,
//             createdAt: new Date(),
//         };

//         // Naya comment list ke shuruat mein daalne ke liye unshift use karo
//         post.comments.unshift(newComment);
//         await post.save();

//         const updatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
//         res.json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error: " + error.message });
//     }
// };

// // @desc    Get posts by a specific user ID
// // @route   GET /api/posts/user/:userId
// // @access  Public
// exports.getUserPosts = async(req, res) => {
//     try {
//         const posts = await Post.find({ user: req.params.userId })
//             .populate('user', 'username profilePic')
//             .sort({ createdAt: -1 });

//         // Frontend par map function crash na ho isliye empty array return karna safe hai
//         res.status(200).json(posts || []);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };
const Post = require('../models/Post');

// @desc    Create a new post (Text, Image, or Both)
// @route   POST /api/posts
// @access  Private (Needs Auth)
exports.createPost = async(req, res) => {
    try {
        const { content, postType } = req.body;

        // --- FILE HANDLING LOGIC ---
        let fileUrl = "";
        let finalPostType = postType;

        // Agar multer ne file upload ki hai toh uska path use karo
        if (req.file) {
            // Hum path ko normalize kar rahe hain taaki frontend pe URL sahi dikhe
            fileUrl = `uploads/${req.file.filename}`;

            // File type detect karo (image hai ya video)
            if (req.file.mimetype.startsWith('image/')) {
                finalPostType = 'image';
            } else if (req.file.mimetype.startsWith('video/')) {
                finalPostType = 'video';
            }
        } else {
            // Agar file nahi hai toh purana link wala logic (optional)
            fileUrl = req.body.image || req.body.video || "";
            if (!finalPostType) {
                finalPostType = req.body.image ? 'image' : req.body.video ? 'video' : 'text';
            }
        }

        // 1. Validation: Kam se kam content ya file honi chahiye
        if (!content && !fileUrl) {
            return res.status(400).json({
                message: "Please provide at least text, an image, or a video."
            });
        }

        // 2. Database mein save karo
        const post = await Post.create({
            user: req.user._id, // authMiddleware se aaya
            username: req.user.username,
            userProfilePic: req.user.profilePic,
            content,
            // Humne image aur video fields ko update kiya hai fileUrl se
            image: finalPostType === 'image' ? fileUrl : "",
            video: finalPostType === 'video' ? fileUrl : "",
            postType: finalPostType || 'text',
        });

        // Naya post return karne se pehle user details populate karo
        const fullPost = await Post.findById(post._id).populate('user', 'username profilePic');

        res.status(201).json(fullPost);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

// @desc    Get all posts for the feed
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async(req, res) => {
    try {
        // Latest posts pehle + User details populate
        const posts = await Post.find()
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user._id.toString();

        // Check if user already liked the post
        if (post.likes.includes(req.user._id)) {
            // Unlike logic
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
            // Like logic
            post.likes.push(req.user._id);
        }

        await post.save();

        // Updated post with user details return karo
        const updatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
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

        // Naya comment list ke shuruat mein daalne ke liye unshift use karo
        post.comments.unshift(newComment);
        await post.save();

        const updatedPost = await Post.findById(post._id).populate('user', 'username profilePic');
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

// @desc    Get posts by a specific user ID
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async(req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 });

        // Frontend par map function crash na ho isliye empty array return karna safe hai
        res.status(200).json(posts || []);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};