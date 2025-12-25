"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { canViewAdmin } from "@/lib/auth";
import pb from "@/lib/pocketbase";

interface BookFooterProps {
  bookId: string;
  bookTitle: string;
}

export function BookFooter({ bookId, bookTitle }: BookFooterProps) {
  const router = useRouter();
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdminUser = canViewAdmin();

  const handleDeleteBook = async () => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await pb.collection('books').delete(bookId);
      router.push('/'); // Redirect to home page after deletion
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteMenu(false);
    }
  };

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteMenu) {
        setShowDeleteMenu(false);
      }
    };

    if (showDeleteMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDeleteMenu]);

  return (
    <footer className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Notes are sorted by page number to avoid spoilers.
        </p>
        
        {/* admin user menu */}
        {isAdminUser && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteMenu(!showDeleteMenu);
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showDeleteMenu && (
              <div 
                className="absolute right-0 bottom-full mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[120px] z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDeleteBook}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}