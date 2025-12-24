export interface Member {
  id: string;
  name: string;
  avatar: string;
  currentPage: number;
  readingSession?: {
    startDate: string;
    pagesPerDay: number;
    calculatedEndDate: string;
  };
}

export interface Note {
  id: string;
  memberId: string;
  memberName: string;
  page: number;
  highlightedText: string;
  content: string;
  createdAt: string;
}

export interface BookFile {
  type: "epub" | "pdf";
  url: string;
  size: string;
}

export interface BookSessions{
  id: string;
  status: "acive" | "completed" | "dropped" | "on_hold";
  currentPage: number;
  targetPage: number;
  readingPacePerDay: number;
  estimatedEndDate: string;
}

export interface ReaderSession{
  id: string
  status: "acive" | "completed" | "dropped" | "on_hold";
  currentPage: number;
  bookTotalPages: number;
  readingPace: number
  rating: number;
  review: string;
}

export interface Rating {
  memberId: string;
  memberName: string;
  rating: number;
  review?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  totalPages: number;
  members: Member[];
  notes: Note[];
  status: "reading" | "completed" | "planned";
  files: BookFile[];
  ratings: Rating[];
}

export const books: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
    totalPages: 180,
    status: "reading",
    files: [
      { type: "epub", url: "/files/great-gatsby.epub", size: "2.3 MB" },
      { type: "pdf", url: "/files/great-gatsby.pdf", size: "4.1 MB" },
    ],
    ratings: [
      { memberId: "1", memberName: "Sarah", rating: 5, review: "A timeless classic about the American Dream" },
      { memberId: "3", memberName: "Elena", rating: 4, review: "Beautiful prose, though the characters are frustrating" },
    ],
    members: [
      { 
        id: "1", 
        name: "Sarah", 
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", 
        currentPage: 145,
        readingSession: {
          startDate: "2024-01-10",
          pagesPerDay: 15,
          calculatedEndDate: "2024-01-24"
        }
      },
      { id: "2", name: "Marcus", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", currentPage: 120 },
      { id: "3", name: "Elena", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", currentPage: 167 },
      { id: "4", name: "James", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", currentPage: 98 },
    ],
    notes: [
      { id: "n1", memberId: "1", memberName: "Sarah", page: 45, highlightedText: "the green light, the orgastic future", content: "The green light symbolism is so powerful here. It represents Gatsby's hopes and dreams.", createdAt: "2024-01-15" },
      { id: "n2", memberId: "3", memberName: "Elena", page: 89, highlightedText: "Every one suspects himself of at least one of the cardinal virtues", content: "Nick's unreliability as a narrator becomes more apparent in this chapter.", createdAt: "2024-01-18" },
      { id: "n3", memberId: "2", memberName: "Marcus", page: 120, highlightedText: "I believe that on the first night I went to Gatsby's house", content: "The party scenes feel almost surreal, like a dream sequence.", createdAt: "2024-01-20" },
      { id: "n4", memberId: "4", memberName: "James", page: 67, highlightedText: "Her voice is full of money", content: "Daisy's voice being 'full of money' is such a striking description.", createdAt: "2024-01-16" },
    ],
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
    totalPages: 328,
    status: "reading",
    files: [
      { type: "epub", url: "/files/1984.epub", size: "1.8 MB" },
      { type: "pdf", url: "/files/1984.pdf", size: "3.5 MB" },
    ],
    ratings: [
      { memberId: "1", memberName: "Sarah", rating: 5, review: "Chillingly relevant" },
      { memberId: "3", memberName: "Elena", rating: 5, review: "A masterpiece of dystopian fiction" },
      { memberId: "2", memberName: "Marcus", rating: 4 },
    ],
    members: [
      { id: "1", name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", currentPage: 210 },
      { id: "2", name: "Marcus", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", currentPage: 185 },
      { id: "3", name: "Elena", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", currentPage: 245 },
      { id: "4", name: "James", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", currentPage: 156 },
    ],
    notes: [
      { id: "n5", memberId: "1", memberName: "Sarah", page: 78, highlightedText: "Doublethink means the power of holding two contradictory beliefs", content: "The concept of doublethink is terrifyingly relevant today.", createdAt: "2024-01-10" },
      { id: "n6", memberId: "3", memberName: "Elena", page: 156, highlightedText: "Freedom is the freedom to say that two plus two make four", content: "Winston's rebellion feels both brave and futile at the same time.", createdAt: "2024-01-14" },
    ],
  },
  {
    id: "tbgn7x4he2mu2j6",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop",
    totalPages: 432,
    status: "completed",
    files: [
      { type: "epub", url: "/files/pride-and-prejudice.epub", size: "3.2 MB" },
      { type: "pdf", url: "/files/pride-and-prejudice.pdf", size: "5.8 MB" },
    ],
    ratings: [
      { memberId: "1", memberName: "Sarah", rating: 5, review: "Perfect romance novel" },
      { memberId: "2", memberName: "Marcus", rating: 4, review: "Better than expected" },
      { memberId: "3", memberName: "Elena", rating: 5 },
      { memberId: "4", memberName: "James", rating: 4, review: "Witty and engaging" },
    ],
    members: [
      { id: "1", name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", currentPage: 432 },
      { id: "2", name: "Marcus", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", currentPage: 432 },
      { id: "3", name: "Elena", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", currentPage: 432 },
      { id: "4", name: "James", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", currentPage: 432 },
    ],
    notes: [
      { id: "n7", memberId: "2", memberName: "Marcus", page: 234, highlightedText: "In such cases as this, it is, I believe, the established mode", content: "Darcy's letter is the turning point of the entire novel.", createdAt: "2023-12-20" },
      { id: "n8", memberId: "1", memberName: "Sarah", page: 380, highlightedText: "She is tolerable; but not handsome enough to tempt me", content: "Elizabeth's wit never gets old, even on a second reading.", createdAt: "2023-12-28" },
    ],
  },
  {
    id: "4",
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://images.unsplash.com/photo-1531072901881-d644216d4bf9?w=300&h=450&fit=crop",
    totalPages: 688,
    status: "planned",
    files: [
      { type: "epub", url: "/files/dune.epub", size: "4.5 MB" },
      { type: "pdf", url: "/files/dune.pdf", size: "7.2 MB" },
    ],
    ratings: [],
    members: [
      { id: "1", name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", currentPage: 0 },
      { id: "2", name: "Marcus", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", currentPage: 0 },
      { id: "3", name: "Elena", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", currentPage: 0 },
      { id: "4", name: "James", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", currentPage: 0 },
    ],
    notes: [],
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
