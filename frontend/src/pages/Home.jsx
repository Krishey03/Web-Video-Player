import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Search } from "lucide-react";
import axios from "axios";
import NavBar from "../components/reuse/navbar";

export default function Hometest() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/videos?limit=12&search=${encodeURIComponent(search)}` //limit to 12 results
        );
        setVideos(res.data.videos);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

  const debounceTimer = setTimeout(fetchVideos, 300);
  return () => clearTimeout(debounceTimer);
}, [search]);

    const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const paddedMins = minutes.toString().padStart(2, '0');
    const paddedSecs = secs.toString().padStart(2, '0');
    
    return hours > 0 
      ? `${hours}:${paddedMins}:${paddedSecs}`
      : `${minutes}:${paddedSecs}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#ffffff] p-4 md:p-6">
      <NavBar search={search} setSearch={setSearch} />

      <main>
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-red-900/20 p-4 rounded-full mb-4">
              <Search className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Connection Error
            </h3>
            <p className="text-slate-400 max-w-md">
              {error} Check if the backend server is running.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#eb4242] mb-4"></div>
            <p className="text-slate-400">Loading videos...</p>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && search && videos.length > 0 && (
          <div className="mb-4">
            <p className="text-[#a1a1aa]">
              Found {videos.length} {videos.length === 1 ? 'video' : 'videos'} for "{search}"
            </p>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && !error && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, idx) => (
              <Link
                to={`/player${video.url}`}
                key={idx}
                className="group rounded-lg overflow-hidden bg-[#1c1c1e] transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#eb4242]/10"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative">
                  {video.thumbnailUrl ? (
                    <img
                      src={`http://localhost:5000${video.thumbnailUrl}`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c1c1e] to-[#0f0f0f]">
                      <div className="text-center p-4">
                        <div className="bg-[#1c1c1e] p-4 rounded-full inline-block">
                          <Search className="w-8 h-8 text-[#a1a1aa] mx-auto" />
                        </div>
                        <span className="text-[#a1a1aa] text-xs mt-2 block">
                          No preview available
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#eb4242] rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                 {video.duration && (
                  <div className="absolute bottom-3 right-3 bg-[#0f0f0f]/90 text-[#f3f4f6] text-xs px-2 py-1 rounded flex items-center space-x-1">
                    {/* Format duration here */}
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
                </div>
                
                {/* Video Info */}
                <div className="p-3">
                  <h3 className="text-[#ffffff] font-medium line-clamp-2 group-hover:text-[#eb4242] transition-colors">
                    {video.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Empty State */}
        {!isLoading && !error && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-[#1c1c1e] p-6 rounded-full mb-6">
              <Search className="w-14 h-14 text-[#a1a1aa] mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-[#ffffff] mb-2">
              {search ? "No videos found" : "Your library is empty"}
            </h3>
            <p className="text-[#a1a1aa] max-w-md">
              {search
                ? `No results for "${search}". Try a different search term.`
                : "No videos available at the moment. Please add videos to your library."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}