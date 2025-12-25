import Link from "next/link";
import { Note } from "@/lib/read";

interface NoteCardProps {
  note: Note;
  bookId: string;
}

export function NoteCard({ note, bookId }: NoteCardProps) {
  const userName = note.expand?.user?.name || 'Unknown User';
  const userInitial = userName.charAt(0).toUpperCase();
  
  return (
    <Link 
      href={`/book/${bookId}/read?page=${note.page}`}
      className="block py-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors -mx-4 px-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {userInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{userName}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">p. {note.page}</span>
          </div>
          {note.bookText && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded px-2 py-1 mb-2 italic">
              "{note.bookText}"
            </div>
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{note.note}</p>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 block">
            {new Date(note.created).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}