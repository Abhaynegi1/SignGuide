const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./Models/user')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken")
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const session = require('express-session')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const dotenv = require("dotenv")

dotenv.config();

mongoose.connect(process.env.MONGO_URI)

const jwtsec = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
async function(req, accessToken, refreshToken, profile, done) {
    try {
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8)
            const hashedPassword = await bcrypt.hash(randomPassword, 10)

            const email = profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : `${profile.id}@google.com`

            user = await User.create({
                googleId: profile.id,
                username: profile.displayName || `user_${profile.id.substring(0, 8)}`,
                email: email,
                profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
                password: hashedPassword,
                quiz: [0, 0]
            })
        }

        return done(null, user)
    } catch (error) {
        console.error("Google strategy error:", error)
        return done(error, null)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

// CORS configuration
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173' , "https://signguide.onrender.com"]
}))

app.use(express.json())
app.use(cookieParser())

app.use(session({
    secret: jwtsec,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}))

app.use(passport.initialize())
app.use(passport.session())


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username, profilePicture: req.user.profilePicture },
            jwtsec,
            { expiresIn: '1h' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })

        res.redirect('http://localhost:5173/profile')
    }
)

app.post('/register', (req, res) => {
    const { username, password, email } = req.body
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await User.create({
                username,
                password: hash,
                email
            })
            res.status(201).json(user)
        })
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({ username })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign(
                { id: user._id, username: user.username, profilePicture: user.profilePicture },
                jwtsec,
                { expiresIn: '1h' }
            )

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            })

            return res.status(200).json({ message: 'Login successful', user })
        } else {
            return res.status(401).json({ message: 'Incorrect password' })
        }
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ message: 'Server error' })
    }
})

app.get('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0
    })
    res.status(200).json({ message: 'Logged out successfully' })
})

app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies
        if (!token) return res.status(401).json({ message: 'Token not found' })

        jwt.verify(token, jwtsec, async (err, decodedToken) => {
            if (err) return res.status(403).json({ message: 'Invalid token' })

            const userData = await User.findById(decodedToken.id)
            if (!userData) return res.status(404).json({ message: 'User not found' })

            
            if (userData.profilePicture && !userData.profilePicture.startsWith('http')) {
                // Make sure we're returning a full URL for local images
                userData._doc.profilePicture = `http://localhost:3000${userData.profilePicture}`;
            }

            res.status(200).json(userData)
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

// Add profile update route
app.put('/api/user/profile', upload.single('profileImage'), async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
        
        jwt.verify(token, jwtsec, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ error: "Unauthorized: Invalid token" });
            }
            
            const { username } = req.body;
            
            // Check if username already exists (but not for the current user)
            const existingUser = await User.findOne({ 
                username: username, 
                _id: { $ne: decodedToken.id } 
            });
            
            if (existingUser) {
                return res.status(400).json({ error: "Username already exists" });
            }
            
            // Find the user to update
            const user = await User.findById(decodedToken.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            
            // Update username
            user.username = username;
            
            // Update profile picture if a new one was uploaded
            if (req.file) {
                const profilePicturePath = `/uploads/${req.file.filename}`;
                user.profilePicture = profilePicturePath;
            }
            
            // Save the updated user
            await user.save();
            
            // Create a new token with updated info
            const updatedToken = jwt.sign(
                { id: user._id, username: user.username, profilePicture: user.profilePicture },
                jwtsec,
                { expiresIn: '1h' }
            );
            
            // Set the new token in the cookie
            res.cookie('token', updatedToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            
            // Return the updated user data with formatted profile picture URL
            const userData = {
                _id: user._id,
                username: user.username,
                email: user.email,
                quiz: user.quiz
            };
            
            // Make sure the profile picture URL is properly formatted
            if (user.profilePicture) {
                if (user.profilePicture.startsWith('http')) {
                    // If it's already a full URL, use it as is
                    userData.profilePicture = user.profilePicture;
                } else {
                    // If it's a local path, prepend the server URL
                    userData.profilePicture = `http://localhost:3000${user.profilePicture}`;
                }
            }
            
            return res.status(200).json(userData);
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

app.post("/quizsubmit", async (req, res) => {
    try {
        const { token } = req.cookies
        const { total, correct } = req.body

        if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" })

        jwt.verify(token, jwtsec, async (err, decodedToken) => {
            if (err) return res.status(401).json({ message: "Unauthorized: Invalid token" })

            const user = await User.findById(decodedToken.id)
            if (!user) return res.status(404).json({ message: "User not found" })

            let [currt, currcor] = user.quiz
            currt = total + currt
            currcor = correct + currcor
            user.quiz = [currt, currcor]
            await user.save()

            res.status(200).json({ message: "Quiz submitted successfully!", quiz: user.quiz })
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
})

app.get('/', (req, res) => {
    res.send('the server is running')
})

app.listen(PORT, () => {
    console.log('Server running on port 3000')
})