"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { joinReadingSession } from "@/lib/data2";

interface JoinSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  currentUserId: string;
  defaultTotalPages: number;
}

export function JoinSessionDialog({ 
  isOpen, 
  onClose, 
  bookId, 
  currentUserId, 
  defaultTotalPages 
}: JoinSessionDialogProps) {
  const [totalPages, setTotalPages] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSession = async () => {
    setIsJoining(true);
    
    try {
      const pages = parseInt(totalPages) || defaultTotalPages;
      const success = await joinReadingSession(bookId, currentUserId, pages);
      
      if (success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        console.error('Failed to join reading session');
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error joining session:', error);
      // TODO: Show error message to user
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setTotalPages("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Join Reading Session</h3>
          <button
            onClick={handleClose}
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            disabled={isJoining}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">
            Total pages in your copy
          </label>
          <Input
            type="number"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder={`Default: ${defaultTotalPages}`}
            className="w-full"
            disabled={isJoining}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Different editions may have different page counts. This helps normalize your progress.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
            disabled={isJoining}
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoinSession}
            disabled={isJoining}
            className="flex-1"
          >
            {isJoining ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Session"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}