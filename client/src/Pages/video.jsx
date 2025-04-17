import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const VideoPlayer = () => {
  const { param } = useParams();
  const [watchLater, setWatchLater] = useState([]);
  const [mainVideo, setMainVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState(() => {
    const saved = localStorage.getItem("watchedVideos");
    return saved ? JSON.parse(saved) : [];
  });
  const [videoEnded, setVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/data/videos.json")
      .then((res) => res.json())
      .then((data) => {
        const currentVideo = data.video.find((video) => video.videoLink === param);
        setMainVideo(currentVideo);

        const allVideos = data.video;
        const currentIndex = allVideos.findIndex((video) => video.videoLink === param);
        const remainingVideos = [...allVideos];
        if (currentIndex !== -1) {
          remainingVideos.splice(currentIndex, 1);
        }

        setSuggestedVideos(remainingVideos);
        setVideoEnded(false);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        setIsLoading(false);
      });
  }, [param]);

  useEffect(() => {
    localStorage.setItem("watchedVideos", JSON.stringify(watchedVideos));
  }, [watchedVideos]);

  const addToWatchLater = (video) => {
    if (!watchLater.find((v) => v.videoLink === video.videoLink)) {
      setWatchLater([...watchLater, video]);
    }
  };

  const handleVideoEnd = () => {
    if (!watchedVideos.includes(param)) {
      setWatchedVideos([...watchedVideos, param]);
    }
    setVideoEnded(true);
  };

  const isVideoUnlocked = (videoLink) => {
    if (videoLink === "no") return true;
    const videos = ["no", "help", "please"];
    const videoIndex = videos.indexOf(videoLink);
    const previousVideo = videos[videoIndex - 1];
    return watchedVideos.includes(previousVideo);
  };

  const getNextVideo = () => {
    const videos = ["no", "help", "please"];
    const currentIndex = videos.indexOf(param);
    if (currentIndex < videos.length - 1) {
      return videos[currentIndex + 1];
    }
    return null;
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading videos...</div>;
  }

  if (!mainVideo) {
    return <div className="text-center p-10">Video not found</div>;
  }

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6">
      {/* Main Video Section */}
      <div className="w-full md:w-2/3">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-auto"
            onEnded={handleVideoEnd}
            key={param}
            poster={`/video/${param}/thumb.png`}
          >
            <source src={`/video/${param}/vid.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">{mainVideo.title}</h1>
          <p className="mt-2 text-gray-600">{mainVideo.description}</p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => addToWatchLater(mainVideo)}
              className="px-4 py-2 bg-gray-200 border-2 border-black rounded hover:bg-gray-300"
            >
              Watch Later
            </button>

            {videoEnded && getNextVideo() && (
              <Link
                to={`/videos/${getNextVideo()}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next Video
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Videos Section */}
      <div className="w-full md:w-1/3 mt-6 md:mt-0">
        <h2 className="text-xl font-bold mb-4">Watch Next</h2>
        <div className="space-y-4">
          {suggestedVideos.map((video, key) => {
            const isUnlocked = isVideoUnlocked(video.videoLink);
            return (
              <div
                key={key}
                className={`border rounded-lg overflow-hidden ${!isUnlocked ? "opacity-70" : ""}`}
              >
                <div className="relative">
                  <img
                    src={`/video/${video.videoLink}/thumb.png`}
                    alt="Thumbnail"
                    className="h-32 w-full object-cover"
                  />

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-1 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>

                <div className="p-3">
                  <h3 className="font-medium">{video.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    {isUnlocked ? (
                      <>
                        <Link
                          to={`/videos/${video.videoLink}`}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Watch Now
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToWatchLater(video);
                          }}
                          className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                        >
                          + Watch Later
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Complete previous video to unlock
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
