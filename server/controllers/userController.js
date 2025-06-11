const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtsec = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });
        const token = jwt.sign({ userId: user._id }, jwtsec, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, jwtsec, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: 'Token not found' });
        const decoded = jwt.verify(token, jwtsec);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            quizProgress: user.quiz
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: 'Token not found' });
        const decoded = jwt.verify(token, jwtsec);
        const updates = req.body;
        const user = await User.findByIdAndUpdate(decoded.userId, updates, { new: true });
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateQuizProgress = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: 'Token not found' });
        const decoded = jwt.verify(token, jwtsec);
        const { total, correct } = req.body;
        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { quiz: [total, correct] },
            { new: true }
        );
        res.json({ message: 'Quiz progress updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
