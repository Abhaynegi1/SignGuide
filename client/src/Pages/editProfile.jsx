import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../Context/user";

const EditProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Default fallback image
  const fallbackImage = "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1742569891~exp=1742573491~hmac=2d32e685aa41f94a30ce0fb185a166be825e572d809fc82dce7e6626de4a0e88&w=740";

  // Initialize form data with current user info
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
      });
      setPreviewImage(user.profilePicture || fallbackImage);
    }
  }, [user]);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Handle form input changes for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle file input change for profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        profileImage: "Please select a valid image file (JPEG, PNG, GIF, WEBP)"
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        profileImage: "Image size must be less than 5MB"
      }));
      return;
    }

    // Store the file and create a preview URL
    setProfileImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // Clear any previous error
    if (errors.profileImage) {
      setErrors(prev => ({
        ...prev,
        profileImage: ""
      }));
    }
  };

  // Handle image preview error
  const handleImageError = () => {
    setPreviewImage(fallbackImage);
  };

  // Trigger file browser when clicking on the image or button
  const triggerFileBrowser = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      // Validate form
      let formErrors = {};
      
      if (!formData.username.trim()) {
        formErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        formErrors.username = "Username must be at least 3 characters";
      }
      
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setIsLoading(false);
        return;
      }
      
      // Create FormData for multipart/form-data upload
      const submitFormData = new FormData();
      submitFormData.append('username', formData.username);
      
      // Only append file if a new one was selected
      if (profileImage) {
        submitFormData.append('profileImage', profileImage);
      }
      
      // Submit updated profile to server
      const response = await axios.put("/api/user/profile", submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update user context with new info
      setUser(response.data);
      setIsSuccess(true);
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        setRedirect(true);
      }, 2000);
      
    } catch (error) {
      console.error("Update failed:", error);
      
      // Handle specific errors
      if (error.response && error.response.data) {
        if (error.response.data.error === "Username already exists") {
          setErrors({ username: "This username is already taken" });
        } else {
          setErrors({ general: error.response.data.error || "Update failed. Please try again." });
        }
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to profile page after successful update
  if (redirect) {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="min-h-[88vh] w-full bg-gray-100 py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <Link 
            to="/profile" 
            className="px-4 py-2 border-2 border-black rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
        </div>
        
        {/* Success Message */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            Profile updated successfully! Redirecting...
          </div>
        )}
        
        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {errors.general}
          </div>
        )}
        
        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-8">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {/* Profile picture preview */}
              <div 
                className="h-32 w-32 rounded-full border-4 border-gray-300 p-1 overflow-hidden mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={triggerFileBrowser}
              >
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="h-full w-full object-cover rounded-full"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />
              </div>
              
              {/* Upload button */}
              <button
                type="button"
                onClick={triggerFileBrowser}
                className="mb-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Browse for Photo
              </button>
              
              <p className="text-sm text-gray-500">
                Click the image or button to upload a profile picture
              </p>
              
              {errors.profileImage && (
                <p className="mt-2 text-red-500 text-sm">{errors.profileImage}</p>
              )}
            </div>
            
            {/* Username Field */}
            <div className="mb-8">
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:border-sec`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1 text-red-500 text-sm">{errors.username}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 bg-sec border-2 border-black rounded-md transition-all ${
                  isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-black hover:text-white"
                }`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;