"use client";

import { use, useState, useEffect } from "react";
import { fetchBookById, Book as NewBook, isBookUninitialized } from "@/lib/data2";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { BookHero } from "@/components/book/BookHero";
import { BookNavigation } from "@/components/book/BookNavigation";
import { BookSession } from "@/components/book/BookSession";
import { BookFiles } from "@/components/book/BookFiles";
import { RatingsSection } from "@/components/book/RatingsSection";
import { MemberProgress } from "@/components/book/MemberProgress";
import { NotesSection } from "@/components/book/NotesSection";
import { PageUpdateDialog } from "@/components/book/dialog/PageUpdateDialog";
import { StatusUpdateDialog } from "@/components/book/dialog/StatusUpdateDialog";
import { InitializeBook } from "@/components/book/InitializeBook";
import { BookFooter } from "@/components/book/BookFooter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getCurrentUser, canViewAdmin } from "@/lib/auth";

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // const book = getBook(id);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  // New state for fetched data (not integrated yet)
  const [fetchedBook, setFetchedBook] = useState<NewBook | null>(null);
  const [loading, setLoading] = useState(true);


  const authUser = getCurrentUser();

  // Early return if no authenticated user
  if (!authUser) {
    notFound();
  }

  // Fetch data from PocketBase
  useEffect(() => {
    async function loadBookData() {
      try {
        console.log("Fetching book data for ID:", id);
        const bookData = await fetchBookById(id);
        setFetchedBook(bookData);
        
        // Log the fetched data for debugging 
        console.log('Fetched book:', bookData);
        
      } catch (error) {
        console.error("Failed to fetch book data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadBookData();
  }, [id]);

  // Check if book needs initialization and user is admin
  const needsInitialization = fetchedBook && isBookUninitialized(fetchedBook);
  const isAdmin = canViewAdmin();

  // Reload book data after initialization
  const handleBookInitialized = async () => {
    setLoading(true);
    try {
      const bookData = await fetchBookById(id);
      setFetchedBook(bookData);
    } catch (error) {
      console.error("Failed to reload book data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching new data
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-zinc-950">
          <main className="max-w-xl mx-auto px-6 sm:px-4 py-16">
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-500 dark:text-zinc-400">Loading book details...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Don't render if fetchedBook is null
  if (!fetchedBook) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-zinc-950">
          <main className="max-w-xl mx-auto px-6 sm:px-4 py-16">
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-500 dark:text-zinc-400">Book not found.</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <main className="max-w-xl mx-auto px-6 sm:px-4 py-16 min-h-screen">
          <Header variant="book" bookTitle={fetchedBook.title} />

          <BookNavigation 
            onUpdatePage={() => setShowUpdateDialog(true)} 
            onUpdateStatus={() => setShowStatusDialog(true)}
          />

          <BookHero book={fetchedBook} />

          {/* Show InitializeBook component if book needs initialization and user is admin */}
          {(needsInitialization && isAdmin)  && (
            <div className="mb-8">
              <InitializeBook 
                book={{
                  id: fetchedBook.id,
                  title: fetchedBook.title,
                  author: fetchedBook.author,
                  totalPages: fetchedBook.totalPages,
                  cover: fetchedBook.cover
                }}
                onInitialized={handleBookInitialized}
              />
            </div>
          )}

          <BookSession book={fetchedBook} currentUserId={authUser.id} />

          <BookFiles bookId={id} isInitializated={!!needsInitialization}/>

          <RatingsSection book={fetchedBook} currentUserId={authUser.id} bookId={id} />

          <MemberProgress book={fetchedBook} />

          <NotesSection bookId={id} book={fetchedBook} />

          <BookFooter bookId={fetchedBook.id} bookTitle={fetchedBook.title} />

          <PageUpdateDialog
            isOpen={showUpdateDialog}
            onClose={() => setShowUpdateDialog(false)}
            book={fetchedBook}
            currentUserId={authUser.id}
          />

          <StatusUpdateDialog
            isOpen={showStatusDialog}
            onClose={() => setShowStatusDialog(false)}
            book={fetchedBook}
            currentUserId={authUser.id}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}