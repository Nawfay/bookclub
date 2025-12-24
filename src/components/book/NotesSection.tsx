"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Book, Note } from "@/lib/data";

interface NotesSectionProps {
  book: Book;
  bookId: string;
}

function NoteCard({ note, bookId }: { note: Note; bookId: string }) {
  return (
    <Link 
      href={`/book/${bookId}/read?note=${note.id}`}
      className="block py-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors -mx-4 px-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {note.memberName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{note.memberName}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">p. {note.page}</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{note.content}</p>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 block">{note.createdAt}</span>
        </div>
      </div>
    </Link>
  );
}

export function NotesSection({ book, bookId }: NotesSectionProps) {
  const sortedNotes = [...book.notes].sort((a, b) => a.page - b.page);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={14} className="text-zinc-400 dark:text-zinc-500" />
        <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
          Notes ({book.notes.length})
        </h2>
      </div>

      {sortedNotes.length > 0 ? (
        <div className="flex flex-col">
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} bookId={bookId} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">No notes yet for this book.</p>
      )}
    </section>
  );
}