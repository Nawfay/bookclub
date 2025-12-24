import { Book } from "@/lib/data2";
import { Star } from "lucide-react";

interface MemberProgressProps {
  book: Book;
}

export function MemberProgress({ book }: MemberProgressProps) {

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={10}
        className={`${
          i < rating 
            ? 'fill-zinc-900 dark:fill-zinc-100 text-zinc-900 dark:text-zinc-100' 
            : 'text-zinc-300 dark:text-zinc-600' 
        }`}
      />
    ));
  };

  if (book.status == "completed") {
    // Show reviews for completed books
    const membersWithReviews = book.members.filter(member => 
      (member.readingSession.review && member.readingSession.review.trim().length > 0) ||
      member.readingSession.rating > 0
    );

    if (membersWithReviews.length === 0) {
      return (
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          No reviews yet
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 mt-2">
        {membersWithReviews.slice(0, 2).map((member) => (
          <div key={member.id} className="flex items-start gap-2">
            <img
              src={member.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${member.name}`}
              alt={member.name}
              className="w-4 h-4 rounded-full object-cover mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{member.name}</span>
                {member.readingSession.rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    {renderStars(member.readingSession.rating)}
                  </div>
                )}
              </div>
              {member.readingSession.review && member.readingSession.review.trim().length > 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight line-clamp-1 mt-0.5">
                  "{member.readingSession.review}"
                </p>
              )}
            </div>
          </div>
        ))}
        {membersWithReviews.length > 2 && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 pl-6">
            +{membersWithReviews.length - 2} more
          </div>
        )}
      </div>
    );
  }

  // Show progress for active books
  return (
    <div className="flex flex-col gap-2 mt-3">
      {book.members.map((member) => {
        return (
          <div key={member.id} className="flex items-center gap-3">
            <img
              src={member.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${member.name}`}
              alt={member.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 w-16">{member.name}</span>
            <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
                style={{ width: `${member.readingSession.normalizedPerc}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums w-20 text-right">
              p. {member.readingSession.normalizedPage}/{book.totalPages}
            </span>
          </div>
        );
      })}
    </div>
  );
}