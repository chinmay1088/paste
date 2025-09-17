'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PasteActions from '@/components/paste/paste-actions';
import PasteContent from '@/components/paste/paste-content';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PastePage({ params }: PageProps) {
  const [paste, setPaste] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { id } = await params;
      
      const [pasteResult, userResult] = await Promise.all([
        supabase
          .from('pastes')
          .select('id, title, content, format, created_at, is_public, user_id, password')
          .eq('id', id)
          .single(),
        supabase.auth.getUser()
      ]);

      if (pasteResult.error || !pasteResult.data) {
        notFound();
        return;
      }

      setPaste(pasteResult.data);
      setUser(userResult.data.user);
      
      const isOwner = Boolean(userResult.data.user && pasteResult.data.user_id === userResult.data.user.id);
      setIsUnlocked(!pasteResult.data.password || isOwner);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!paste) {
    notFound();
    return null;
  }

  const isOwner = Boolean(user && paste.user_id === user.id);


  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-mono font-bold tracking-tight" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            paste
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-light mb-2">
                {paste.title || 'Untitled Paste'}
              </h1>
              <div className="text-sm text-white/60">
                Created {new Date(paste.created_at).toLocaleDateString()} • {paste.format}
                {paste.user_id && user && paste.user_id === user.id && (
                  <span className="ml-2 text-blue-400">• Your paste</span>
                )}
              </div>
            </div>
            
            {/* Show actions if unlocked or owner */}
            {(isUnlocked || isOwner) && (
              <PasteActions
                pasteId={paste.id}
                content={paste.content}
                title={paste.title}
                format={paste.format}
                isOwner={isOwner}
              />
            )}
          </div>
        </div>

        <PasteContent 
          paste={paste} 
          isOwner={isOwner} 
          onUnlock={() => setIsUnlocked(true)}
        />
      </main>
    </div>
  );
}
