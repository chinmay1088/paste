'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/custom/3d-button';
import { FileText, Code, Calendar, ExternalLink, Lock } from 'lucide-react';
import Link from 'next/link';

interface Paste {
  id: string;
  title: string | null;
  content: string;
  format: string;
  created_at: string;
  is_public: boolean;
  password: string | null;
}

interface MyPastesProps {
  user: any;
}

export default function MyPastes({ user }: MyPastesProps) {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchPastes();
    }
  }, [user]);

  const fetchPastes = async () => {
    try {
      const { data, error } = await supabase
        .from('pastes')
        .select('id, title, content, format, created_at, is_public, password')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPastes(data || []);
    } catch (error) {
      console.error('Error fetching pastes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'javascript':
      case 'typescript':
      case 'python':
      case 'json':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!user) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-white/10">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-white mb-2">My Pastes</h2>
        <p className="text-white/60">Your recent pastes</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded mb-4 w-3/4"></div>
              <div className="h-16 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      ) : pastes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 mb-4">You haven't created any pastes yet.</p>
          <p className="text-white/40 text-sm">Create your first paste above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastes.map((paste) => (
            <Link
              key={paste.id}
              href={`/paste/${paste.id}`}
              className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getFormatIcon(paste.format)}
                  <span className="text-sm text-white/60 capitalize">
                    {paste.format}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>

              <h3 className="text-white font-medium mb-2 line-clamp-1">
                {paste.title || 'Untitled Paste'}
              </h3>

              <p className="text-white/60 text-sm mb-3 line-clamp-3 font-mono">
                {truncateContent(paste.content)}
              </p>

              <div className="flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(paste.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  {paste.password && (
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Protected
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full ${
                    paste.is_public 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {paste.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pastes.length > 0 && (
        <div className="text-center mt-8">
    
        </div>
      )}
    </section>
  );
}
