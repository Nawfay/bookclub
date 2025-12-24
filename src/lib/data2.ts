import pb from "./pocketbase"
import { normalizeData } from "@/lib/utils"

export interface ReadingSession {
  currentPage: number;
  bookTotalPages: number;
  readingPace: number;
  rating: number;
  review: string;
  normalizedPage: number;
  normalizedPerc: number;
  status: 'active' | 'completed' | 'dropped';
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  readingSession: ReadingSession;
}

export type SessionStatus = 'active' | 'completed' | 'dropped' | 'planned' | 'uninitialized';

export interface BookSession {
  id: string;
  status: SessionStatus | string;
  currentPage: number;
  targetPage: number;
  readingPacePerDay: number;
  estimatedEndDate: string; // ISO Date string
}

// You can use a Union type for status if you have a fixed set of states
export type BookStatus = 'reading' | 'completed' | 'to-read'; 

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  totalPages: number;
  bookSession: BookSession;
  status: BookStatus | string; // Keeping string allows flexibility if you haven't finalized statuses
  members: Member[];
}



export async function fetchBooks(): Promise<Book[]> {
  try {
    // 1. Fetch all 3 collections in parallel to speed up load time
    const [booksRecords, bookSessionsRecords, readersSessionsRecords] = await Promise.all([
      pb.collection('books').getFullList({ sort: '-created' }),
      pb.collection('book_sessions').getFullList(),
      // We expand 'user' here to get the member's name and avatar for the UI
      pb.collection('readers_sessions').getFullList({ expand: 'user' }), 
    ]);

    // 2. Create Lookup Maps
    // This makes finding the matching session for a book instant, rather than looping every time.
    
    // Map: Book ID -> The Club's Official Session (Schedule)
    const bookSessionMap = new Map<string, any>();
    bookSessionsRecords.forEach(session => {
        bookSessionMap.set(session.book, session);
    });

    // Map: Book ID -> List of User Sessions (Members)
    const readersMap = new Map<string, any[]>();
    readersSessionsRecords.forEach(session => {
        const bookId = session.book;
        if (!readersMap.has(bookId)) {
            readersMap.set(bookId, []);
        }
        readersMap.get(bookId)?.push(session);
    });

    // 3. Build the Final Book Objects
    const books: Book[] = booksRecords.map((record) => {
      // A. Handle Cover Image - use coverImageUrl if exists, otherwise use PocketBase file
      const cover = record.coverImageUrl || 
        (record.cover ? pb.files.getURL(record, record.cover) : ""); 

      // B. Handle Book Session (The Schedule)
      const sessionRecord = bookSessionMap.get(record.id);
      
      // If a session exists in DB, use it. Otherwise, create a default "planned" one.
      const bookSession: BookSession = sessionRecord ? {
          id: sessionRecord.id,
          status: (sessionRecord.status as SessionStatus) || 'active',
          currentPage: sessionRecord.currentPage,
          targetPage: sessionRecord.targetPage,
          readingPacePerDay: sessionRecord.readingPacePerDay,
          estimatedEndDate: sessionRecord.estimatedEndDate,
      } : {
          // Default fallback if no session exists yet
          id: `temp-${record.id}`, 
          status: 'uninitialized',
          currentPage: 0,
          targetPage: record.totalPages,
          readingPacePerDay: 0,
          estimatedEndDate: new Date().toISOString(),
      };

      // C. Handle Members (The Readers)
      const relatedReaders = readersMap.get(record.id) || [];
      
      const members: Member[] = relatedReaders.map(readerRecord => {
          const user = readerRecord.expand?.user; // Safe navigation in case user is deleted
          const normalizedData = normalizeData(
            readerRecord.currentPage || 0,
            readerRecord.bookTotalPages || record.totalPages,
            record.totalPages
          );
          return {
              id: user?.id || readerRecord.id,
              name: user?.name || user?.username || "Unknown Member",
              avatar: user?.avatar ? pb.files.getURL(user, user.avatar) : "",
              readingSession: {
                  currentPage: readerRecord.currentPage,
                  bookTotalPages: readerRecord.bookTotalPages || record.totalPages,
                  readingPace: readerRecord.readingPace,
                  rating: readerRecord.rating,
                  review: readerRecord.review,
                  normalizedPage: normalizedData.realPage,
                  normalizedPerc: parseFloat(normalizedData.percentage),
                  status: readerRecord.status || 'active',
              }
          };
      });

      return {
        id: record.id,
        title: record.title,
        author: record.author,
        cover: cover, 
        totalPages: record.totalPages,
        status: (record.status as BookStatus) || 'to-read',
        bookSession: bookSession,
        members: members,
      };
    });

    return books;

  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}


export async function fetchBookById(bookId: string): Promise<Book | null> {
  try {
    // 1. Fetch the specific book and related data in parallel
    const [bookRecord, bookSessionsRecords, readersSessionsRecords] = await Promise.all([
      pb.collection('books').getOne(bookId),
      pb.collection('book_sessions').getFullList({ filter: `book = "${bookId}"` }),
      pb.collection('readers_sessions').getFullList({ 
        filter: `book = "${bookId}"`,
        expand: 'user' 
      }),
    ]);

    // 2. Handle Book Session (The Schedule)
    const sessionRecord = bookSessionsRecords[0]; // Should only be one session per book
    const bookSession: BookSession = sessionRecord ? {
      id: sessionRecord.id,
      status: (sessionRecord.status as SessionStatus) || 'active',
      currentPage: sessionRecord.currentPage,
      targetPage: sessionRecord.targetPage,
      readingPacePerDay: sessionRecord.readingPacePerDay,
      estimatedEndDate: sessionRecord.estimatedEndDate,
    } : {
      // Default fallback if no session exists yet
      id: `temp-${bookRecord.id}`, 
      status: 'uninitialized',
      currentPage: 0,
      targetPage: bookRecord.totalPages,
      readingPacePerDay: 0,
      estimatedEndDate: new Date().toISOString(),
    };

    // 3. Handle Members (The Readers)
    const members: Member[] = readersSessionsRecords.map(readerRecord => {
      const user = readerRecord.expand?.user; // Safe navigation in case user is deleted
      const normalizedData = normalizeData(
        readerRecord.currentPage || 0,
        readerRecord.bookTotalPages || bookRecord.totalPages,
        bookRecord.totalPages
      );

      return {
        id: user?.id || readerRecord.id,
        name: user?.name || user?.username || "Unknown Member",
        avatar: user?.avatar ? pb.files.getURL(user, user.avatar) : "",
        readingSession: {
          currentPage: readerRecord.currentPage,
          bookTotalPages: readerRecord.bookTotalPages || bookRecord.totalPages,
          readingPace: readerRecord.readingPace,
          rating: readerRecord.rating,
          review: readerRecord.review,
          normalizedPage: normalizedData.realPage,
          normalizedPerc: parseFloat(normalizedData.percentage.replace('%', '')),
          status: readerRecord.status || 'active',
        }
      };
    });

    // 4. Build the Final Book Object
    const book: Book = {
      id: bookRecord.id,
      title: bookRecord.title,
      author: bookRecord.author,
      cover: bookRecord.coverImageUrl || 
        (bookRecord.cover ? pb.files.getURL(bookRecord, bookRecord.cover) : ""), 
      totalPages: bookRecord.totalPages,
      status: (bookRecord.status as BookStatus) || 'to-read',
      bookSession: bookSession,
      members: members,
    };

    return book;
  } catch (error) {
    console.error(`Error fetching book with ID ${bookId}:`, error);
    return null;
  }
}

// Define the Interface based on your 'files' collection columns
export interface BookFile {
  id: string;
  fileType: string; // from 'filetype' column
  fileSize: string; // from 'filesize' column
  fileName: string; // the actual filename from 'file' column
  url: string;      // generated URL for downloading/viewing
  primaryFile: boolean;
  created: string;
}

// The Fetch Function
export async function fetchFilesByBookId(bookId: string): Promise<BookFile[]> {
  try {
    // Fetch all files associated with this specific book
    // We use a filter to match the 'book' relation field
    const records = await pb.collection('files').getFullList({
      filter: `book="${bookId}"`,
      sort: '-created', // Optional: newest files first
    });

    // Map the raw PocketBase records to our clean interface
    return records.map((record) => ({
      id: record.id,
      fileType: record.filetype,
      fileSize: record.filesize,
      fileName: record.filename,
      // IMPORTANT: Generate the full URL so the frontend can actually access the file
      url: pb.files.getURL(record, record.filename),
      primaryFile: record.primaryFile,
      created: record.created,
    }));

  } catch (error) {
    console.error(`Error fetching files for book ${bookId}:`, error);
    return [];
  }
}

export async function uploadFileToBook(bookId: string, file: File, fileType?: string, primaryFile?: boolean): Promise<BookFile | null> {
  try {
    const formData = new FormData();
    formData.append('book', bookId);
    formData.append('filename', file);
    formData.append('filetype', fileType || file.type);
    formData.append('filesize', `${(file.size / 1024 / 1024).toFixed(2)}`);
    formData.append('primaryFile', primaryFile ? "true" : "false");

    const record = await pb.collection('files').create(formData);

    return {
      id: record.id,
      fileType: record.filetype,
      fileSize: record.filesize,
      fileName: record.filename,
      url: pb.files.getURL(record, record.filename),
      primaryFile: record.primaryFile,
      created: record.created,
    };

  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}
export async function deleteFileById(fileId: string): Promise<boolean> {
  try {
    await pb.collection('files').delete(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Helper function to check if a book is uninitialized
export function isBookUninitialized(book: Book): boolean {
  return book.bookSession.status === 'uninitialized' || 
         book.bookSession.id.startsWith('temp-');
}

export async function updateReaderReview(bookId: string, userId: string, rating: number, review: string, status?: 'active' | 'completed' | 'dropped'): Promise<boolean> {
  try {
    // Find the reader's session for this book
    const readerSessions = await pb.collection('readers_sessions').getFullList({
      filter: `book = "${bookId}" && user = "${userId}"`
    });

    if (readerSessions.length === 0) {
      console.error('No reader session found for this user and book');
      return false;
    }

    const sessionId = readerSessions[0].id;

    // Update the reader's session with the new rating, review, and status
    const updateData: any = {
      rating: rating,
      review: review
    };

    if (status) {
      updateData.status = status;
    }

    await pb.collection('readers_sessions').update(sessionId, updateData); 

    return true;
  } catch (error) {
    console.error('Error updating reader review:', error);
    return false;
  }
}

export async function updateBookSession(bookId: string, updates: Partial<BookSession>): Promise<boolean> {
  try {
    // Find the book session for this book
    const bookSessions = await pb.collection('book_sessions').getFullList({
      filter: `book = "${bookId}"`
    });

    if (bookSessions.length === 0) {
      console.error('No book session found for this book');
      return false;
    }

    const sessionId = bookSessions[0].id;

    // Update the book session with the new data
    await pb.collection('book_sessions').update(sessionId, updates);

    return true;
  } catch (error) {
    console.error('Error updating book session:', error);
    return false;
  }
}

export async function joinReadingSession(bookId: string, userId: string, bookTotalPages: number): Promise<boolean> {
  try {
    // Create a new reader session
    await pb.collection('readers_sessions').create({
      book: bookId,
      user: userId,
      currentPage: 0,
      bookTotalPages: bookTotalPages,
      readingPace: 0,
      rating: 0,
      review: '',
      status: 'active'
    });

    return true;
  } catch (error) {
    console.error('Error joining reading session:', error);
    return false;
  }
}
// Invite system interfaces and functions
export interface Invite {
  id: string;
  code: string;
  role: 'super' | 'admin' | 'user';
  inviter: string;
  used_by?: string;
  is_used: boolean;
  created: string;
  updated: string;
}

export async function createInvite(code: string, role: 'super' | 'admin' | 'user' = 'user'): Promise<Invite | null> {
  try {
    const record = await pb.collection('invites').create({
      code: code,
      role: role,
      inviter: pb.authStore.record?.id,
      is_used: false
    });

    return {
      id: record.id,
      code: record.code,
      role: record.role,
      inviter: record.inviter,
      used_by: record.used_by,
      is_used: record.is_used,
      created: record.created,
      updated: record.updated,
    };
  } catch (error) {
    console.error('Error creating invite:', error);
    return null;
  }
}

export async function viewInvites(): Promise<Invite[]> {
  try {
    const records = await pb.collection('invites').getFullList({
      sort: '-created'
    });

    return records.map(record => ({
      id: record.id,
      code: record.code,
      role: record.role,
      inviter: record.inviter,
      used_by: record.used_by,
      is_used: record.is_used,
      created: record.created,
      updated: record.updated,
    }));
  } catch (error) {
    console.error('Error fetching invites:', error);
    return [];
  }
}

export async function deleteInvite(inviteId: string): Promise<boolean> {
  try {
    await pb.collection('invites').delete(inviteId);
    return true;
  } catch (error) {
    console.error('Error deleting invite:', error);
    return false;
  }
}



// User statistics interface and function
export interface UserStats {
  booksRead: number;        // completed books (excluding dropped)
  currentlyReading: number; // active books
  totalPagesRead: number;   // sum of all pages read across all books
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    // Fetch all reader sessions for the user
    const readerSessions = await pb.collection('readers_sessions').getFullList({
      filter: `user = "${userId}"`
    });

    let booksRead = 0;
    let currentlyReading = 0;
    let totalPagesRead = 0;

    readerSessions.forEach(session => {
      const status = session.status || 'active';
      const currentPage = session.currentPage || 0;

      // Count pages read for all sessions
      totalPagesRead += currentPage;

      // Count books by status
      if (status === 'completed') {
        booksRead++;
      } else if (status === 'active') {
        currentlyReading++;
      }
      // Note: 'dropped' books are not counted in booksRead as requested
    });

    return {
      booksRead,
      currentlyReading,
      totalPagesRead
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      booksRead: 0,
      currentlyReading: 0,
      totalPagesRead: 0
    };
  }
}