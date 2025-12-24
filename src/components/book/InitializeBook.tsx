"use client";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import pb from "@/lib/pocketbase";
import { uploadFileToBook } from "@/lib/data2";
import { canViewSuper } from "@/lib/auth";

interface InitializeBookProps {
  book: {
    id: string;
    title: string;
    author: string;
    totalPages: number;
    cover: string;
  };
  onInitialized?: () => void;
}

export function InitializeBook({ book, onInitialized }: InitializeBookProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  
  // Editable book details
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [totalPages, setTotalPages] = useState(book.totalPages.toString());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSuperUser = canViewSuper();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setError("");
    }
  };

  const handleInitialize = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    if (!title.trim() || !author.trim()) {
      setError("Title and author are required");
      return;
    }

    setIsUploading(true);
    setError("");
    
    try {
      // 1. Update book details if they were changed
      const bookUpdates: any = {};
      if (title.trim() !== book.title) bookUpdates.title = title.trim();
      if (author.trim() !== book.author) bookUpdates.author = author.trim();
      if (parseInt(totalPages) !== book.totalPages) bookUpdates.totalPages = parseInt(totalPages) || 0;
      
      if (Object.keys(bookUpdates).length > 0) {
        await pb.collection('books').update(book.id, bookUpdates);
      }

      // 2. Upload the PDF file
      const uploadedFile = await uploadFileToBook(book.id, selectedFile, 'PDF', true);
      
      if (!uploadedFile) {
        throw new Error('Failed to upload PDF file');
      }

      // 3. Create or update book session to mark as initialized
      // Check if a real book session exists
      const existingSessions = await pb.collection('book_sessions').getFullList({
        filter: `book = "${book.id}"`
      });

      if (existingSessions.length > 0) {
        // Update existing session
        await pb.collection('book_sessions').update(existingSessions[0].id, {
          status: 'active'
        });
      } else {
        // Create new session
        await pb.collection('book_sessions').create({
          book: book.id,
          status: 'active',
          currentPage: 0,
          targetPage: parseInt(totalPages) || book.totalPages,
          readingPacePerDay: 0,
          estimatedEndDate: new Date().toISOString()
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onInitialized?.();
      }, 1500);

    } catch (error: any) {
      console.error('Error initializing book:', error);
      setError(error.message || 'Failed to initialize book');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8">
      {success ? (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Book Initialized Successfully</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                The book is now ready for reading sessions.
              </p>
            </div>
          </div>
        </div>
      ) : !isSuperUser ? (
        // Admin users can see the book needs setup but cannot initialize it
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Setup Required</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This book needs to be initialized before reading sessions can begin. Only super users can complete the setup process.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Setup Required</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Complete the setup to enable reading sessions for this book.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Book Details Review */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Book title"
                className="text-sm bg-white dark:bg-zinc-800"
              />
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="text-sm bg-white dark:bg-zinc-800"
              />
              <Input
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="Pages"
                className="text-sm bg-white dark:bg-zinc-800"
              />
            </div>

            {/* PDF Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!selectedFile ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-20 border-dashed border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    <div className="text-center">
                      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upload PDF</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Select the book's PDF file
                      </div>
                    </div>
                  </div>
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
                  <FileText className="h-5 w-5 text-red-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedFile.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={isUploading}
                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="border border-red-200 dark:border-red-800 rounded p-3 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Initialize Button */}
            <Button
              onClick={handleInitialize}
              disabled={!selectedFile || isUploading || !title.trim() || !author.trim()}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initializing...
                </>
              ) : (
                "Initialize Book"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}