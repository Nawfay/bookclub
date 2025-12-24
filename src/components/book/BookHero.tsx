"use client";

import { BookOpen } from "lucide-react";
import { Book } from "@/lib/data2";

interface BookHeroProps {
  book: Book | null;
}

export function BookHero({ book }: BookHeroProps) {
  // Handle null case
  if (!book) {
    return (
      <div className="flex gap-6 mb-10">
        <div className="w-24 h-36 bg-zinc-200 dark:bg-zinc-700 rounded shadow-md animate-pulse" />
        <div className="flex-1">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded mb-2 animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 mb-4 animate-pulse" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-3 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
            <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  
  // Calculate progress based on data structure
   const avgProgress = book.members.length > 0 
    ? Math.round(
        book.members.reduce((acc, m) => acc + m.readingSession.normalizedPerc, 0) /
          book.members.length
      )
    : 0;

  return (
    <div className="flex gap-6 mb-10">
      <img
        src={book.cover}
        alt={book.title}
        className="w-24 h-36 object-cover rounded shadow-md"
      />
      <div className="flex-1">
        <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-1">{book.title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{book.author}</p>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          <BookOpen size={12} />
          <span>{book.totalPages} pages</span>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span className="capitalize">{book.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{avgProgress}%</span>
        </div>
      </div>
    </div>
  );
}