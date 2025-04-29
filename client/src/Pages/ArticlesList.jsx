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
        setArticles(data.articles);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setIsLoading(false);
      });
  }, []);

  const isArticleUnlocked = (articleId) => {
    if (articleId === "basics") return true;
    
    const articleSequence = ["basics", "conversation", "advanced"];
    const articleIndex = articleSequence.indexOf(articleId);
    const previousArticle = articleSequence[articleIndex - 1];
    
    return watchedArticles.includes(previousArticle);
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
          
          return (
            <div 
              key={article.id} 
              className={`border rounded-lg overflow-hidden shadow-md ${!isUnlocked ? "opacity-70" : ""}`}
            >
              <div className="relative h-48">
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
                
                <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                  {article.readTime}
                </span>
              </div>
              
              <div className="p-4">
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
                    Complete previous article to unlock
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