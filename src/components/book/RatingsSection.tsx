"use client";

import { useState, useEffect } from "react";
import { Star, Edit, X } from "lucide-react";
import { Book as NewBook, updateReaderReview } from "@/lib/data2";

interface RatingsSectionProps {
  book: NewBook | null;
  currentUserId: string;
  bookId: string;
}

export function RatingsSection({ book, currentUserId, bookId }: RatingsSectionProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Review dialog state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState<'active' | 'completed' | 'dropped'>('completed');

  // Handle null case
  if (!book) return null
  if (book.status !== "completed" && book.status !== "dropped") return null;

  // Get members who have rated the book
  const ratedMembers = book.members.filter(member => member.readingSession.rating > 0);
  
  // Calculate average rating
  const avgRating = ratedMembers.length > 0
    ? ratedMembers.reduce((acc, member) => acc + member.readingSession.rating, 0) / ratedMembers.length
    : 0;

  // Find current user's review
  const currentUserMember = book.members.find(m => m.id === currentUserId);
  const hasCurrentUserReview = currentUserMember && currentUserMember.readingSession.rating > 0;

  // Initialize dialog with existing review data
  useEffect(() => {
    if (showReviewDialog && hasCurrentUserReview && currentUserMember) {
      setReviewRating(currentUserMember.readingSession.rating);
      setReviewText(currentUserMember.readingSession.review || "");
      setReviewStatus(currentUserMember.readingSession.status || 'completed');
    } else if (showReviewDialog) {
      setReviewRating(0);
      setReviewText("");
      setReviewStatus('completed');
    }
  }, [showReviewDialog, hasCurrentUserReview, currentUserMember]);

  const handleSaveReview = async () => {
    if (reviewRating === 0) return;
    
    setSaving(true);
    
    try {
      // Save to PocketBase
      const success = await updateReaderReview(bookId, currentUserId, reviewRating, reviewText, reviewStatus);
      
      if (success) {
        // Update local state optimistically
        if (currentUserMember) {
          currentUserMember.readingSession.rating = reviewRating;
          currentUserMember.readingSession.review = reviewText;
          currentUserMember.readingSession.status = reviewStatus;
        }
        
        setShowReviewDialog(false);
        setReviewRating(0);
        setReviewText("");
        setReviewStatus('completed');
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        console.error('Failed to save review');
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error saving review:', error);
      // TODO: Show error message to user
    } finally {
      setSaving(false);
    }
  };

  const closeDialog = () => {
    setShowReviewDialog(false);
    setReviewRating(0);
    setReviewText("");
    setReviewStatus('completed');
  };

  return (
    <>
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-zinc-400 dark:text-zinc-500" />
            <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
              {ratedMembers.length > 0 ? `Ratings (${avgRating.toFixed(1)}/5)` : "Ratings"}
            </h2>
          </div>
          <button
            onClick={() => setShowReviewDialog(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
          >
            <Edit size={12} />
            {saving ? "Saving..." : hasCurrentUserReview ? "Edit Review" : "Add Review"}
          </button>
        </div>
        
        {ratedMembers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {ratedMembers.map((member) => (
              <div key={member.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{member.name}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < member.readingSession.rating ? "fill-zinc-900 dark:fill-zinc-100 text-zinc-900 dark:text-zinc-100" : "text-zinc-300 dark:text-zinc-600"}
                        />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      member.readingSession.status === 'dropped'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {member.readingSession.status}
                    </span>
                  </div>
                  {member.readingSession.review && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{member.readingSession.review}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4">No ratings yet. Be the first to review!</p>
        )}
      </section>

      {/* Integrated Review Dialog */}
      {showReviewDialog && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={closeDialog}>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {hasCurrentUserReview ? "Edit Review" : "Add Review"}
              </h3>
              <button onClick={closeDialog} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
              <div className="flex gap-2">
                {(['completed', 'active', 'dropped'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setReviewStatus(status)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      reviewStatus === status
                        ? status === 'dropped'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      className={star <= reviewRating ? "fill-zinc-900 dark:fill-zinc-100 text-zinc-900 dark:text-zinc-100" : "text-zinc-300 dark:text-zinc-600"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Review (optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <button
              onClick={handleSaveReview}
              disabled={saving || reviewRating === 0}
              className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}