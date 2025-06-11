import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MoreHorizontal, Play, Clock } from 'lucide-react';
import axios from 'axios';

function Player() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoPath = decodeURIComponent(location.pathname.replace('/player', ''));
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  
  // Extract video name from path for display
  const videoName = videoPath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Video';
  const formattedVideoName = videoName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      try {
        setIsLoadingRecs(true);
        const res = await axios.get('http://localhost:5000/api/videos?limit=5');
        // Filter out current video
        const filteredVideos = res.data.videos.filter(
          video => video.url !== videoPath
        );
        setRecommendedVideos(filteredVideos.slice(0, 4)); // Show max 4 recommendations
      } catch (error) {
        console.error("Error fetching recommended videos:", error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendedVideos();
  }, [videoPath]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-slate-400 hover:text-slate-100 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium hidden sm:inline">Back to Library</span>
              </button>
            </div>
            
            <h1 className="text-lg font-semibold text-slate-200 truncate max-w-xs md:max-w-md">
              {formattedVideoName}
            </h1>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all duration-200">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all duration-200">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all duration-200">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="relative aspect-video bg-black">
                <video
                  src={`http://localhost:5000${videoPath}`}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  style={{
                    background: 'linear-gradient(45deg, #0f172a 25%, transparent 25%), linear-gradient(-45deg, #0f172a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0f172a 75%), linear-gradient(-45deg, transparent 75%, #0f172a 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                />
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-2">
                  {formattedVideoName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span>Now Playing</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-800 gap-4">
                <div className="flex items-center flex-wrap gap-2">
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Like
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Add to Playlist
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Share
                  </button>
                </div>
                <div className="text-slate-400 text-xs sm:text-sm">
                  Video path: <code className="bg-slate-800 px-2 py-1 rounded text-xs break-all">{videoPath}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video Details */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Video Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Format:</span>
                  <span className="text-slate-100">MP4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quality:</span>
                  <span className="text-slate-100">Auto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-green-400">Ready to play</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size:</span>
                  <span className="text-slate-100">128 MB</span>
                </div>
              </div>
            </div>

            {/* Recommended Videos */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Recommended Videos</h3>
              
              {isLoadingRecs ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-slate-800 rounded-lg aspect-video mb-2"></div>
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recommendedVideos.length > 0 ? (
                <div className="space-y-4">
                  {recommendedVideos.map((video, index) => (
                    <Link
                      to={`/player${video.url}`}
                      key={index}
                      className="group block bg-slate-800/30 hover:bg-slate-800/70 rounded-lg p-2 transition-all duration-200"
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0 w-16 aspect-video rounded-md overflow-hidden bg-slate-700">
                          {video.thumbnailUrl ? (
                            <img
                              src={`http://localhost:5000${video.thumbnailUrl}`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                            {video.title}
                          </h4>
                          <div className="text-xs text-slate-400 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{video.duration || '0:00'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">
                    No recommendations available
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 text-left px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span>Download Video</span>
                </button>
                <button className="w-full flex items-center space-x-3 text-left px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
                <button className="w-full flex items-center space-x-3 text-left px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors duration-200">
                  <MoreHorizontal className="w-4 h-4" />
                  <span>More Options</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;