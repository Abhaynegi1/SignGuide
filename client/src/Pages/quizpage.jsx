import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Context/user";

const SubmitQuizPage = () => {
  const { param } = useParams(); // Get quiz index from URL
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/quiz.json") // Fetch the quiz data from public folder
      .then((res) => res.json())
      .then((data) => {
        const quizIndex = parseInt(param, 10); // Convert param to number
        if (!isNaN(quizIndex) && data.quizzes[quizIndex]) {
          setQuizData(data.quizzes[quizIndex]); // Set the specific quiz
        } else {
          console.error("Invalid quiz index");
          navigate("/quiz"); // Redirect to quiz selection page if invalid
        }
      })
      .catch((error) => console.error("Error fetching quiz data:", error));
  }, [param, navigate]);

  // Handle selecting an answer based on question type
  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  // Check if answer is correct based on question type
  const isAnswerCorrect = (question, userAnswer) => {
    if (!userAnswer) return false;
    
    switch (question.type) {
      case "multiple_choice":
      case "select_image":
      case "fill_sequence":
        return userAnswer === question.ans;
      
      case "match":
      case "match_pairs":
        // For match type questions, need to check if arrays are equal
        return JSON.stringify(userAnswer) === JSON.stringify(question.ans);
      
      case "spell_word":
      case "arrange":
        // For arrange/spell questions, check if arrays are equal
        return JSON.stringify(userAnswer) === JSON.stringify(question.ans);
      
      default:
        return false;
    }
  };

  // Submit the quiz
  const handleSubmit = async () => {
    if (!quizData) return;
  
    let correct = 0;
    let attempted = 0;
  
    quizData.quiz.forEach((question, index) => {
      if (answers[index] !== undefined) {  // Count only attempted questions
        attempted++;
        if (isAnswerCorrect(question, answers[index])) {
          correct++;
        }
      }
    });
  
    setCorrectCount(correct);
    setSubmitted(true);
  
    // Update user context
    setUser(prevUser => {
      return { ...prevUser, quiz: [attempted, correct] };
    });
    
    // Store quiz score for this specific level
    const quizIndex = parseInt(param, 10);
    const quizScores = JSON.parse(localStorage.getItem("quizScores") || "{}");
    quizScores[quizIndex] = { total: attempted, correct: correct };
    localStorage.setItem("quizScores", JSON.stringify(quizScores));
    
    // Send the result to the backend
    try {
      await axios.post("/quizsubmit", {
        quizIndex: quizIndex,
        total: attempted,
        correct
      });
  
      console.log("Quiz result submitted successfully!");
      
      // Mark level as completed in localStorage if performance is good enough
      if (correct >= Math.floor(quizData.quiz.length / 2)) {
        const completedLevels = JSON.parse(localStorage.getItem("completedLevels") || "[]");
        
        if (!completedLevels.includes(quizIndex)) {
          completedLevels.push(quizIndex);
          localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
        }
      }
      
    } catch (error) {
      console.error("Error submitting quiz result:", error);
    }
  };

  // Continue to next level
  const handleContinue = () => {
    const currentIndex = parseInt(param, 10);
    const nextIndex = currentIndex + 1;
    
    // Reset the component state before navigating
    setSubmitted(false);
    setAnswers({});
    
    // Navigate to the next quiz level
    navigate(`/quiz/${nextIndex}`);
  };
  
  // Return to level map
  const handleReturnToMap = () => {
    navigate("/quiz");
  };

  // Handle selection in arrange/spell type questions
  const handleArrangeSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => {
      const currentSelection = prev[questionIndex] || [];
      
      // Toggle selection - if already selected, remove it
      if (currentSelection.includes(optionIndex)) {
        return {
          ...prev,
          [questionIndex]: currentSelection.filter(idx => idx !== optionIndex)
        };
      } else {
        return {
          ...prev,
          [questionIndex]: [...currentSelection, optionIndex]
        };
      }
    });
  };
  
  // Render question based on type
  const renderQuestion = (question, qIndex) => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="mt-2 flex flex-wrap justify-center items-center gap-4">
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="w-[40%] bg-gray-200 px-3 py-4 rounded-lg cursor-pointer hover:bg-gray-300">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={optIndex}
                  checked={answers[qIndex] === optIndex}
                  onChange={() => handleAnswerSelect(qIndex, optIndex)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case "select_image":
        return (
          <div className="mt-2 grid grid-cols-2 gap-4">
            {question.options.map((imgUrl, optIndex) => (
              <div 
                key={optIndex}
                className={`border-2 p-2 rounded-lg cursor-pointer ${answers[qIndex] === optIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => handleAnswerSelect(qIndex, optIndex)}
              >
                <img src={imgUrl} alt={`Option ${optIndex + 1}`} className="w-full h-32 object-contain" />
              </div>
            ))}
          </div>
        );
        
      case "match":
        return (
          <div className="mt-2 flex flex-col gap-2">
            <div className="text-lg font-medium">Select the correct letter for this sign:</div>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="w-[20%] bg-gray-200 px-3 py-4 rounded-lg cursor-pointer hover:bg-gray-300">
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={optIndex}
                    checked={answers[qIndex] === optIndex}
                    onChange={() => handleAnswerSelect(qIndex, optIndex)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );
        
      case "match_pairs":
        return (
          <div className="mt-2 flex flex-col gap-4">
            {question.pairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex items-center gap-4">
                <div className="w-24 text-center text-lg font-medium">{pair.text}</div>
                <img src={pair.img} alt={`Sign for ${pair.text}`} className="w-32 h-32 object-contain" />
              </div>
            ))}
            <div className="text-lg font-medium mt-2">Select the correct order:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {question.pairs.map((_, pairIndex) => (
                <input
                  key={pairIndex}
                  type="number"
                  min="0"
                  max={question.pairs.length - 1}
                  className="w-16 p-2 border border-gray-300 rounded"
                  value={(answers[qIndex] || [])[pairIndex] || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 0 && value < question.pairs.length) {
                      const newOrder = [...(answers[qIndex] || Array(question.pairs.length).fill(null))];
                      newOrder[pairIndex] = value;
                      handleAnswerSelect(qIndex, newOrder);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        );
        
      case "arrange":
        return (
          <div className="mt-2 flex flex-col gap-4">
            <div className="flex flex-wrap justify-center gap-4">
              {question.options.map((option, optIndex) => (
                <div 
                  key={optIndex} 
                  className="flex flex-col items-center gap-2"
                >
                  <img 
                    src={option.img} 
                    alt={`Sign for ${option.letter}`} 
                    className="w-24 h-24 object-contain"
                  />
                  <div className="text-lg font-medium">{option.letter}</div>
                </div>
              ))}
            </div>
            
            <div className="text-lg font-medium mt-2">Arrange in the correct order:</div>
            <div className="flex justify-center gap-2">
              {(answers[qIndex] || []).map((selectedOption, index) => (
                <div 
                  key={index} 
                  className="w-16 h-16 flex items-center justify-center bg-blue-100 border border-blue-500 rounded-lg text-lg font-medium"
                >
                  {question.options[selectedOption]?.letter || '?'}
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {question.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  className={`px-4 py-2 rounded-lg ${
                    (answers[qIndex] || []).includes(optIndex) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => handleArrangeSelect(qIndex, optIndex)}
                >
                  {option.letter}
                </button>
              ))}
            </div>
          </div>
        );
        
      case "spell_word":
        return (
          <div className="mt-2 flex flex-col gap-4">
            <div className="text-xl font-medium">Spell: {question.targetWord}</div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {question.options.map((option, optIndex) => (
                <div 
                  key={optIndex} 
                  className="flex flex-col items-center gap-2"
                >
                  <img 
                    src={option.img} 
                    alt={`Sign for ${option.letter}`} 
                    className="w-24 h-24 object-contain"
                  />
                  <div className="text-lg font-medium">{option.letter}</div>
                </div>
              ))}
            </div>
            
            <div className="text-lg font-medium mt-2">Your answer:</div>
            <div className="flex justify-center gap-2">
              {(answers[qIndex] || []).map((selectedOption, index) => (
                <div 
                  key={index} 
                  className="w-16 h-16 flex items-center justify-center bg-blue-100 border border-blue-500 rounded-lg text-lg font-medium"
                >
                  {question.options[selectedOption]?.letter || '?'}
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {question.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  className={`px-4 py-2 rounded-lg ${
                    (answers[qIndex] || []).includes(optIndex) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => handleArrangeSelect(qIndex, optIndex)}
                >
                  {option.letter}
                </button>
              ))}
            </div>
          </div>
        );
        
      case "fill_sequence":
        return (
          <div className="mt-2 flex flex-wrap justify-center items-center gap-4">
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="w-[40%] bg-gray-200 px-3 py-4 rounded-lg cursor-pointer hover:bg-gray-300">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={optIndex}
                  checked={answers[qIndex] === optIndex}
                  onChange={() => handleAnswerSelect(qIndex, optIndex)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      default:
        return (
          <div className="text-red-500">
            Unknown question type: {question.type}
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center gap-8 p-10 bg-gray-100">
      <h1 className="text-5xl">Take Your Quiz</h1>

      {quizData ? (
        <div className="w-[60vw] p-5 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl ">{quizData.title}</h2>
          <p className="text-xl text-neutral-800">Difficulty: {quizData.difficulty}</p>
          <p className="text-xl text-neutral-800">Total Questions: {quizData.questions}</p>

          {!submitted ? (
            <div className="mt-5 flex flex-col gap-32">
              {quizData.quiz.map((question, qIndex) => (
                <div key={qIndex} className="mb-6">
                  {question.img && (
                    <div className="img w-full h-[30vh]">
                      <img src={question.img} alt="Question" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <p className="text-2xl font-medium my-4">{qIndex + 1}. {question.question}</p>
                  
                  {renderQuestion(question, qIndex)}
                </div>
              ))}

              <button
                onClick={handleSubmit}
                className="mt-5 px-6 py-3 border-2 w-[20%] border-black bg-sec hover:bg-opacity-80"
              >
                Submit Quiz
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <h3 className="text-5xl text-green-600">Quiz Submitted!</h3>
              <p className="text-2xl mt-2">Total Attempted: {Object.keys(answers).length}</p>
              <p className="text-2xl">Correct Answers: {correctCount} / {quizData.quiz.length}</p>
              
              {correctCount >= Math.floor(quizData.quiz.length / 2) ? (
                <div>
                  <p className="text-2xl font-semibold text-blue-600 mt-3">
                    🎉 Well Done! Next level unlocked!
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <button 
                      onClick={handleContinue}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      Continue to Next Level
                    </button>
                    <button
                      onClick={handleReturnToMap}
                      className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50"
                    >
                      Return to Map
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-semibold text-orange-600 mt-3">
                    😕 Try Again! You need to score at least 50% to unlock the next level.
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <button 
                      onClick={() => {
                        setSubmitted(false);
                        setAnswers({});
                      }}
                      className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleReturnToMap}
                      className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50"
                    >
                      Return to Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-2xl text-gray-600">Loading quiz...</p>
      )}
    </div>
  );
};

export default SubmitQuizPage;