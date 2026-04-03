const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async(req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio,
                followers: user.followers,
                following: user.following,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio,
                followers: user.followers,
                following: user.following,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.updateUserProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.username = req.body.username || user.username;
            user.bio = req.body.bio || user.bio;

            if (req.file) {
                user.profilePic = `uploads/${req.file.filename}`;
            } else {
                user.profilePic = req.body.profilePic || user.profilePic;
            }

            const updatedUser = await user.save();

            const finalUser = await User.findById(updatedUser._id)
                .select("-password")
                .populate("followers following", "username profilePic bio");

            res.json({
                _id: finalUser._id,
                username: finalUser.username,
                email: finalUser.email,
                profilePic: finalUser.profilePic,
                bio: finalUser.bio,
                followers: finalUser.followers,
                following: finalUser.following,
                token: generateToken(finalUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.getUserFriends = async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({ path: 'followers', select: 'username profilePic bio' })
            .populate({ path: 'following', select: 'username profilePic bio' });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            followers: user.followers || [],
            following: user.following || []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.followUnfollowUser = async(req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });
        if (id === req.user._id.toString()) return res.status(400).json({ message: "You cannot follow yourself" });

        const isFollowing = currentUser.following.includes(id);
        const isFollower = currentUser.followers.includes(id);

        if (isFollowing || isFollower) {
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id, followers: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id, following: req.user._id } });

            const updatedUser = await User.findById(req.user._id)
                .select("-password")
                .populate("followers following", "username profilePic bio");

            return res.status(200).json({
                message: "Removed successfully",
                user: updatedUser
            });
        } else {
            // Follow logic
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

            // FIXED: Populate hamesha fresh data deta hai
            const updatedUser = await User.findById(req.user._id)
                .select("-password")
                .populate("followers following", "username profilePic bio");

            return res.status(200).json({
                message: "Followed successfully",
                user: updatedUser
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSuggestedUsers = async(req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const users = await User.find({
            _id: { $nin: [...user.following, userId] }
        }).select("-password").limit(5);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};