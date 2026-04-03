const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes Import
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- 1. CORS Configuration (FIXED) ---
// Note: Origin se last wala "/" hata diya hai taaki browser block na kare
app.use(cors({
    origin: "https://socialappamit.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- 2. Standard Middlewares ---
app.use(express.json()); // JSON data read karne ke liye
app.use(express.urlencoded({ extended: true })); // Form data handle karne ke liye
app.use('/uploads', express.static('uploads')); // Static files access karne ke liye

// --- 3. Routes Registration ---
// Auth Routes: Signup, Login, Profile Update
app.use('/api/auth', authRoutes);

// Post Routes: Create, Feed, Like, Comment
app.use('/api/posts', postRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.send('API is running successfully...');
});

// --- 4. 404 Not Found Middleware ---
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// --- 5. Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});