"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBook } from "@/lib/data";
import { fetchFilesByBookId, BookFile } from "@/lib/data2";
import { ArrowLeft, Book, Star, Edit, X } from "lucide-react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";

const bookContent: { [key: string]: string[] } = {
  "1": [
    "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'",
    "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me.",
    "The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.",
    "...[Book text continues]...",
    "Her voice is full of money, he said suddenly. That was it. I'd never understood before. It was full of money—that was the inexhaustible charm that rose and fell in it, the jingle of it, the cymbals' song of it.",
    "...[Book text continues]...",
    "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther... And one fine morning—",
  ],
};

export default function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note");
  const book = getBook(id);
  const highlightRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // New state for fetched files (not integrated yet)
  const [fetchedFiles, setFetchedFiles] = useState<BookFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);

  // Fetch files from PocketBase
  useEffect(() => {
    async function loadFiles() {
      try {
        const filesData = await fetchFilesByBookId(id);
        setFetchedFiles(filesData);
        
        // Log the fetched files for debugging (remove later)
        console.log('Fetched files for reading:', filesData);
        
      } catch (error) {
        console.error("Failed to fetch files:", error);
      } finally {
        setFilesLoading(false);
      }
    }
    
    loadFiles();
  }, [id]);

  if (!book) {
    notFound();
  }

  const content = bookContent[id] || [];
  const currentUser = book.members[0];
  const currentUserReview = book.ratings.find(r => r.memberId === currentUser.id);

  useEffect(() => {
    if (noteId && highlightRefs.current[noteId]) {
      setTimeout(() => {
        highlightRefs.current[noteId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setActiveNoteId(noteId);
      }, 100);
    }
  }, [noteId]);

  const openReviewDialog = () => {
    if (currentUserReview) {
      setReviewRating(currentUserReview.rating);
      setReviewText(currentUserReview.review || "");
    }
    setShowReviewDialog(true);
  };

  const handleSaveReview = () => {
    if (reviewRating === 0) return;
    
    setIsUpdating(true);
    setTimeout(() => {
      const existingIndex = book.ratings.findIndex(r => r.memberId === currentUser.id);
      const review = {
        memberId: currentUser.id,
        memberName: currentUser.name,
        rating: reviewRating,
        review: reviewText || undefined,
      };
      
      if (existingIndex >= 0) {
        book.ratings[existingIndex] = review;
      } else {
        book.ratings.push(review);
      }
      
      setShowReviewDialog(false);
      setIsUpdating(false);
      setReviewRating(0);
      setReviewText("");
      window.location.reload();
    }, 500);
  };

  const renderTextWithHighlights = (text: string, paragraphIndex: number) => {
    let lastIndex = 0;
    const segments: React.ReactElement[] = [];
    let segmentKey = 0;

    book.notes.forEach((note) => {
      const index = text.indexOf(note.highlightedText);
      if (index !== -1) {
        if (index > lastIndex) {
          segments.push(
            <span key={`text-${paragraphIndex}-${segmentKey++}`}>
              {text.slice(lastIndex, index)}
            </span>
          );
        }

        const isHighlighted = noteId === note.id;
        const isActive = activeNoteId === note.id;
        
        segments.push(
          <span key={`highlight-${note.id}`}>
            <span
              ref={(el) => {
                highlightRefs.current[note.id] = el;
              }}
              onClick={() => setActiveNoteId(isActive ? null : note.id)}
              className={`cursor-pointer transition-all rounded px-0.5 ${
                isHighlighted
                  ? "bg-yellow-300 dark:bg-yellow-400 font-medium"
                  : "bg-yellow-100 dark:bg-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-300"
              }`}
            >
              {note.highlightedText}
            </span>
            {isActive && (
              <span className="inline-block ml-2 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg my-2 max-w-md">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
                    {note.memberName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {note.memberName}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{note.createdAt}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{note.content}</p>
                  </div>
                </div>
              </span>
            )}
          </span>
        );

        lastIndex = index + note.highlightedText.length;
      }
    });

    if (lastIndex < text.length) {
      segments.push(
        <span key={`text-${paragraphIndex}-${segmentKey}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return segments.length > 0 ? segments : text;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <main className="max-w-2xl mx-auto px-6 sm:px-4 py-16 min-h-screen">
        <Header variant="book" bookTitle={book.title} />

        <Link
          href={`/book/${id}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to book details
        </Link>

        <div className="mb-10">
          <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-1">{book.title}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{book.author}</p>
        </div>

        {currentUserReview && (
          <section className="mb-10 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs text-zinc-400 uppercase tracking-wide">Your Review</h3>
              <button
                onClick={openReviewDialog}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <Edit size={12} />
                Edit
              </button>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= currentUserReview.rating ? "fill-zinc-900 dark:fill-zinc-100 text-zinc-900 dark:text-zinc-100" : "text-zinc-300 dark:text-zinc-600"}
                />
              ))}
            </div>
            {currentUserReview.review && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{currentUserReview.review}</p>
            )}
          </section>
        )}

        {!currentUserReview && (
          <div className="mb-10">
            <button
              onClick={openReviewDialog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            >
              <Edit size={12} />
              Add Review
            </button>
          </div>
        )}

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Book size={14} className="text-zinc-400 dark:text-zinc-500" />
            <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
              Reading ({book.notes.length} notes)
            </h2>
          </div>

          <div className="prose prose-sm max-w-none">
            {content.length > 0 ? (
              content.map((paragraph, index) => (
                <p key={index} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                  {renderTextWithHighlights(paragraph, index)}
                </p>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                Book content not available for this title.
              </p>
            )}
          </div>
        </section>

        {showReviewDialog && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={() => setShowReviewDialog(false)}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {currentUserReview ? "Edit Review" : "Add Review"}
                </h3>
                <button onClick={() => setShowReviewDialog(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <X size={18} />
                </button>
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
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 resize-none"
                />
              </div>

              <button
                onClick={handleSaveReview}
                disabled={isUpdating || reviewRating === 0}
                className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Review"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}