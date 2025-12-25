import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Book, isBookUninitialized } from "@/lib/data2";
import { MemberProgress } from "./member-progress";
import { canViewAdmin } from "@/lib/auth";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  // Handle case where there are no members
const avgProgress = book.members.length > 0 
    ? Math.round(
        book.members.reduce((acc, m) => acc + m.readingSession.normalizedPerc, 0) /
          book.members.length
      )
    : 0;

  const needsInitialization = isBookUninitialized(book) && canViewAdmin();

  return (
    <Link href={`/book/${book.id}`} className="block group">
      <div className="py-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors -mx-2 px-2 rounded">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={book.cover || ""}
              alt={book.title}
              className="w-12 h-16 object-cover rounded shadow-sm"
            />
            {needsInitialization && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <AlertCircle size={10} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] text-zinc-900 dark:text-zinc-100 font-medium group-hover:underline underline-offset-4 decoration-zinc-400">
                    {book.title}
                  </h3>
                  {book.status === 'dropped' && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                      Dropped
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{book.author}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                <span>{avgProgress}%</span>
                <ChevronRight size={14} />
              </div>
            </div>
            <MemberProgress book={book} />
          </div>
        </div>
      </div>
    </Link>
  );
}