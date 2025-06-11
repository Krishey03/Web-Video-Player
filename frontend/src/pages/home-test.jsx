import React from "react";
import { Search } from "lucide-react";

export default function Hometest() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#ffffff] p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2 bg-[#1c1c1e] rounded-full px-4 py-2">
          <a href="#" className="text-[#f3f4f6] px-3 py-1 rounded-full">
            Home
          </a>
          <a
            href="#"
            className="bg-[#eb4242] text-white px-3 py-1 rounded-full flex items-center gap-1"
          >
            New Recommendations
            <span className="inline-flex h-2 w-2 rounded-full bg-white"></span>
          </a>
        </div>
        <div className="relative w-full md:w-auto min-w-[240px]">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#1c1c1e] text-[#f3f4f6] rounded-full py-2 px-4 pr-10 focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a1a1aa] h-5 w-5" />
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden bg-[#1c1c1e]">
              <div className="aspect-video relative">
                <img
                  src="/placeholder.svg?height=180&width=320"
                  alt="Video thumbnail"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-3">
                <h3 className="text-[#ffffff]">Video Title</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
