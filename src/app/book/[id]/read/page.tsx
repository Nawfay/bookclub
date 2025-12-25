"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchBookById, Book } from "@/lib/data2";
import { fetchBookContent, BookContent } from "@/lib/read";
import { ArrowLeft, Book as BookIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the current page from URL, default to 1
  const pageParam = searchParams.get("page") || "1";
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  
  // Debug: log the page parsing
  console.log('Page param:', pageParam, 'Current page:', currentPage);

  // State for book data
  const [book, setBook] = useState<Book | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  
  // State for content
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // Fetch book data
  useEffect(() => {
    async function loadBook() {
      try {
        const bookData = await fetchBookById(id);
        if (bookData) {
          setBook(bookData);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching book:", error);
        notFound();
      } finally {
        setBookLoading(false);
      }
    }
    
    loadBook();
  }, [id]);

  // Fetch book content for current page
  useEffect(() => {
    async function loadContent() {
      if (!book) return;
      
      setContentLoading(true);
      setContentError(null);
      
      try {
        const content = await fetchBookContent(id, currentPage);
        if (content) {
          setBookContent(content);
        } else {
          setContentError("Failed to load page content");
        }
      } catch (error) {
        console.error("Error fetching book content:", error);
        setContentError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setContentLoading(false);
      }
    }
    
    loadContent();
  }, [id, currentPage, book]);

  if (bookLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading book...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!book) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <main className="max-w-2xl mx-auto px-6 sm:px-4 py-16 min-h-screen flex flex-col">
          <Header variant="book" bookTitle={book.title} />

          <Link
            href={`/book/${id}`}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to book details
          </Link>

          {/* Book Header Info */}
          <div className="mb-10">
            <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-1">{book.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{book.author}</p>
          </div>

          {/* Content Section */}
          <section className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookIcon size={14} className="text-zinc-400 dark:text-zinc-500" />
                <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
                  Page {currentPage}
                </h2>
              </div>
            </div>

            <div className="prose prose-sm max-w-none min-h-[300px]">
              {contentLoading ? (
                // Loading Skeleton
                <div className="space-y-4 animate-pulse mt-8">
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-[95%]"></div>
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-[98%]"></div>
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-[90%]"></div>
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-[60%]"></div>
                  <br />
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-[85%]"></div>
                </div>
              ) : contentError ? (
                // Error State
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Could not load page content</p>
                    <p className="opacity-80 mt-1">{contentError}</p>
                  </div>
                </div>
              ) : bookContent && bookContent.content.length > 0 ? (
                // Actual Content 
                bookContent.content.map((paragraph, index) => (
                  <p key={index} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))
              ) : (
                // Empty State
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                    No text found on this page.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Pagination Controls */}
          <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Link
              href={`/book/${id}/read?page=${Math.max(1, currentPage - 1)}`}
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                currentPage <= 1 
                  ? "text-zinc-300 dark:text-zinc-600 pointer-events-none" 
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </Link>

            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              Page {currentPage}
            </span>

            <Link
              href={`/book/${id}/read?page=${currentPage + 1}`}
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                bookContent?.totalPages && currentPage >= bookContent.totalPages
                  ? "text-zinc-300 dark:text-zinc-600 pointer-events-none"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </Link>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}