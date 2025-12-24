"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Book } from "@/lib/data2";
import pb from "@/lib/pocketbase";

type BookStatus = 'reading' | 'completed' | 'planned' | 'dropped';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  currentUserId: string;
}

export function StatusUpdateDialog({ isOpen, onClose, book, currentUserId }: StatusUpdateDialogProps) {
  // Initialize with current book status
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>(book.status as BookStatus || 'reading');
  const [isUpdating, setIsUpdating] = useState(false);

  // Find current user's reading session
  const currentUser = book.members.find(member => member.id === currentUserId);

  const statusOptions: { value: BookStatus; label: string; description: string }[] = [
    { value: 'reading', label: 'Currently Reading', description: 'Actively reading this book' },
    { value: 'completed', label: 'Completed', description: 'Finished reading this book' },
    { value: 'planned', label: 'Want to Read', description: 'Planning to read this book' },
    { value: 'dropped', label: 'Dropped', description: 'Stopped reading this book' },
  ];

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    
    try {
      // Update the book's status in the books collection
      await pb.collection('books').update(book.id, {
        status: selectedStatus
      });

      // Reset form and close dialog
      onClose();
      
      // Refresh the page to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Failed to update book status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Update Reading Status</h3>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-3">Select Status</label>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value as BookStatus)}
                  className="mt-0.5 text-zinc-900 dark:text-zinc-100"
                />
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpdateStatus}
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </button>
      </div>
    </div>
  );
}