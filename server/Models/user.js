const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },  // For Google authentication
    profilePicture: { type: String },  // For user profile picture
    progress: {
        video: { type: Number, default: 0 },  // Number of videos completed
        article: { type: Number, default: 0 },  // Number of articles read
        quiz: { type: Number, default: 0 },  // Number of quizzes completed
        lastCompleted: { type: Date, default: Date.now }  // Timestamp of last completion
    },
    quizStats: { type: Array, default: [0, 0] },  // [total attempts, correct answers]
    completedContent: [{
        type: String,  // Type of content (video/article/quiz)
        id: String,    // ID of the specific content
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)