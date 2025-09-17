'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/custom/3d-button';
import Toaster, { ToasterRef } from '@/components/custom/toast';
import { X, Check, RotateCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIEnhanceProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onTextUpdate: (newText: string) => void;
}

const SUGGESTIONS = [
  'Make this professional',
  'Check for typos', 
  'Check for grammar'
];

export default function AIEnhance({ isOpen, onClose, originalText, onTextUpdate }: AIEnhanceProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [showAcceptReject, setShowAcceptReject] = useState(false);
  const [originalTextBackup, setOriginalTextBackup] = useState('');
  const toasterRef = useRef<ToasterRef>(null);

  const handlePromptSubmit = async (prompt: string) => {
    if (!originalText.trim()) {
      toasterRef.current?.show({
        title: 'No Content',
        message: 'Please enter some text first.',
        variant: 'error',
        duration: 3000,
      });
      return;
    }

    // Backup original text before starting
    setOriginalTextBackup(originalText);
    setIsGenerating(true);
    setShowAcceptReject(true); // Show accept/reject immediately with disabled buttons

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedText(data.enhancedText);
      
      // Animate text generation character by character
      let currentIndex = 0;
      const fullText = data.enhancedText;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          const currentText = fullText.substring(0, currentIndex);
          onTextUpdate(currentText);
          currentIndex += 2; // Type 2 characters at a time for faster animation
        } else {
          clearInterval(typeInterval);
          onTextUpdate(fullText);
          // Buttons are already shown, just enable them by setting isGenerating to false
        }
      }, 50); // 50ms delay between character updates

    } catch (error) {
      toasterRef.current?.show({
        title: 'Enhancement Failed',
        message: error instanceof Error ? error.message : 'Failed to enhance text',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    // Text is already updated, just close
    handleClose();
  };

  const handleReject = () => {
    // Revert to original text using backup
    onTextUpdate(originalTextBackup);
    setShowAcceptReject(false);
    setGeneratedText('');
  };

  const handleClose = () => {
    setCustomPrompt('');
    setIsGenerating(false);
    setGeneratedText('');
    setShowAcceptReject(false);
    onClose();
  };

  return (
    <>
      <Toaster ref={toasterRef} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-80 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light text-white">AI Enhance</h3>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-center gap-3 text-white/80 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Enhancing...</span>
              </div>
            )}

            {/* Accept/Reject Buttons */}
            {showAcceptReject && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 mb-4"
              >
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isGenerating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </motion.div>
            )}

            {/* Suggestions */}
            {!isGenerating && !showAcceptReject && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handlePromptSubmit(suggestion)}
                      className="w-full text-left p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-xs text-white/80 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Custom prompt..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && customPrompt.trim()) {
                        handlePromptSubmit(customPrompt);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handlePromptSubmit(customPrompt)}
                    disabled={!customPrompt.trim()}
                    className="w-full"
                  >
                    Enhance
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
