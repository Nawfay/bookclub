"use client";

import { useState } from "react";
import { Book as NewBook } from "@/lib/data2";
import { canViewAdmin } from "@/lib/auth";
import { BookSessionUpdateDialog } from "./dialog/BookSessionUpdateDialog";
import { JoinSessionDialog } from "./dialog/JoinSessionDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface BookSessionProps {
  book: NewBook | null;
  currentUserId: string;
}

export function BookSession({ book, currentUserId }: BookSessionProps) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  // Handle null case
  if (!book) {
    return (
      <div className="mb-10 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
        </div>
      </div>
    );
  }

  if (book.status == "completed" || book.status == "planned") return null;

  // Find current user in the book's members
  const currentUser = book.members.find(member => member.id === currentUserId);
  
  // If user is not a member, show join prompt
  if (!currentUser) {
    return (
      <div className="mb-10 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Join Reading Session</h3>
        </div>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          You're not currently part of this book's reading session. Join to track your progress and read others notes.
        </p>
        
        <Button
          onClick={() => setShowJoinDialog(true)}
          className="w-full sm:w-auto"
          size="sm"
        >
          <UserPlus size={14} className="mr-2" />
          Join Reading Session
        </Button>

        <JoinSessionDialog
          isOpen={showJoinDialog}
          onClose={() => setShowJoinDialog(false)}
          bookId={book.id}
          currentUserId={currentUserId}
          defaultTotalPages={book.totalPages}
        />
      </div>
    );
  }
  
  // Calculate reading session data from book session
  const bookSession = book.bookSession;
  const today = new Date();
  const endDate = new Date(bookSession.estimatedEndDate);
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="mb-10 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Book Session
          {canViewAdmin() && (
            <button
              onClick={() => setShowUpdateDialog(true)}
              className="ml-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              title="Update book session"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Session ended'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <div>
          <span className="text-zinc-400 dark:text-zinc-500">Target:</span> Page {bookSession.targetPage}
        </div>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <div>
          <span className="text-zinc-400 dark:text-zinc-500">Pace:</span> {bookSession.readingPacePerDay} pages/day
        </div>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <div>
          <span className="text-zinc-400 dark:text-zinc-500">Ends:</span> {new Date(bookSession.estimatedEndDate).toLocaleDateString()}
        </div>
      </div>
      
      <BookSessionUpdateDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        book={book}
      />
    </div>
  );
}