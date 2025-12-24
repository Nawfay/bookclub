"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Upload, X, Star } from "lucide-react";
import { fetchFilesByBookId, uploadFileToBook, deleteFileById, BookFile as NewBookFile, isBookUninitialized } from "@/lib/data2";
import { canViewSuper } from "@/lib/auth";


interface BookFilesProps {
  isInitializated: boolean
  bookId: string; // Make bookId required since we only use fetched files now
}

export function BookFiles({ bookId, isInitializated }: BookFilesProps) {
  const hasSuper = canViewSuper();
  const [fetchedFiles, setFetchedFiles] = useState<NewBookFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files from PocketBase
  useEffect(() => {
    loadFiles();
  }, [bookId]);

  const loadFiles = async () => {
    try {
      const filesData = await fetchFilesByBookId(bookId);
      setFetchedFiles(filesData);
      
      // Log the fetched files for debugging (remove later)
      console.log('Fetched files for BookFiles component:', filesData);
      
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect file type based on extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      setFileType(extension === 'pdf' ? 'PDF' : extension === 'epub' ? 'EPUB' : extension?.toUpperCase() || '');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileType.trim()) return;

    setUploading(true);
    try {
      const uploadedFile = await uploadFileToBook(bookId, selectedFile, fileType);
      if (uploadedFile) {
        // Refresh the files list
        await loadFiles();
        // Reset form
        setSelectedFile(null);
        setFileType("");
        setShowUploadDialog(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFileType("");
    setShowUploadDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const success = await deleteFileById(fileId);
      if (success) {
        await loadFiles(); // Refresh the files list
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  if (isInitializated) return null

  return (
    <section className="mb-10">
      <h2 className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-wide mb-4">Associated Files</h2>
      
      {/* {loading && (
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse">
            <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
            <div>
              <div className="w-12 h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-1" />
              <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-700 rounded" />
            </div>
          </div>
        </div>
      )} */}
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">{fetchedFiles.map((file) => {
          return (
            <div key={file.id} className="relative group flex-shrink-0">
              <a
                href={file.url}
                download={file.fileName}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 transition-colors min-w-max"
              >
                <Download size={14} className="text-zinc-500 dark:text-zinc-400" />
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 uppercase">{file.fileType}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{file.fileSize} MB</div>
                </div>
              </a>
              {hasSuper && (
                file.primaryFile ? (
                  <div
                    className="absolute top-1 right-1 w-3 h-3 text-yellow-500"
                    title="Primary file"
                  >
                    <Star size={12} fill="currentColor" />
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirm(file.id);
                    }}
                    className="absolute top-1 right-1 w-3 h-3 text-zinc-400 hover:text-red-500 transition-colors duration-200"
                    title="Delete file"
                  >
                    <X size={12} />
                  </button>
                )
              )}
            </div>
          );
        })}
        {hasSuper && (
          <button
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 border-dashed transition-colors flex-shrink-0 min-w-max"
          >
            <Upload size={14} className="text-zinc-500 dark:text-zinc-400" />
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 uppercase">Add File</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Upload new</div>
            </div>
          </button>
        )}
        
        {fetchedFiles.length === 0 && !loading && !hasSuper && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">No files yet...</div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={resetUploadForm}>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Upload File</h3>
              <button onClick={resetUploadForm} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">Select File</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.epub,.txt,.doc,.docx"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              />
              {selectedFile && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">File Type</label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="e.g., PDF, EPUB, TXT"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetUploadForm}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm rounded hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !fileType.trim()}
                className="flex-1 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Delete File</h3>
              <button onClick={() => setDeleteConfirm(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this file? This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm rounded hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}