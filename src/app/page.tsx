"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchBooks, Book } from "@/lib/data2";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation, BookCard, GlobalStats, Footer, SearchBooks } from "@/components/home";

function HomeContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "reading";
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadBooks = async () => {
    try {
      const fetchedBooks = await fetchBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    }
  };
  
  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      await loadBooks();
      setLoading(false);
    }
    
    initialLoad();
  }, []);
  
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-zinc-950">
          <main className="max-w-xl mx-auto px-6 sm:px-4 py-16">
            <Header variant="main" onBookAdded={loadBooks} />
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-500 dark:text-zinc-400">Loading books...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }
  
  const currentlyReading = books.filter((b: Book) => b.status === "reading");
  const completed = books.filter((b: Book) => b.status === "completed" || b.status === "dropped");
  const planned = books.filter((b: Book) => b.status === "planned" );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <main className="max-w-xl mx-auto px-6 sm:px-4 py-16">
          <Header variant="main" onBookAdded={loadBooks} />
          <Navigation activeTab={filter} />

          {filter === "search" && <SearchBooks books={books} />}

          {filter === "reading" && (
            <section className="mb-8">
              <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide mb-4">Currently Reading</h2>
              <div className="flex flex-col">
                {currentlyReading.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {filter === "completed" && completed.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide mb-4">Completed</h2>
              <div className="flex flex-col">
                {completed.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {filter === "upcoming" && planned.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide mb-4">Up Next</h2>
              <div className="flex flex-col">
                {planned.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {filter === "stats" && <GlobalStats books={books} />}

          <Footer books={books} />
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-zinc-950">
          <main className="max-w-xl mx-auto px-6 sm:px-4 py-16">
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    }>
      <HomeContent />
    </Suspense>
  );
}
