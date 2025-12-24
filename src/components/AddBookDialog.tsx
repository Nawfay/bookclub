"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, BookPlus, Loader2, Book as BookIcon, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import pb from "@/lib/pocketbase";

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
}

interface AddBookDialogProps {
  trigger?: React.ReactNode;
  onBookAdded?: () => void;
}

export function AddBookDialog({ trigger, onBookAdded }: AddBookDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"api" | "custom" | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom book form state
  const [customTitle, setCustomTitle] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  const [customPages, setCustomPages] = useState("");
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsLoading(true);
        try {
          // Limit fields to keep payload small and mobile friendly
          const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(
              searchQuery
            )}&fields=key,title,author_name,cover_i,number_of_pages_median&limit=10`
          );
          const data = await response.json();
          setSearchResults(data.docs || []);
        } catch (error) {
          console.error("Failed to fetch books", error);
        } finally {
          setIsLoading(false);
        }
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setTimeout(() => {
        setSearchMode(null);
        setSearchQuery("");
        setSearchResults([]);
        setSelectedBook(null);
        setCustomTitle("");
        setCustomAuthor("");
        setCustomPages("");
        setCustomCoverUrl("");
        setCoverFile(null);
        setCoverPreview("");
        setIsSubmitting(false);
      }, 300);
    }
  };

  const handleAddSelectedBook = async () => {
    if (!selectedBook || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the book data for your PocketBase endpoint
      const bookData = {
        title: selectedBook.title,
        author: selectedBook.author_name?.[0] || "Unknown Author",
        pages: selectedBook.number_of_pages_median || 0,
        coverUrl: selectedBook.cover_i 
          ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg` 
          : ""
      };

      // Submit to your PocketBase endpoint
      const response = await fetch(`${pb.baseURL}/books/add/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth header if user is logged in
          ...(pb.authStore.token && {
            'Authorization': `Bearer ${pb.authStore.token}`
          })
        },
        body: JSON.stringify(bookData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add book: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Book added successfully:", result);
      
      // Close dialog and reset state
      handleOpenChange(false);
      
      // Trigger refresh callback
      onBookAdded?.();
      
    } catch (error) {
      console.error("Error adding book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomBook = async () => {
    if (!customTitle.trim() || !customAuthor.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for multipart form submission
      const formData = new FormData();
      formData.append('title', customTitle.trim());
      formData.append('author', customAuthor.trim());
      formData.append('pages', customPages || '0');
      formData.append('coverUrl', customCoverUrl.trim());
      
      // Add cover file if selected
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const response = await fetch(`${pb.baseURL}/books/add/manual`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          ...(pb.authStore.token && {
            'Authorization': `Bearer ${pb.authStore.token}`
          })
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to add book: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Custom book added successfully:", result);
      
      handleOpenChange(false);
      
      // Trigger refresh callback
      onBookAdded?.();
      
    } catch (error) {
      console.error("Error adding custom book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setCoverFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setCoverFile(null);
    setCoverPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm"
      className="h-8 text-xs gap-1.5 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
    >
      <Plus size={14} />
      Add Book
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[85vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg">Add Book</DialogTitle>
          <DialogDescription className="text-sm">
            {!searchMode ? "Choose how to add your book" : 
             searchMode === "api" ? "Search for books" : "Enter book details"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          {!searchMode ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3"
                onClick={() => setSearchMode("api")}
              >
                <Search size={16} />
                <div className="text-left">
                  <div className="font-medium text-sm">Search Books</div>
                  <div className="text-xs text-muted-foreground">Find from library</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3"
                onClick={() => setSearchMode("custom")}
              >
                <BookPlus size={16} />
                <div className="text-left">
                  <div className="font-medium text-sm">Add Custom</div>
                  <div className="text-xs text-muted-foreground">Enter manually</div>
                </div>
              </Button>
            </div>
          ) : searchMode === "api" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedBook(null);
                  }}
                  className="pl-9 h-10"
                  autoFocus
                />
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.slice(0, 6).map((book) => (
                    <div
                      key={book.key}
                      onClick={() => setSelectedBook(book)}
                      className={cn(
                        "flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedBook?.key === book.key 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="w-8 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {book.cover_i ? (
                          <img 
                            src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookIcon size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{book.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {book.author_name?.[0] || "Unknown Author"}
                        </div>
                        {book.number_of_pages_median && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {book.number_of_pages_median} pages
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchQuery.length > 2 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No books found
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    Type to search books
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Input 
                  placeholder="Book title" 
                  className="h-10" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              <div>
                <Input 
                  placeholder="Author" 
                  className="h-10" 
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Total pages" 
                  className="h-10" 
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                />
              </div>
              
              {/* Cover Image Section */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Cover Image</div>
                
                {/* File Upload Option */}
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!coverFile && !coverPreview ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-20 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Upload size={16} />
                        <span className="text-xs">Upload Cover</span>
                      </div>
                    </Button>
                  ) : (
                    <div className="relative">
                      <div className="w-full h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {coverPreview ? (
                          <img 
                            src={coverPreview} 
                            alt="Cover preview" 
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <BookIcon size={24} className="text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveFile}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* OR Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                {/* URL Input */}
                <Input 
                  placeholder="Cover image URL" 
                  className="h-10" 
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            {searchMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchMode(null);
                    setSearchResults([]);
                    setSearchQuery("");
                    setSelectedBook(null);
                    setCustomTitle("");
                    setCustomAuthor("");
                    setCustomPages("");
                    setCustomCoverUrl("");
                    setCoverFile(null);
                    setCoverPreview("");
                  }}
                >
                  Back
                </Button>
                <Button 
                  size="sm" 
                  disabled={searchMode === "api" ? !selectedBook || isSubmitting : !customTitle.trim() || !customAuthor.trim() || isSubmitting}
                  onClick={searchMode === "api" ? handleAddSelectedBook : handleAddCustomBook}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Adding...
                    </>
                  ) : (
                    "Add Book"
                  )}
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="ml-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}