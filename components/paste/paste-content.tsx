'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import PasswordPrompt from '@/components/password-prompt';
import { Lock } from 'lucide-react';

interface PasteContentProps {
  paste: {
    id: string;
    content: string;
    format: string;
    password: string | null;
    title: string | null;
  };
  isOwner: boolean;
  onUnlock?: () => void;
}

export default function PasteContent({ paste, isOwner, onUnlock }: PasteContentProps) {
  // Owner can always see their paste, others need password
  const [isUnlocked, setIsUnlocked] = useState(!paste.password || isOwner);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    if (paste.password && !isUnlocked && !isOwner) {
      setShowPasswordPrompt(true);
    }
  }, [paste.password, isUnlocked, isOwner]);

  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
    setShowPasswordPrompt(false);
    onUnlock?.(); // Notify parent that paste is unlocked
  };

  const renderContent = () => {
    switch (paste.format) {
      case 'markdown':
        return (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => (
                  <code
                    className={`${className} bg-white/10 px-1 py-0.5 rounded text-sm font-mono`}
                    {...props}
                  >
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto">
                    {children}
                  </pre>
                ),
              }}
            >
              {paste.content}
            </ReactMarkdown>
          </div>
        );

      case 'javascript':
      case 'typescript':
      case 'python':
      case 'json':
        return (
          <SyntaxHighlighter
            language={paste.format === 'typescript' ? 'tsx' : paste.format}
            style={oneDark}
            customStyle={{
              background: 'transparent',
              padding: '0',
              margin: '0',
              fontSize: '14px',
            }}
            wrapLongLines={true}
          >
            {paste.content}
          </SyntaxHighlighter>
        );

      default:
        return (
          <pre className="text-sm text-white/90 font-mono whitespace-pre-wrap break-words">
            {paste.content}
          </pre>
        );
    }
  };

  if (paste.password && !isUnlocked && !isOwner) {
    return (
      <>
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <div className="p-4 bg-orange-500/20 rounded-full w-fit mx-auto mb-4">
            <Lock className="h-8 w-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-light text-white mb-2">Password Protected</h3>
          <p className="text-white/60 mb-6">
            This paste is password protected. Click below to enter the password.
          </p>
          <button
            onClick={() => setShowPasswordPrompt(true)}
            className="px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-400 transition-colors"
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Enter Password
          </button>
        </div>

        <PasswordPrompt
          isOpen={showPasswordPrompt}
          onClose={() => setShowPasswordPrompt(false)}
          onSuccess={handlePasswordSuccess}
          pasteId={paste.id}
        />
      </>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 overflow-auto">
      {renderContent()}
    </div>
  );
}
