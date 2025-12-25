import pb from "./pocketbase";

// Book content interfaces
export interface BookContent {
  content: string[];
  page: number;
  totalPages: number;
}

// Notes interfaces
export interface Note {
  id: string;
  bookText: string;
  note: string;
  user: string;
  book: string;
  page: number;
  processed: boolean;
  created: string;
  sys_created: string;
  updated: string;
  expand?: {
    user?: {
      id: string;
      name: string;
      avatar?: string;
    };
    book?: {
      id: string;
      title: string;
    };
  };
}

export interface NotesResponse {
  items: Note[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

// Book content functions
export async function fetchBookContent(bookId: string, page: number): Promise<BookContent | null> {
  try {
    const response = await fetch(`${pb.baseURL}/book/${bookId}/read/${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(pb.authStore.token && {
          'Authorization': `Bearer ${pb.authStore.token}`
        })
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Book content not found or page empty");
      }
      if (response.status === 500) {
        throw new Error("Error parsing book content");
      }
      throw new Error(`Failed to load page: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.content || [],
      page: page,
      totalPages: data.totalPages || 0
    };
  } catch (error) {
    console.error(`Error fetching book content for book ${bookId}, page ${page}:`, error);
    return null;
  }
}

export async function getBookTotalPages(bookId: string): Promise<number> {
  try {
    const firstPage = await fetchBookContent(bookId, 1);
    return firstPage?.totalPages || 0;
  } catch (error) {
    console.error(`Error getting total pages for book ${bookId}:`, error);
    return 0;
  }
}

// Notes functions
export async function fetchBookNotes(bookId: string, page: number = 1, perPage: number = 10): Promise<NotesResponse | null> {
  try {
    const response = await pb.collection('notes').getList(page, perPage, {
      filter: `book = "${bookId}"`,
      sort: '+page,+created',
      expand: 'user,book'
    });

    return {
      items: response.items as unknown as Note[],
      page: response.page,
      perPage: response.perPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages
    };
  } catch (error) {
    console.error(`Error fetching notes for book ${bookId}:`, error);
    return null;
  }
}

export async function fetchNotesByPage(bookId: string, bookPage: number): Promise<Note[]> {
  try {
    const response = await pb.collection('notes').getFullList({
      filter: `book = "${bookId}" && page = ${bookPage}`,
      sort: '+created',
      expand: 'user,book'
    });

    return response as unknown as Note[];
  } catch (error) {
    console.error(`Error fetching notes for book ${bookId} page ${bookPage}:`, error);
    return [];
  }
}

export async function searchNotes(bookId: string, searchTerm: string, page: number = 1, perPage: number = 10): Promise<NotesResponse | null> {
  try {
    const response = await pb.collection('notes').getList(page, perPage, {
      filter: `book = "${bookId}" && (note ~ "${searchTerm}" || bookText ~ "${searchTerm}")`,
      sort: '+page,+created',
      expand: 'user,book'
    });

    return {
      items: response.items as unknown as Note[],
      page: response.page,
      perPage: response.perPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages
    };
  } catch (error) {
    console.error(`Error searching notes for book ${bookId}:`, error);
    return null;
  }
}