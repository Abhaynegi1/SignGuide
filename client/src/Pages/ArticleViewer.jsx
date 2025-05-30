import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const ArticleViewer = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [readArticles, setReadArticles] = useState(() => {
    const saved = localStorage.getItem("readArticles");
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const articleEndRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    fetch("/data/articles.json")
      .then((res) => res.json())
      .then((data) => {
        // Sort articles by numeric ID
        const sortedArticles = data.articles.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        const currentArticle = sortedArticles.find((a) => a.id === articleId);
        setArticle(currentArticle);
        setAllArticles(sortedArticles);
        setIsLoading(false);
        setHasReachedEnd(false);
      })
      .catch((error) => {
        console.error("Error fetching article:", error);
        setIsLoading(false);
      });
  }, [articleId]);

  useEffect(() => {
    localStorage.setItem("readArticles", JSON.stringify(readArticles));
  }, [readArticles]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markArticleAsRead();
        }
      },
      { threshold: 0.9 }
    );

    if (articleEndRef.current) {
      observer.observe(articleEndRef.current);
    }

    return () => {
      if (articleEndRef.current) {
        observer.unobserve(articleEndRef.current);
      }
    };
  }, [article]);

  const markArticleAsRead = () => {
    if (!hasReachedEnd && article) {
      setHasReachedEnd(true);
      if (!readArticles.includes(article.id)) {
        setReadArticles([...readArticles, article.id]);
      }
    }
  };

  const getNextArticle = () => {
    if (!article) return null;
    
    const currentArticleNumber = parseInt(article.id);
    const nextArticleId = (currentArticleNumber + 1).toString();
    
    return allArticles.find(a => a.id === nextArticleId);
  };

  const isArticleUnlocked = (targetArticleId) => {
    const targetArticleNumber = parseInt(targetArticleId);
    
    // First article (ID: 1) is always unlocked
    if (targetArticleNumber === 1) return true;
    
    // Check if the previous article has been completed
    const previousArticleId = (targetArticleNumber - 1).toString();
    return readArticles.includes(previousArticleId);
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading article...</div>;
  }

  if (!article) {
    return <div className="text-center p-10">Article not found</div>;
  }

  const nextArticle = getNextArticle();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link to="/articles" className="inline-block mb-6 text-blue-500 hover:underline">
        ← Back to Articles
      </Link>
      
      <article className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
            Article {article.id}
          </span>
          {readArticles.includes(article.id) && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded">
              Completed
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="text-gray-500 mb-6">{article.readTime}</div>
        
        <div className="prose max-w-none">
          {article.content.map((item, index) => {
            if (item.type === "text") {
              return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{item.value}</p>;
            } else if (item.type === "image") {
              return (
                <div key={index} className="my-6">
                  <img 
                    src={item.src} 
                    alt={item.alt} 
                    className="w-full rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">{item.alt}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
        
        <div ref={articleEndRef} className="h-4"></div>
        
        <div className="mt-10 pt-6 border-t border-gray-200">
          {hasReachedEnd && nextArticle ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">🎉 Next article unlocked!</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-800 font-medium">{nextArticle.title}</p>
                  <p className="text-sm text-gray-600">{nextArticle.readTime}</p>
                </div>
                <Link
                  to={`/articles/${nextArticle.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Read Next →
                </Link>
              </div>
            </div>
          ) : (
            !hasReachedEnd && (
              <div className="text-center text-gray-500 italic">
                📖 Continue reading to unlock the next article
              </div>
            )
          )}
          
          {hasReachedEnd && !nextArticle && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">🏆 Congratulations! You've completed all available articles!</p>
            </div>
          )}
        </div>
      </article>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">More Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allArticles
            .filter((a) => a.id !== articleId)
            .map((relatedArticle) => {
              const isUnlocked = isArticleUnlocked(relatedArticle.id);
              const isCompleted = readArticles.includes(relatedArticle.id);
              
              return (
                <div 
                  key={relatedArticle.id} 
                  className={`border rounded-lg overflow-hidden flex transition-all ${
                    !isUnlocked ? "opacity-70" : ""
                  } ${isCompleted ? "ring-2 ring-green-500" : ""}`}
                >
                  <div className="w-1/3 relative">
                    <img
                      src={relatedArticle.thumbnail}
                      alt={relatedArticle.title}
                      className="h-full w-full object-cover"
                    />
                    
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2-2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-2/3 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Article {relatedArticle.id}
                      </span>
                      {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-medium mb-1">{relatedArticle.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{relatedArticle.readTime}</p>
                    
                    {isUnlocked ? (
                      <Link
                        to={`/articles/${relatedArticle.id}`}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-block transition"
                      >
                        {isCompleted ? "Read Again" : "Read Article"}
                      </Link>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Complete article {parseInt(relatedArticle.id) - 1} to unlock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default ArticleViewer;