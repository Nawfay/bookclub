"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import { Book } from "@/lib/data2";

interface FooterProps {
  books: Book[];
}

export function Footer({ books }: FooterProps) {
  const reviewCount = books.reduce((acc, b) => {
    return acc + b.members.filter(m => m.readingSession.review).length;
  }, 0);
  const bookCount = books.length;

  return (
    <footer className="mt-12 pt-8">
      <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <BookOpen size={12} />
          <span>{bookCount} books in your club library</span>
        </div>
        <div className="flex items-center">
          <span>{reviewCount} shared reviews across all books</span>
          <ChevronRight size={12} className="opacity-70 ml-0.5" />
        </div>
      </div>
    </footer>
  );
}