import React, { useEffect, useState } from "react";
import { Search, ArrowLeft, Download, Share2, MoreHorizontal, Play, Clock } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "../components/reuse/navbar";

export default function Playertest() {
  const location = useLocation();
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

  const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${minutes}:${secs.toString().padStart(2, '0')}`;
};

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navigation Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#1c1c1e]">
        <NavBar search="" setSearch={() => {}} />
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Main Video Player */}
        <div className="flex-1">
          <div className="relative aspect-video bg-[#1c1c1e] rounded-lg overflow-hidden">
            <video
              src={`http://localhost:5000${videoPath}`}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">{formattedVideoName}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <span>Now Playing</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Video Sidebar */}
        <div className="w-80 space-y-4">
          <h3 className="text-lg font-semibold text-white">Recommended Videos</h3>
          
          {isLoadingRecs ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-32 h-20 bg-[#1c1c1e] rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#1c1c1e] rounded w-3/4"></div>
                    <div className="h-3 bg-[#1c1c1e] rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedVideos.length > 0 ? (
            recommendedVideos.map((video, index) => (
              <Link
                to={`/player${video.url}`}
                key={index}
                className="flex gap-3 group hover:bg-[#1c1c1e]/70 rounded-lg p-2 transition-all"
              >
                <div className="relative w-32 h-20 bg-[#1c1c1e] rounded-lg overflow-hidden flex-shrink-0">
                  {video.thumbnailUrl ? (
                    <img
                      src={`http://localhost:5000${video.thumbnailUrl}`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 py-1 overflow-hidden">
                  <h3 className="text-white font-medium text-sm leading-tight truncate group-hover:text-[#ef4444]">
                    {video.title}
                  </h3>
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recommendations available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}