"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Book } from "@/lib/data2";
import { BookCard } from "./book-card";

interface SearchBooksProps {
  books: Book[];
}

export function SearchBooks({ books }: SearchBooksProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsSearchActive(value.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  return (
    <div className="mb-8">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500" 
          />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isSearchActive && (
        <div className="space-y-4">
          {searchQuery.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
                Search Results
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
          
          {filteredBooks.length > 0 ? (
            <div className="flex flex-col space-y-0">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : searchQuery.length > 0 ? (
            <div className="text-center py-8">
              <div className="text-zinc-500 dark:text-zinc-400 text-sm">
                No books found matching "{searchQuery}"
              </div>
              <div className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
                Try searching by title or author name
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}