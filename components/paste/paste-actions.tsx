'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/custom/3d-button';
import Toaster, { ToasterRef } from '@/components/custom/toast';
import { Copy, Link, Download, Edit, Trash2, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PasteActionsProps {
  pasteId: string;
  content: string;
  title?: string;
  format: string;
  isOwner: boolean;
  onContentUpdate?: (newContent: string) => void;
}

export default function PasteActions({ pasteId, content, title, format, isOwner, onContentUpdate }: PasteActionsProps) {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const toasterRef = useRef<ToasterRef>(null);
  const router = useRouter();

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toasterRef.current?.show({
      title: 'Copied!',
      message: 'Paste content copied to clipboard.',
      variant: 'success',
      duration: 2000,
    });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/paste/${pasteId}`;
    navigator.clipboard.writeText(url);
    toasterRef.current?.show({
      title: 'Link Copied!',
      message: 'Paste link copied to clipboard.',
      variant: 'success',
      duration: 2000,
    });
  };

  const downloadPaste = () => {
    const getFileExtension = () => {
      switch (format) {
        case 'javascript': return '.js';
        case 'typescript': return '.ts';
        case 'python': return '.py';
        case 'json': return '.json';
        case 'markdown': return '.md';
        default: return '.txt';
      }
    };

    const getMimeType = () => {
      switch (format) {
        case 'javascript': return 'application/javascript';
        case 'typescript': return 'application/typescript';
        case 'python': return 'text/x-python';
        case 'json': return 'application/json';
        case 'markdown': return 'text/markdown';
        default: return 'text/plain';
      }
    };

    const extension = getFileExtension();
    const filename = title ? `${title}${extension}` : `paste-${pasteId}${extension}`;
    const blob = new Blob([content], { type: getMimeType() });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toasterRef.current?.show({
      title: 'Downloaded!',
      message: `Paste downloaded as ${filename}`,
      variant: 'success',
      duration: 2000,
    });
  };

  const deletePaste = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/paste/${pasteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toasterRef.current?.show({
          title: 'Deleted!',
          message: 'Paste deleted successfully.',
          variant: 'success',
          duration: 2000,
        });
        
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        throw new Error('Failed to delete paste');
      }
    } catch (error) {
      toasterRef.current?.show({
        title: 'Error',
        message: 'Failed to delete paste.',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/paste/${pasteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });

      if (response.ok) {
        onContentUpdate?.(editContent);
        setEditMode(false);
        toasterRef.current?.show({
          title: 'Saved!',
          message: 'Paste updated successfully.',
          variant: 'success',
          duration: 2000,
        });
        
        // Refresh the page to show updated content
        window.location.reload();
      } else {
        throw new Error('Failed to update paste');
      }
    } catch (error) {
      toasterRef.current?.show({
        title: 'Error',
        message: 'Failed to update paste.',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster ref={toasterRef} />
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={copyContent}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Content
        </Button>
        
        <Button variant="outline" size="sm" onClick={copyLink}>
          <Link className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        
        <Button variant="outline" size="sm" onClick={downloadPaste}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        
        {isOwner && (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditMode(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-black/90 border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-light text-white">Edit Paste</h3>
                <button
                  onClick={() => setEditMode(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent font-mono text-sm resize-none"
                placeholder="Enter your content..."
              />
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={saveEdit}
                  disabled={loading}
                  isLoading={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-black/90 border border-white/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-light text-white">Delete Paste</h3>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-white/80 mb-6">
                Are you sure you want to delete this paste? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={deletePaste}
                  disabled={loading}
                  isLoading={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
