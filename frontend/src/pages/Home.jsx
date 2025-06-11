import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search, Play, Clock } from 'lucide-react';

export default function VideoLibrary() {
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
          `http://localhost:5000/api/videos?search=${encodeURIComponent(search)}`
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-1">
              Video Library
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Discover and watch your favorite videos
            </p>
            
            {/* Search bar */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-3 px-5 pr-12 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-slate-800/90"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
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
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400">Loading videos...</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              {search && videos.length > 0 && (
                <div className="mb-6">
                  <p className="text-slate-400">
                    Found {videos.length} {videos.length === 1 ? 'video' : 'videos'} for "{search}"
                  </p>
                </div>
              )}

              {/* Video grid */}
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {videos.map((video, idx) => (
                    <Link
                      to={`/player${video.url}`}
                      key={idx}
                      className="group bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 transition-all duration-300 hover:bg-slate-900/70 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/30"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                        {video.thumbnailUrl ? (
                          <img
                            src={`http://localhost:5000${video.thumbnailUrl}`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center p-4">
                              <div className="bg-slate-700/50 p-4 rounded-full inline-block">
                                <Play className="w-8 h-8 text-slate-400 mx-auto" />
                              </div>
                              <span className="text-slate-500 text-xs mt-2 block">
                                No preview available
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent flex items-end p-4">
                          <div className="w-full">
                            <h3 className="font-semibold text-slate-100 text-sm leading-tight line-clamp-2">
                              {video.title}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-blue-600 rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>

                        {/* Duration badge */}
                        {video.duration && (
                          <div className="absolute bottom-3 right-3 bg-slate-900/90 text-slate-200 text-xs px-2 py-1 rounded flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{video.duration}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-slate-800/30 p-6 rounded-full mb-6">
                    <Search className="w-14 h-14 text-slate-500 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    {search ? "No videos found" : "Your library is empty"}
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    {search
                      ? `No results for "${search}". Try a different search term.`
                      : "No videos available at the moment. Please add videos to your library."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Video Library. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}