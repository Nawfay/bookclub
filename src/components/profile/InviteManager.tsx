"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateInviteDialog } from "./CreateInviteDialog";
import { viewInvites, deleteInvite, type Invite } from "@/lib/data2";

export function InviteManager() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadInvites = async () => {
    setLoading(true);
    try {
      const fetchedInvites = await viewInvites();
      setInvites(fetchedInvites);
    } catch (error) {
      console.error("Failed to load invites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const success = await deleteInvite(inviteId);
      if (success) {
        setInvites(prev => prev.filter(invite => invite.id !== inviteId));
      }
    } catch (error) {
      console.error("Failed to delete invite:", error);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading invites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Invite Codes</h3>
        <CreateInviteDialog onInviteCreated={loadInvites}>
          <Button size="sm" className="flex items-center gap-2">
            <Plus size={14} />
            Create Invite
          </Button>
        </CreateInviteDialog>
      </div>

      {invites.length === 0 ? (
        <div className="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
          No invites created yet
        </div>
      ) : (
        <div className="space-y-2">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                  {invite.code}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(invite.role)}`}>
                  {invite.role}
                </span>
                {invite.is_used && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Used
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyCode(invite.code)}
                  className="flex items-center gap-1"
                >
                  {copiedCode === invite.code ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copiedCode === invite.code ? "Copied" : "Copy"}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteInvite(invite.id)}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}