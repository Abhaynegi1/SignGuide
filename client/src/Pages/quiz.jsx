import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Check, Star, Trophy, ArrowRight } from "lucide-react";
import { UserContext } from "../Context/user";

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  // Add new state to track quiz scores for each level
  const [quizScores, setQuizScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch quiz data
    fetch("/data/quiz.json")
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data.quizzes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quizzes:", error);
        setIsLoading(false);
      });
    
    // Get completed levels from local storage
    const savedCompletedLevels = localStorage.getItem("completedLevels");
    if (savedCompletedLevels) {
      setCompletedLevels(JSON.parse(savedCompletedLevels));
    } else {
      // Initialize with empty array (only first level unlocked)
      localStorage.setItem("completedLevels", JSON.stringify([]));
    }

    // Get quiz scores from local storage
    const savedScores = localStorage.getItem("quizScores");
    if (savedScores) {
      setQuizScores(JSON.parse(savedScores));
    } else {
      localStorage.setItem("quizScores", JSON.stringify({}));
    }
  }, []);

  // Check if a level is unlocked (first level is always unlocked)
  const isLevelUnlocked = (index) => {
    if (index === 0) return true;
    return completedLevels.includes(index - 1);
  };

  // Check if a level is completed
  const isLevelCompleted = (index) => {
    return completedLevels.includes(index);
  };

  // Calculate quiz score percentage for stars display - FIXED
  const getStarCount = (index) => {
    // Check if we have a score for this specific level
    if (!quizScores || !quizScores[index]) return 0;
    
    // Use level-specific scores from our quizScores state
    const levelScore = quizScores[index];
    const percentage = (levelScore.correct / levelScore.total) * 100;
    
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    return 1;
  };

  // Handle clicking a level
  const handleLevelClick = (index) => {
    if (!isLevelUnlocked(index)) {
      // Show message for locked levels
      alert("Complete the previous level to unlock this one!");
      return;
    }
    
    // Navigate to the quiz page with correct path
    navigate(`/quiz/${index}`);
  };

  // Render stars based on performance
  const renderStars = (index) => {
    const starCount = getStarCount(index);
    return (
      <div className="absolute -top-8 flex">
        {[...Array(3)].map((_, i) => (
          <Star 
            key={i} 
            className={i < starCount ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
            size={24} 
          />
        ))}
      </div>
    );
  };

  // Get level node colors based on theme
  const getLevelNodeColors = (index, unlocked, completed) => {
    // Create colorful level themes (Duolingo style)
    const themes = [
      { from: "from-green-400", to: "to-green-600", border: "border-green-300" }, // Green
      { from: "from-purple-400", to: "to-purple-600", border: "border-purple-300" }, // Purple
      { from: "from-pink-400", to: "to-pink-600", border: "border-pink-300" }, // Pink
      { from: "from-orange-400", to: "to-orange-600", border: "border-orange-300" }, // Orange
      { from: "from-blue-400", to: "to-blue-600", border: "border-blue-300" }, // Blue
    ];
    
    if (!unlocked) {
      return "from-gray-300 to-gray-500 border-gray-200";
    }
    
    if (completed) {
      const theme = themes[index % themes.length];
      return `${theme.from} ${theme.to} ${theme.border}`;
    }
    
    // Active node (unlocked but not completed)
    return "from-indigo-400 to-indigo-600 border-indigo-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 flex flex-col items-center p-8 overflow-x-hidden">
      <div className="w-full max-w-4xl">
        
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Map container without background */}
            <div className="py-12 px-4 relative">
              {/* Map without the zigzag path */}
              <div className="relative">
                {/* Level markers with bigger nodes */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-24 relative z-10 pt-16 pb-32">
                  {quizzes.map((quiz, index) => {
                    const unlocked = isLevelUnlocked(index);
                    const completed = isLevelCompleted(index);
                    const isActive = unlocked && !completed;
                    const colorTheme = getLevelNodeColors(index, unlocked, completed);
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex flex-col items-center ${index % 2 === 0 ? 'mt-0' : 'mt-28'}`}
                      >
                        {/* Level node with bigger size */}
                        <div className="relative">
                          {/* Glow effect for active level */}
                          {isActive && (
                            <div className="absolute inset-0 bg-indigo-400 rounded-full opacity-30 animate-pulse transform scale-110 blur-md"></div>
                          )}
                          
                          <div 
                            onClick={() => handleLevelClick(index)}
                            className={`w-28 h-28 rounded-full flex items-center justify-center relative 
                              bg-gradient-to-br ${colorTheme} border-4
                              ${unlocked ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed'}
                              shadow-lg transition-all duration-300 transform hover:scale-105`}
                          >
                            {unlocked ? (
                              completed ? (
                                <Check className="text-white" size={40} />
                              ) : (
                                <div className="text-4xl font-bold text-white">{index + 1}</div>
                              )
                            ) : (
                              <Lock className="text-white" size={32} />
                            )}
                            
                            {/* Stars for completed levels */}
                            {completed && renderStars(index)}
                            
                            {/* Special marker for final level */}
                            {index === quizzes.length - 1 && (
                              <div className="absolute -top-8 -right-4">
                                <Trophy className="text-yellow-400 fill-yellow-400" size={36} />
                              </div>
                            )}
                            
                            {/* Arrow pointing to next level */}
                            {completed && index < quizzes.length - 1 && !isLevelCompleted(index + 1) && (
                              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                                <ArrowRight className="text-blue-500" size={28} />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Level title with better styling */}
                        <div className="mt-4 text-center">
                          <h3 className={`font-bold text-lg ${unlocked ? 'text-blue-800' : 'text-gray-500'}`}>
                            {quiz.title}
                          </h3>
                          <p className={`text-sm ${unlocked ? 'text-blue-600' : 'text-gray-400'}`}>
                            {quiz.difficulty}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Progress info */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-blue-800">Your Journey Progress</h3>
                  <span className="font-bold text-lg text-blue-700">
                    {Math.round((completedLevels.length / quizzes.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                    style={{ width: `${(completedLevels.length / quizzes.length) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-gray-600 text-sm">
                  {completedLevels.length === 0 
                    ? "Start your journey by completing the first level!" 
                    : completedLevels.length === quizzes.length 
                      ? "Congratulations! You've completed all levels!" 
                      : `You've completed ${completedLevels.length} out of ${quizzes.length} levels.`
                  }
                </div>
              </div>
              
              {/* Legend box */}
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                <div className="flex items-center px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-4 border-indigo-300 mr-2 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <span className="font-medium">Available</span>
                </div>
                <div className="flex items-center px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-4 border-green-300 mr-2 flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex items-center px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-200 mr-2 flex items-center justify-center">
                    <Lock className="text-white" size={16} />
                  </div>
                  <span className="font-medium">Locked</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;