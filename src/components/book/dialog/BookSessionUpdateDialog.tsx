"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Book, BookSession } from "@/lib/data2";
import { updateBookSession } from "@/lib/data2";

interface BookSessionUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

export function BookSessionUpdateDialog({ isOpen, onClose, book }: BookSessionUpdateDialogProps) {
  const [currentPage, setCurrentPage] = useState("");
  const [targetPage, setTargetPage] = useState("");
  const [chapter, setChapter] = useState("");
  const [estimatedEndDate, setEstimatedEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const bookSession = book.bookSession;

  const handleUpdateSession = async () => {
    // Must update at least one field
    if (!currentPage && !targetPage && !chapter && !estimatedEndDate && !status) return;
    
    setIsUpdating(true);
    
    try {
      const updateData: Partial<BookSession> = {};

      // Update fields if provided
      if (currentPage) {
        const pageNum = parseInt(currentPage);
        if (pageNum >= 0 && pageNum <= book.totalPages) {
          updateData.currentPage = pageNum;
        }
      }

      if (targetPage) {
        const pageNum = parseInt(targetPage);
        if (pageNum >= 0 && pageNum <= book.totalPages) {
          updateData.targetPage = pageNum;
        }
      }

      if (chapter) {
        updateData.chapter = chapter;
      }

      if (estimatedEndDate) {
        updateData.estimatedEndDate = estimatedEndDate;
      }

      if (status) {
        updateData.status = status;
      }

      const success = await updateBookSession(book.id, updateData);

      if (success) {
        // Reset form and close dialog
        onClose();
        setCurrentPage("");
        setTargetPage("");
        setChapter("");
        setEstimatedEndDate("");
        setStatus("");
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert('Failed to update book session. Please try again.');
      }
      
    } catch (error) {
      console.error('Error updating book session:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Update Book Session</h3>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Current Page</label>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              placeholder={bookSession.currentPage.toString()}
              min="0"
              max={book.totalPages}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Target Page</label>
            <input
              type="number"
              value={targetPage}
              onChange={(e) => setTargetPage(e.target.value)}
              placeholder={bookSession.targetPage.toString()}
              min="0"
              max={book.totalPages}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Chapter</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder={bookSession.chapter || 'Enter chapter name'}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Estimated End Date</label>
            <input
              type="date"
              value={estimatedEndDate}
              onChange={(e) => setEstimatedEndDate(e.target.value)}
              placeholder={new Date(bookSession.estimatedEndDate).toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Keep current ({bookSession.status})</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleUpdateSession}
          disabled={isUpdating || (!currentPage && !targetPage && !chapter && !estimatedEndDate && !status)}
          className="w-full mt-6 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update Session"}
        </button>
      </div>
    </div>
  );
}