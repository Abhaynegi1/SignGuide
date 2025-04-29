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
        const currentArticle = data.articles.find((a) => a.id === articleId);
        setArticle(currentArticle);
        setAllArticles(data.articles);
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
    
    const articleSequence = ["basics", "conversation", "advanced"];
    const currentIndex = articleSequence.indexOf(article.id);
    
    if (currentIndex < articleSequence.length - 1) {
      const nextArticleId = articleSequence[currentIndex + 1];
      return allArticles.find(a => a.id === nextArticleId);
    }
    
    return null;
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
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="text-gray-500 mb-6">{article.readTime}</div>
        
        <div className="prose max-w-none">
          {article.content.map((item, index) => {
            if (item.type === "text") {
              return <p key={index} className="mb-4">{item.value}</p>;
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
              <h3 className="text-lg font-semibold mb-2">Next article unlocked!</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-800 font-medium">{nextArticle.title}</p>
                  <p className="text-sm text-gray-600">{nextArticle.readTime}</p>
                </div>
                <Link
                  to={`/articles/${nextArticle.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Read Next
                </Link>
              </div>
            </div>
          ) : (
            !hasReachedEnd && (
              <div className="text-center text-gray-500 italic">
                Continue reading to unlock the next article
              </div>
            )
          )}
          
          {hasReachedEnd && !nextArticle && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">You've completed all the articles!</p>
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
              const isUnlocked = readArticles.includes(relatedArticle.id) || 
                                 (relatedArticle.id === "basics") ||
                                 (readArticles.includes("basics") && relatedArticle.id === "conversation") ||
                                 (readArticles.includes("conversation") && relatedArticle.id === "advanced");
              
              return (
                <div 
                  key={relatedArticle.id} 
                  className={`border rounded-lg overflow-hidden flex ${!isUnlocked ? "opacity-70" : ""}`}
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
                  </div>
                  
                  <div className="w-2/3 p-3">
                    <h3 className="font-medium mb-1">{relatedArticle.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{relatedArticle.readTime}</p>
                    
                    {isUnlocked ? (
                      <Link
                        to={`/articles/${relatedArticle.id}`}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-block"
                      >
                        Read Article
                      </Link>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Complete previous article to unlock
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