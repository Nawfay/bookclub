"use client";

import Link from "next/link";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { AddBookDialog } from "@/components/AddBookDialog";

interface HeaderProps {
  variant: "main" | "book";
  bookTitle?: string;
  onBookAdded?: () => void;
}

export function Header({ variant, bookTitle, onBookAdded }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="mb-12 w-full">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100 antialiased">
          Book Club
        </Link>
        
        <div className="flex items-center gap-4">
          {variant === "main" && (
            <>
              <AddBookDialog onBookAdded={onBookAdded} />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {theme === "light" ? (
                  <Moon size={16} className="text-zinc-600 dark:text-zinc-400" />
                ) : (
                  <Sun size={16} className="text-zinc-600 dark:text-zinc-400" />
                )}
              </Button>
              
              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <User size={16} className="text-zinc-600 dark:text-zinc-400" />
                </Button>
              </Link>
            </>
          )}
          
          {variant === "book" && (
            <>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{bookTitle}</span>
              <button 
                onClick={toggleTheme}
                className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                {theme === "light" ? (
                  <Moon size={16} className="text-zinc-600 dark:text-zinc-400" />
                ) : (
                  <Sun size={16} className="text-zinc-600 dark:text-zinc-400" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}