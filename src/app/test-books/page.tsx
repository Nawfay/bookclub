'use client';

import { useEffect, useState } from 'react';
import { fetchBooks, Book, fetchFilesByBookId, BookFile, fetchBookById } from '@/lib/data2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, BookOpen, User, Calendar, Search } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TestBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for fetchBookById testing
  const [bookId, setBookId] = useState('');
  const [singleBook, setSingleBook] = useState<Book | null>(null);
  const [singleBookLoading, setSingleBookLoading] = useState(false);
  const [singleBookError, setSingleBookError] = useState<string | null>(null);

  // New state for fetchFilesByBookId testing
  const [filesBookId, setFilesBookId] = useState('');
  const [bookFiles, setBookFiles] = useState<BookFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedBooks = await fetchBooks();
        setBooks(fetchedBooks);
        console.log('Fetched books:', fetchedBooks);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Function to test fetchBookById
  const testFetchBookById = async () => {
    if (!bookId.trim()) {
      setSingleBookError('Please enter a book ID');
      return;
    }

    try {
      setSingleBookLoading(true);
      setSingleBookError(null);
      setSingleBook(null);
      
      const fetchedBook = await fetchBookById(bookId.trim());
      setSingleBook(fetchedBook);
      console.log('Fetched single book:', fetchedBook);
      
      if (!fetchedBook) {
        setSingleBookError('Book not found');
      }
    } catch (err) {
      console.error('Error fetching single book:', err);
      setSingleBookError(err instanceof Error ? err.message : 'Failed to fetch book');
    } finally {
      setSingleBookLoading(false);
    }
  };

  // Function to test fetchFilesByBookId
  const testFetchFilesByBookId = async () => {
    if (!filesBookId.trim()) {
      setFilesError('Please enter a book ID');
      return;
    }

    try {
      setFilesLoading(true);
      setFilesError(null);
      setBookFiles([]);
      
      const fetchedFiles = await fetchFilesByBookId(filesBookId.trim());
      setBookFiles(fetchedFiles);
      console.log('Fetched book files:', fetchedFiles);
      
      if (fetchedFiles.length === 0) {
        setFilesError('No files found for this book');
      }
    } catch (err) {
      console.error('Error fetching book files:', err);
      setFilesError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setFilesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Books Test Page</h1>
          <p className="text-gray-600">
            Found {books.length} book{books.length !== 1 ? 's' : ''} in PocketBase
          </p>
        </div>

        {/* Test fetchBookById Section */}
        <Card className="mb-8 text-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Test fetchBookById Function
            </CardTitle>
            <CardDescription>
              Enter a book ID to test the fetchBookById function. You can copy an ID from the books below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter book ID (e.g., from the list below)"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && testFetchBookById()}
              />
              <Button 
                onClick={testFetchBookById}
                disabled={singleBookLoading}
              >
                {singleBookLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Fetch Book'
                )}
              </Button>
            </div>

            {singleBookError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{singleBookError}</p>
              </div>
            )}

            {singleBook && (
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-lg mb-2">Fetched Book Result:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Book Details:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>ID:</strong> {singleBook.id}</p>
                      <p><strong>Title:</strong> {singleBook.title}</p>
                      <p><strong>Author:</strong> {singleBook.author}</p>
                      <p><strong>Total Pages:</strong> {singleBook.totalPages}</p>
                      <p><strong>Status:</strong> <Badge variant="outline">{singleBook.status}</Badge></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Book Session:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Session ID:</strong> {singleBook.bookSession.id}</p>
                      <p><strong>Status:</strong> {singleBook.bookSession.status}</p>
                      <p><strong>Current Page:</strong> {singleBook.bookSession.currentPage}</p>
                      <p><strong>Target Page:</strong> {singleBook.bookSession.targetPage}</p>
                      <p><strong>Chapter:</strong> {singleBook.bookSession.chapter}</p>
                      <p><strong>Members:</strong> {singleBook.members.length}</p>
                    </div>
                  </div>
                </div>
                
                {singleBook.members.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Members:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {singleBook.members.map((member) => (
                        <div key={member.id} className="p-2 bg-gray-50 rounded text-sm">
                          <p><strong>{member.name}</strong></p>
                          <p>Page: {member.readingSession.currentPage}</p>
                          <p>Progress: {member.readingSession.normalizedPerc.toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-sm">Raw JSON Data</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(singleBook, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test fetchFilesByBookId Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Test fetchFilesByBookId Function
            </CardTitle>
            <CardDescription>
              Enter a book ID to test the fetchFilesByBookId function and see all files associated with that book.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter book ID to fetch files"
                value={filesBookId}
                onChange={(e) => setFilesBookId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && testFetchFilesByBookId()}
              />
              <Button 
                onClick={testFetchFilesByBookId}
                disabled={filesLoading}
              >
                {filesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Fetch Files'
                )}
              </Button>
            </div>

            {filesError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{filesError}</p>
              </div>
            )}

            {bookFiles.length > 0 && (
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-lg mb-4">
                  Found {bookFiles.length} file{bookFiles.length !== 1 ? 's' : ''} for this book:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{file.fileType}</Badge>
                          <span className="text-xs text-gray-500">{file.fileSize}</span>
                        </div>
                        
                        <h4 className="font-medium text-sm truncate" title={file.fileName}>
                          {file.fileName}
                        </h4>
                        
                        <div className="text-xs text-gray-500">
                          <p>ID: {file.id}</p>
                          <p>Created: {new Date(file.created).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(file.url, '_blank')}
                            className="flex-1"
                          >
                            View File
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(file.url)}
                            className="px-2"
                          >
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-sm">Raw Files JSON Data</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(bookFiles, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        {books.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No books found in the database</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">All Books (fetchBooks function)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-200 relative">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>by {book.author}</CardDescription>
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 p-1 rounded">
                      ID: {book.id}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={book.status === 'reading' ? 'default' : 'secondary'}>
                        {book.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{book.totalPages} pages</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Book Session:</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Current Page:</span>
                          <span>{book.bookSession.currentPage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Page:</span>
                          <span>{book.bookSession.targetPage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chapter:</span>
                          <span>{book.bookSession.chapter || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span>{book.bookSession.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{book.members.length} member{book.members.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Est. End: {new Date(book.bookSession.estimatedEndDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mb-2"
                      onClick={() => setBookId(book.id)}
                    >
                      Use this ID for fetchBookById test
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setFilesBookId(book.id)}
                    >
                      Use this ID for fetchFiles test
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Raw JSON Data for debugging */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Raw JSON Data (for debugging)</CardTitle>
              <CardDescription>
                This shows the actual data structure returned from PocketBase
              </CardDescription>    
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs text-gray-600">
                {JSON.stringify(books, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}