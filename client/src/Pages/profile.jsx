import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Navigate, Link } from "react-router-dom"; // Import Link
import { UserContext } from "../Context/user";

const Profile = () => {
  const { setUser, user } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Quiz-related calculations
  let aquiz = user?.quiz?.[0] || 0;
  const tquiz = 200;
  let quizl = (300 / 200) * aquiz;
  let quizacc = aquiz === 0 ? 0 : Math.floor((user.quiz?.[1] / aquiz) * 100);

  // Log user data when component mounts to help debug
  useEffect(() => {
    if (user) {
      console.log("User data:", user);
      console.log("Profile picture URL:", user.profilePicture);
    }
  }, [user]);

  const logout = async (e) => {
    e.preventDefault();
    try {
      await axios.get("/logout");
      setUser(null);
      setRedirect(true);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  // Default fallback image
  const fallbackImage =
    "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1742569891~exp=1742573491~hmac=2d32e685aa41f94a30ce0fb185a166be825e572d809fc82dce7e6626de4a0e88&w=740";

  // User profile photo with error handling
  const profilePhoto =
    !imageError && user?.profilePicture ? user.profilePicture : fallbackImage;

  return (
    <div className="min-h-[88vh] w-full bg-gray-100 py-8 px-6">
      {/* Hero Section with Profile Info */}
      <div className="max-w-6xl mx-auto mb-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center gap-8">
          {/* Profile Photo with Ring Effect */}
          <div className="relative">
            <div className="h-40 w-40 md:h-48 md:w-48 rounded-full border-4 border-gray-300 p-1 overflow-hidden">
              <img
                src={profilePhoto}
                alt="Profile"
                className="h-full w-full object-cover rounded-full"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.log("Image failed to load:", profilePhoto);
                  setImageError(true);
                }}
              />
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold capitalize mb-2">
              {user?.username}
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              What a great day to learn sign language!
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button
                className="px-6 py-2 border-2 border-black rounded-md transition-all hover:bg-red-500 hover:text-white hover:border-red-500"
                onClick={logout}
              >
                Logout
              </button>
              <Link to="/EditProfile">
                <button className="px-6 py-2 bg-sec border-2 border-black rounded-md transition-all hover:bg-black hover:text-white">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Your Learning Progress</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:translate-y-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Quiz Progress</h3>
              <div className="text-lg font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {quizacc}%
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Attempted</span>
                <span className="font-medium">
                  {aquiz}/{tquiz}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-3 bg-green-700 rounded-full transition-all duration-1000"
                  style={{ width: `${(aquiz / tquiz) * 100}%` }}
                ></div>
              </div>
            </div>

            <button className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              View Quiz History
            </button>
          </div>

          {/* Videos Card */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:translate-y-1">
            <h3 className="text-2xl font-semibold mb-4">Learning Videos</h3>
            <p className="text-gray-600 mb-6">
              Continue your learning journey with our educational video content and interactive tutorials.
            </p>

            {/* Recent Videos Preview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 rounded-lg p-4 aspect-video flex items-center justify-center">
                <span className="text-gray-500">Basic Signs</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 aspect-video flex items-center justify-center">
                <span className="text-gray-500">Advanced Practice</span>
              </div>
            </div>

            <Link to="/videos">
                <button className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Browse All Videos
                </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="max-w-6xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span>Take Quiz</span>
          </button>

          <button className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span>Practice</span>
          </button>

          <button className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span>Leaderboard</span>
          </button>

          <button className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.822 3.278-.036.108.496-.07 1.002-.48 1.314-.41.312-.94.448-1.464.381-.787-.098-1.467-.62-1.75-1.322-.34-.67-.624-1.424-.996-2.1-.035-.063-.086-.107-.133-.168-.246-.424-.732-.465-1.026-.083a.845.845 0 00-.083 1.03c.604 1.028 1.214 2.048 1.896 3.026l-.036.045c.147.217.314.421.479.625.418-.777.876-1.578 1.367-2.348z"
                />
              </svg>
            </div>
            <span>About</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
