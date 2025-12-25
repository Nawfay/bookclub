import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

interface NotesSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export function NotesSearch({ onSearch, placeholder = "Search notes..." }: NotesSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search 
          size={16} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500" 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}