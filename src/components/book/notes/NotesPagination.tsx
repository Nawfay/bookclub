import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotesResponse } from "@/lib/read";

interface NotesPaginationProps {
  notesData: NotesResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function NotesPagination({ notesData, currentPage, onPageChange }: NotesPaginationProps) {
  if (notesData.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-zinc-100 dark:border-zinc-800">
      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        Page {notesData.page} of {notesData.totalPages} ({notesData.totalItems} total notes)
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, notesData.totalPages) }, (_, i) => {
            let pageNum;
            if (notesData.totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= notesData.totalPages - 2) {
              pageNum = notesData.totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-8 w-8 p-0 text-xs"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= notesData.totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}