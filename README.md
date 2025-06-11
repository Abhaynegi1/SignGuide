# SignGuide 🤟

**Bridging the Communication Gap Between Sign Language Users and Non-Signers**

SignGuide is a full-stack web application designed to make sign language learning accessible and interactive. Through gamified quizzes, comprehensive lectures, and educational articles, SignGuide offers a Duolingo-like experience for mastering sign language. The platform also features real-time sign language detection capabilities, allowing users to learn through webcam interaction, image uploads, and text-to-sign animation conversion.

## ✨ Features

- **Interactive Learning Platform**: Gamified quizzes and educational content similar to Duolingo
- **Real-time Detection**: Live sign language detection via webcam
- **Image Processing**: Upload images for sign language recognition
- **Text to Sign Animation**: Convert text into sign language animations
- **Comprehensive Resources**: Access to lectures and articles
- **User Authentication**: Secure OAuth integration
- **Responsive Design**: Optimized for all devices

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: OAuth (Google)
- **Machine Learning**: TensorFlow.js, Handpose
- **Animation**: Framer Motion
- **Styling**: CSS/Styled Components

## 📸 Screenshots

### Landing Page
![Landing Page](SignGuide/client/public/ScreenShots/Landing Page.png)

### Live Detection
![Live Detection](SignGuide/client/public/ScreenShots/LiveDetect.png)

### Quiz Interface
![Quiz](SignGuide/client/public/ScreenShots/quiz.png)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhaynegi1/SignGuide.git
   cd SignGuide
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the server directory with the following variables:
   ```env
   BACKEND_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret_key
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

4. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

5. **Start the development servers**
   
   Open two terminal windows:
   
   **Terminal 1 (Server):**
   ```bash
   cd server
   npm start
   ```
   
   **Terminal 2 (Client):**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

