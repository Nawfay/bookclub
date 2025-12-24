"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Book, Member } from "@/lib/data2";
import pb from "@/lib/pocketbase";

interface PageUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentUserId: string;
}

export function PageUpdateDialog({ isOpen, onClose, book, currentUserId }: PageUpdateDialogProps) {
  const [newPage, setNewPage] = useState("");
  const [newTotalPages, setNewTotalPages] = useState("");
  const [showTotalPagesInput, setShowTotalPagesInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Find current user's reading session
  const currentUser = book.members.find(member => member.id === currentUserId);

  const handleUpdatePage = async () => {
    if (!currentUser) return;
    
    const pageNum = newPage ? parseInt(newPage) : null;
    const totalPagesNum = newTotalPages ? parseInt(newTotalPages) : null;
    
    // Validate inputs
    if (pageNum !== null && pageNum < 1) return;
    if (totalPagesNum !== null && totalPagesNum < 1) return;
    if (pageNum !== null && totalPagesNum !== null && pageNum > totalPagesNum) return;
    if (pageNum !== null && totalPagesNum === null && pageNum > currentUser.readingSession.bookTotalPages) return;
    
    // Must update at least one field
    if (!newPage && !newTotalPages) return;
    
    setIsUpdating(true);
    
    try {
      // Find user's reading session
      const readerSessions = await pb.collection('readers_sessions').getFullList({
        filter: `book = "${book.id}" && user = "${currentUserId}"`
      });

      if (readerSessions.length > 0) {
        const sessionId = readerSessions[0].id;
        const updateData: any = {};

        // Update current page if provided
        if (pageNum !== null) {
          updateData.currentPage = pageNum;
        }

        // Update book total pages if provided
        if (totalPagesNum !== null) {
          updateData.bookTotalPages = totalPagesNum;
        }

        await pb.collection('readers_sessions').update(sessionId, updateData);
      }

      // Reset form and close dialog
      onClose();
      setNewPage("");
      setNewTotalPages("");
      setShowTotalPagesInput(false);
      
      // Refresh the page to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Update Current Page</h3>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Current Page</label>
          <input
            type="number"
            value={newPage}
            onChange={(e) => setNewPage(e.target.value)}
            placeholder={currentUser.readingSession.currentPage.toString()}
            min="1"
            max={showTotalPagesInput && newTotalPages ? parseInt(newTotalPages) : book.totalPages}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Update Total Pages</label>
            <button
              type="button"
              onClick={() => setShowTotalPagesInput(!showTotalPagesInput)}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline"
            >
              {showTotalPagesInput ? "Cancel" : "Change"}
            </button>
          </div>
          
          {showTotalPagesInput && (
            <input
              type="number"
              value={newTotalPages}
              onChange={(e) => setNewTotalPages(e.target.value)}
              placeholder={currentUser.readingSession.bookTotalPages.toString()}
              min="1"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          )}
          
          {!showTotalPagesInput && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Current: {currentUser.readingSession.bookTotalPages} pages
            </div>
          )}
        </div>

        <button
          onClick={handleUpdatePage}
          disabled={isUpdating || (!newPage && !newTotalPages) || (showTotalPagesInput && !newTotalPages)}
          className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}