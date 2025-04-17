import React from "react";
import { useNavigate } from "react-router-dom";

const Learn = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const goToArticles = () => navigate("/articles");
  const goToVideos = () => navigate("/videos");
  const goToQuiz = () => navigate("/quiz");

  return (
    <div className="min-h-[88vh] w-full bg-gray-100 py-12 px-6">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Learn Sign Language</h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Choose your preferred learning method and start your journey towards mastering sign language today.
        </p>
      </div>

      {/* Learning Options Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Articles Card */}
          <div 
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:translate-y-1 cursor-pointer"
            onClick={goToArticles}
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3">Articles</h2>
              <p className="text-gray-600 mb-4">
                Read comprehensive guides and tutorials about sign language fundamentals, history, and techniques.
              </p>
              <div className="flex items-center text-black font-medium">
                <span>Browse Articles</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Videos Card */}
          <div 
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:translate-y-1 cursor-pointer"
            onClick={goToVideos}
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3">Videos</h2>
              <p className="text-gray-600 mb-4">
                Watch instructional videos demonstrating proper hand movements, expressions, and sign vocabulary.
              </p>
              <div className="flex items-center text-black font-medium">
                <span>Watch Videos</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Quiz Card */}
          <div 
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:translate-y-1 cursor-pointer"
            onClick={goToQuiz}
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6" />
              </svg>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3">Quiz</h2>
              <p className="text-gray-600 mb-4">
                Test your knowledge through interactive quizzes designed to reinforce your sign language skills.
              </p>
              <div className="flex items-center text-black font-medium">
                <span>Take Quiz</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Recommended Learning Path</h2>
        
        <div className="relative">
          {/* Path Line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-0.5 bg-gray-300 transform -translate-x-1/2"></div>
          
          {/* Path Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="md:flex md:justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg z-10">1</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-2">Begin with Basics</h3>
                <p className="text-gray-600">Start by reading our introductory articles and watching beginner videos.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="md:flex md:justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg z-10">2</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-2">Practice Daily</h3>
                <p className="text-gray-600">Watch practice videos and try to mimic the signs shown in tutorials.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="md:flex md:justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg z-10">3</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-2">Test Your Knowledge</h3>
                <p className="text-gray-600">Take quizzes regularly to reinforce learning and track your progress.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;