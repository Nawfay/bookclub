"use client";

import { Book } from "@/lib/data2";

interface MemberProgressProps {
  book: Book | null;
}

export function MemberProgress({ book }: MemberProgressProps) {
  // Handle null case
  if (!book) return null
  if (book.members.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide mb-4">Member Progress</h2>
      <div className="flex flex-col gap-3">
        {book.members.map((member) => {
          return (
            <div key={member.id} className="flex items-center gap-3">
              <img
                src={member.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${member.name}`}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 w-20">{member.name}</span>
              <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
                  style={{ width: `${member.readingSession.normalizedPerc}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums w-24 text-right">
                p. {member.readingSession.normalizedPage} / {book.totalPages}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}