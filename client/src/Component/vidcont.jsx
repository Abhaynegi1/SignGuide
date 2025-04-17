import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const VidCont = () => {
  const [videoDetail, setVid] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);

  // Fetch video details
  useEffect(() => {
    fetch("/data/videos.json")
      .then((res) => res.json())
      .then((data) => setVid(data.video))
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  // Get watched videos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("watchedVideos");
    setWatchedVideos(stored ? JSON.parse(stored) : []);
  }, []);

  // Check if a video is unlocked
  const isUnlocked = (index) => {
    if (index === 0) return true;
    const previousVideoLink = videoDetail[index - 1]?.videoLink;
    return watchedVideos.includes(previousVideoLink);
  };

  return (
    <div className="flex flex-wrap justify-center h-auto gap-6 py-12 mt-[6vh] overflow-x-hidden">
      {videoDetail.map((val, index) => {
        const unlocked = isUnlocked(index);

        return (
          <div
            key={index}
            className={`w-[22vw] max-w-[350px] h-auto pb-10 shadow-xl rounded-lg flex flex-col gap-4 cursor-pointer duration-200 ${
              unlocked ? "hover:-translate-y-1" : "opacity-70 cursor-not-allowed"
            }`}
          >
            <div className="thumbnail w-full aspect-video bg-neutral-300 rounded-lg relative overflow-hidden">
              <img
                src={`/video/${val.videoLink}/thumb.png`}
                alt="Thumbnail"
                className="h-full w-full object-cover"
              />
              <div className="text-sm absolute px-2 py-1 rounded-lg bottom-1 right-1 bg-neutral-800 text-white">
                {val.duration}
              </div>

              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="details w-full h-auto flex flex-col px-3">
              <h1 className="text-xl truncate">{val.title}</h1>
              {unlocked ? (
                <Link
                  to={`/videos/${val.videoLink}`}
                  className="mt-2 inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 w-max"
                >
                  Watch Now
                </Link>
              ) : (
                <span className="text-sm text-gray-500 mt-2">
                  Complete previous video to unlock
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VidCont;
