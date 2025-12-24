"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, BookOpen } from "lucide-react";
import { canViewAdmin } from "@/lib/auth";

interface BookNavigationProps {
  onUpdatePage: () => void;
  onUpdateStatus: () => void;
}

export function BookNavigation({ onUpdatePage, onUpdateStatus }: BookNavigationProps) {
  const isAdmin = canViewAdmin();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex-shrink-0"
      >
        <ArrowLeft size={12} />
        Back to all books
      </Link>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        {isAdmin && (
          <button
            onClick={onUpdateStatus}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors flex-shrink-0 whitespace-nowrap"
          >
            <BookOpen size={12} />
            Update Status
          </button>
        )}
        <button
          onClick={onUpdatePage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors flex-shrink-0 whitespace-nowrap"
        >
          <RefreshCw size={12} />
          Update Page
        </button>
      </div>
    </div>
  );
}