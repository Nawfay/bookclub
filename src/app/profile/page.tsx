"use client";

import Link from "next/link";
import { User, ArrowLeft, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UpdateUserDialog, InviteManager } from "@/components/profile";
import { fetchUserStats, type UserStats } from "@/lib/data2";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    booksRead: 0,
    currentlyReading: 0,
    totalPagesRead: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user?.id) {
        setStatsLoading(true);
        try {
          const stats = await fetchUserStats(user.id);
          setUserStats(stats);
        } catch (error) {
          console.error("Failed to load user stats:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadUserStats();
  }, [user?.id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <main className="max-w-xl mx-auto px-6 sm:px-4 py-16">
          <header className="mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6"
            >
              <ArrowLeft size={14} />
              Back to Books
            </Link>
            <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">Profile</h1>
          </header>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-zinc-400 dark:text-zinc-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                  {user?.name || "User"}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">Reading Stats</h3>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading stats...</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
                      {userStats.booksRead}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Books Read</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
                      {userStats.currentlyReading}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Currently Reading</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
                      {userStats.totalPagesRead.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Pages Read</div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <UpdateUserDialog>
                  <button className="w-full text-left px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="text-sm text-zinc-900 dark:text-zinc-100">Edit Profile</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Update your name and avatar</div>
                  </button>
                </UpdateUserDialog>
              </div>
            </div>

            {user?.role === 'super' && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                <InviteManager />
              </div>
            )}

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}