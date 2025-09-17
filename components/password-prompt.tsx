'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/custom/3d-button';
import Toaster, { ToasterRef } from '@/components/custom/toast';
import { Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (password: string) => void;
  pasteId: string;
}

export default function PasswordPrompt({ isOpen, onClose, onSuccess, pasteId }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toasterRef = useRef<ToasterRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/paste/${pasteId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onSuccess(password);
        onClose();
      } else {
        const result = await response.json();
        toasterRef.current?.show({
          title: 'Incorrect Password',
          message: result.error || 'The password you entered is incorrect.',
          variant: 'error',
          duration: 3000,
        });
        setPassword('');
      }
    } catch (error) {
      toasterRef.current?.show({
        title: 'Error',
        message: 'Failed to verify password.',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <>
      <Toaster ref={toasterRef} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-black/90 border border-white/20 rounded-2xl p-8 w-full max-w-md backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Lock className="h-5 w-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-light text-white">Password Protected</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-white/60 mb-6">
                This paste is password protected. Please enter the password to view it.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                    placeholder="Enter password"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading || !password.trim()}
                    isLoading={loading}
                    className="flex-1"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock Paste
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
