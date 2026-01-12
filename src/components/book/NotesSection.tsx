"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2, Search, X } from "lucide-react";
import { fetchBookNotes, searchNotes, NotesResponse } from "@/lib/read";
import { Book } from "@/lib/data2";
import { useIsMobile } from "@/hooks/use-mobile";
import { NoteCard } from "./notes/NoteCard";
import { NotesPagination } from "./notes/NotesPagination";

interface NotesSectionProps {
  bookId: string;
  book: Book;
}

export function NotesSection({ bookId, book }: NotesSectionProps) {
  const [notesData, setNotesData] = useState<NotesResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const isMobile = useIsMobile();
  const perPage = isMobile ? 7 : 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadNotes = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (searchQuery.trim()) {
        data = await searchNotes(bookId, searchQuery.trim(), page, perPage);
      } else {
        data = await fetchBookNotes(bookId, page, perPage);
      }
      
      if (data) {
        setNotesData(data);
      } else {
        setError('Failed to load notes');
      }
    } catch (err) {
      setError('An error occurred while loading notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId, perPage]);

  useEffect(() => {
    loadNotes(currentPage, debouncedSearchTerm);
  }, [loadNotes, currentPage, debouncedSearchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && notesData && newPage <= notesData.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (book.status == "planned") return null

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={14} className="text-zinc-400 dark:text-zinc-500" />
          <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
            Notes
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={14} className="text-zinc-400 dark:text-zinc-500" />
          <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
            Notes
          </h2>
        </div>
        <div className="text-sm text-red-500 py-8 text-center">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={14} className="text-zinc-400 dark:text-zinc-500" />
        <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
          Notes ({notesData?.totalItems || 0})
        </h2>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500" 
          />
          <input
            type="text"
            placeholder="Search notes..."
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

      {notesData && notesData.items.length > 0 ? (
        <>
          <div className="flex flex-col">
            {notesData.items.map((note) => (
              <NoteCard key={note.id} note={note} bookId={bookId} />
            ))}
          </div>
          
          <NotesPagination 
            notesData={notesData}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
          {debouncedSearchTerm ? `No notes found for "${debouncedSearchTerm}"` : "No notes yet for this book."}
        </p>
      )}
    </section>
  );
}