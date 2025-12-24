import { BookOpen, TrendingUp, Users, Star } from "lucide-react";
import { Book } from "@/lib/data2";

interface GlobalStatsProps {
  books: Book[];
}

export function GlobalStats({ books }: GlobalStatsProps) {
  const completedBooks = books.filter(b => b.status === "completed");
  const totalPages = completedBooks.reduce((acc, b) => acc + b.totalPages, 0);
  
  // Since the new data structure doesn't have notes, we'll calculate based on reviews
  const totalReviews = books.reduce((acc, b) => {
    return acc + b.members.filter(m => m.readingSession.review).length;
  }, 0);
  
  const allMembers = Array.from(
    new Set(books.flatMap(b => b.members.map(m => m.id)))
  );
  
  const memberStats = allMembers.map(memberId => {
    // Find member data from any book (they should be consistent)
    let memberData = null;
    for (const book of books) {
      const member = book.members.find(m => m.id === memberId);
      if (member) {
        memberData = member;
        break;
      }
    }
    
    const pagesRead = books.reduce((acc, book) => {
      const member = book.members.find(m => m.id === memberId);
      return acc + (member?.readingSession.currentPage || 0);
    }, 0);
    
    return {
      id: memberId,
      name: memberData?.name || "Unknown",
      avatar: memberData?.avatar || "",
      pagesRead,
    };
  }).sort((a, b) => b.pagesRead - a.pagesRead);
  
  const avgRating = completedBooks.length > 0
    ? (completedBooks.reduce((acc, b) => {
        const ratings = b.members
          .filter(m => m.readingSession.rating > 0)
          .map(m => m.readingSession.rating);
        const bookAvg = ratings.length > 0 
          ? ratings.reduce((a, r) => a + r, 0) / ratings.length 
          : 0;
        return acc + bookAvg;
      }, 0) / completedBooks.length).toFixed(1)
    : "0.0";

  return (
    <section>
      <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide mb-6">Club Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Books Completed</span>
          </div>
          <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">{completedBooks.length}</p>
        </div>
        
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Total Pages</span>
          </div>
          <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">{totalPages.toLocaleString()}</p>
        </div>
        
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Avg Rating</span>
          </div>
          <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">{avgRating}</p>
        </div>
        
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-zinc-400 dark:text-zinc-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Total Reviews</span>
          </div>
          <p className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">{totalReviews}</p>
        </div>
      </div>
      
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-zinc-400 dark:text-zinc-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Member Leaderboard</span>
        </div>
        <div className="space-y-3">
          {memberStats.map((member, index) => (
            <div key={member.id} className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 w-4">{index + 1}</span>
              <img
                src={member.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${member.name}`}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm text-zinc-900 dark:text-zinc-100 flex-1">{member.name}</span>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">
                {member.pagesRead.toLocaleString()} pages
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}