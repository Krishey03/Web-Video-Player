import { ArrowLeft, Search } from "lucide-react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function NavBar({ search, setSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname.includes("/player");
  const isHomePage = location.pathname === '/';
  
  // Maintain separate search state for non-home pages
  const [localSearch, setLocalSearch] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (isHomePage && setSearch) {
      // Home page uses its own search state
      return;
    } else {
      // Redirect to home page with search query
      navigate(`/?search=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row justify-center items-center mb-8 gap-4">
      {showBackButton && (
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-2 hidden sm:inline">Back</span>
        </button>
      )}
      
      <div className="flex items-center gap-2 bg-[#1c1c1e] rounded-full px-4 py-2">
        <a href="/" className="text-[#f3f4f6] px-3 py-1 rounded-full">
          Home
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); window.location.reload(); }}
          className="bg-[#eb4242] text-white px-3 py-1 rounded-full flex items-center gap-1"
        >
          New Recommendations
        </a>
      </div>
      
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-auto min-w-[240px]">
        <input
          type="text"
          placeholder="Search videos..."
          value={isHomePage ? search : localSearch}
          onChange={(e) => isHomePage ? setSearch(e.target.value) : setLocalSearch(e.target.value)}
          className="w-full bg-[#1c1c1e] text-[#f3f4f6] rounded-full py-2 px-4 pr-10 focus:outline-none"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a1a1aa] h-5 w-5" />
      </form>
    </header>
  )
}