import React from "react";
import { Search } from "lucide-react"; // Ensure lucide-react is installed

// Replace these with your own components or HTML equivalents if needed
import Button from "./components/ui/button";
import Input from "./components/ui/input";

export default function Hometest() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navigation Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#1c1c1e]">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Home</span>
          <Button className="bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-full px-4 py-2 text-sm">
            New Recommendations
          </Button>
        </div>

        <div className="relative w-80">
          <Input
            placeholder="Search"
            className="bg-[#1c1c1e] border-[#1c1c1e] text-white placeholder:text-[#a1a1aa] pr-10 rounded-full"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a1a1aa] w-4 h-4" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Main Video Player */}
        <div className="flex-1">
          <div className="relative aspect-video bg-[#1c1c1e] rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg?height=480&width=854"
              alt="Main video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6">
              <h1 className="text-4xl font-bold text-white">Video Title</h1>
            </div>
          </div>
        </div>

        {/* Video Sidebar */}
        <div className="w-80 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="relative w-32 h-20 bg-[#1c1c1e] rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="/placeholder.svg?height=80&width=128"
                  alt={`Video thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 py-1">
                <h3 className="text-white font-medium text-sm leading-tight">Video Title</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
