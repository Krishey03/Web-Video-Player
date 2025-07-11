import React, { useEffect, useState, useRef } from "react";
import { Search, ArrowLeft, Download, Share2, MoreHorizontal, Play, Clock, Trash2 } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "../components/reuse/navbar";

export default function Playertest() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const videoPath = decodeURIComponent(location.pathname.replace('/player', ''));
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [showControlsHint, setShowControlsHint] = useState(false);
  
  // Extract video name from path for display
  const videoName = videoPath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Video';
  const formattedVideoName = videoName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Initialize newName with formattedVideoName
  useEffect(() => {
    setNewName(formattedVideoName);
  }, [formattedVideoName]);

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      try {
        setIsLoadingRecs(true);
        const res = await axios.get('http://localhost:5000/api/videos?limit=5');
        // Filter out current video
        const filteredVideos = res.data.videos.filter(
          video => video.url !== videoPath
        );
        setRecommendedVideos(filteredVideos.slice(0, 5)); // Show max 4 recommendations
      } catch (error) {
        console.error("Error fetching recommended videos:", error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendedVideos();
  }, [videoPath]);

  // Keyboard controls handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard events if we're in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

if (!videoRef.current) return;

    // Check if video player is focused or if we're not in a focusable element
    const isVideoFocused = document.activeElement === videoRef.current;
    const isFocusableElement = ['A', 'BUTTON'].includes(document.activeElement?.tagName);
    
    switch (e.key) {
      case ' ':
        // Only handle space if video is focused or we're not in a focusable element
        if (isVideoFocused || !isFocusableElement) {
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
        }
          break;
        case 'ArrowRight':
          // Right arrow to seek forward 5 seconds
          e.preventDefault();
          videoRef.current.currentTime += 5;
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        case 'ArrowLeft':
          // Left arrow to seek backward 5 seconds
          e.preventDefault();
          videoRef.current.currentTime -= 5;
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        case 'ArrowUp':
          // Up arrow to increase volume
          e.preventDefault();
          videoRef.current.volume = Math.min(videoRef.current.volume + 0.1, 1);
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        case 'ArrowDown':
          // Down arrow to decrease volume
          e.preventDefault();
          videoRef.current.volume = Math.max(videoRef.current.volume - 0.1, 0);
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        case 'm':
          // M to mute/unmute
          e.preventDefault();
          videoRef.current.muted = !videoRef.current.muted;
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        case 'f':
          // F to toggle fullscreen
          e.preventDefault();
          if (!document.fullscreenElement) {
            videoRef.current.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
          } else {
            document.exitFullscreen();
          }
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // Number keys to jump to percentage of video
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          videoRef.current.currentTime = videoRef.current.duration * percent;
          setShowControlsHint(true);
          setTimeout(() => setShowControlsHint(false), 2000);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRename = async () => {
    try {
      const trimmedName = newName.trim();
      if (!trimmedName) {
        alert('Please enter a valid name');
        return;
      }

      const response = await axios.put('http://localhost:5000/api/videos/rename', 
        {
          oldPath: videoPath,
          newName: trimmedName
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      navigate(`/player${response.data.newUrl}`, { replace: true });
      setIsRenaming(false);
    } catch (error) {
      console.error("Rename error:", error);
      alert(error.response?.data?.error || 'Failed to rename video');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/videos/delete', {
        data: { videoPath },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      navigate('/');
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.error || 'Failed to delete video');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navigation Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#1c1c1e]">
        <NavBar />
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Main Video Player */}
        <div className="flex-1">
          <div className="relative aspect-video bg-[#1c1c1e] rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={`http://localhost:5000${videoPath}`}
              controls
              autoPlay
              className="w-full h-full object-contain"
              tabIndex="0"
            />
            {/* Keyboard controls hint */}
            {showControlsHint && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                Space: Play/Pause • Arrows: Seek/Volume • M: Mute • F: Fullscreen
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className="mt-4">
            {isRenaming ? (
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-black bg-white flex-1"
                  autoFocus
                />
                <Button onClick={handleRename} className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
                <Button 
                  onClick={() => {
                    setIsRenaming(false);
                    setNewName(formattedVideoName);
                  }} 
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">{formattedVideoName}</h1>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsRenaming(true)} 
                    className="bg-gray-300 hover:bg-gray-600 text-sm"
                    size="sm"
                    variant="secondary"
                  >
                    Rename
                  </Button>
                  <Button 
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-full"
                    size="icon"
                    variant="secondary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

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