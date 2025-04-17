import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch("/data/quiz.json") // Fetch from public/data/quiz.json
      .then((res) => res.json())
      .then((data) => setQuizzes(data.quizzes)) // Assuming "quizzes" is the main key in JSON
      .catch((error) => console.error("Error fetching quizzes:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 p-8 overflow-x-hidden">
      <h1 className="text-5xl mt-10">Choose Your Quiz</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {quizzes.length > 0 ? (
          quizzes.map((quiz, index) => (
            <div
              key={index}
              className="w-[30vw] h-[30vh] shadow-lg rounded-md p-5 bg-white flex flex-col justify-between border-l-4 border-sec"
            >
              <h2 className="text-3xl">{quiz.title}</h2>
              <p className="text-neutral-800">Questions: {quiz.questions}</p>
              <p className="text-neutral-800">Difficulty: {quiz.difficulty}</p>
              <div className="flex gap-4 mt-4">
                <Link
                  to={`${index}`}
                  className="px-6 py-3 bg-sec border-2 border-black hover:bg-opacity-80 duration-200"
                >
                  Start Quiz
                </Link>
                <button className="px-6 py-3 border-2 border-black  hover:bg-sec hover:text-white duration-200">
                  Attempt Later
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-xl">Loading quizzes...</p>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
