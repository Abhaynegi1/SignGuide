const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },  // For Google authentication
    profilePicture: { type: String },  // For user profile picture
    quiz: { type: Array, default: [0, 0] }  // [total, correct]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)