import Link from "next/link";

interface NavigationProps {
  activeTab: string;
}

export function Navigation({ activeTab }: NavigationProps) {
  return (
    <nav className="flex flex-col gap-1 mb-8">
      <Link 
        href="/" 
        className={`text-[15px] hover:underline decoration-zinc-400 underline-offset-4 w-fit ${
          activeTab === "reading" ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        Currently Reading
      </Link>
      <Link 
        href="/?filter=completed" 
        className={`text-[15px] hover:underline decoration-zinc-400 underline-offset-4 w-fit ${
          activeTab === "completed" ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        Completed
      </Link>
      <Link 
        href="/?filter=upcoming" 
        className={`text-[15px] hover:underline decoration-zinc-400 underline-offset-4 w-fit ${
          activeTab === "upcoming" ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        Upcoming
      </Link>
      <Link 
        href="/?filter=search" 
        className={`text-[15px] hover:underline decoration-zinc-400 underline-offset-4 w-fit ${
          activeTab === "search" ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        Search
      </Link>
      <Link 
        href="/?filter=stats" 
        className={`text-[15px] hover:underline decoration-zinc-400 underline-offset-4 w-fit ${
          activeTab === "stats" ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        Global Stats
      </Link>
    </nav>
  );
}