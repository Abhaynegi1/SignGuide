import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [watchedArticles, setWatchedArticles] = useState(() => {
    const saved = localStorage.getItem("readArticles");
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/data/articles.json")
      .then((res) => res.json())
      .then((data) => {
        // Sort articles by numeric ID to ensure correct order
        const sortedArticles = data.articles.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setArticles(sortedArticles);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setIsLoading(false);
      });
  }, []);

  const isArticleUnlocked = (articleId) => {
    const currentArticleNumber = parseInt(articleId);
    
    // First article (ID: 1) is always unlocked
    if (currentArticleNumber === 1) return true;
    
    // Check if the previous article has been completed
    const previousArticleId = (currentArticleNumber - 1).toString();
    return watchedArticles.includes(previousArticleId);
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading articles...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Articles :</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const isUnlocked = isArticleUnlocked(article.id);
          const isWatched = watchedArticles.includes(article.id);
          
          return (
            <div 
              key={article.id} 
              className={`border rounded-lg overflow-hidden shadow-md transition-all ${
                !isUnlocked ? "opacity-70" : ""
              } ${isWatched ? "ring-2 ring-green-500" : ""}`}
            >
              <div className="relative h-60">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2-2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                
                {isWatched && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                
                <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                  {article.readTime}
                </span>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Article {article.id}
                  </span>
                  {isWatched && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-gray-600 mb-4 text-sm">{article.summary}</p>
                
                {isUnlocked ? (
                  <Link
                    to={`/articles/${article.id}`}
                    className="block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Read Article
                  </Link>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2 px-4 bg-gray-100 rounded">
                    Complete article {parseInt(article.id) - 1} to unlock
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticlesList;