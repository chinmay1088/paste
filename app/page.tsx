'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/custom/3d-button';
import { FileUpload } from '@/components/custom/file-upload';
import { DropdownMenu } from '@/components/custom/dropdown-menu';
import Toaster, { ToasterRef } from '@/components/custom/toast';
import AuthModal from '@/components/auth/auth-modal';
import MyPastes from '@/components/my-pastes';
import { Upload, Code, FileText, Copy, Share, User, LogOut, Lock, Sparkles, Github } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Switch } from '@/components/ui/switch';
import AIEnhance from '@/components/ai-enhance';
import { renderContent } from '@/lib/content-renderer';

const formatOptions = [
  { label: 'Plain Text', value: 'text', Icon: <FileText className="h-4 w-4" /> },
  { label: 'Markdown', value: 'markdown', Icon: <FileText className="h-4 w-4" /> },
  { label: 'JavaScript', value: 'javascript', Icon: <Code className="h-4 w-4" /> },
  { label: 'TypeScript', value: 'typescript', Icon: <Code className="h-4 w-4" /> },
  { label: 'Python', value: 'python', Icon: <Code className="h-4 w-4" /> },
  { label: 'JSON', value: 'json', Icon: <Code className="h-4 w-4" /> },
];

export default function Home() {
  const [pasteContent, setPasteContent] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('text');
  const [files, setFiles] = useState<File[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pastePassword, setPastePassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [aiEnhanceOpen, setAiEnhanceOpen] = useState(false);
  const [isCreatingPaste, setIsCreatingPaste] = useState(false);
  const toasterRef = useRef<ToasterRef>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPasteContent(content);
        
        // Auto-detect format based on file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        const formatMap: { [key: string]: string } = {
          'md': 'markdown',
          'js': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'py': 'python',
          'json': 'json',
          'jsonc': 'json'
        };
        
        if (extension && formatMap[extension]) {
          setSelectedFormat(formatMap[extension]);
        }
        
        toasterRef.current?.show({
          title: 'File Uploaded',
          message: `${file.name} has been loaded successfully.`,
          variant: 'success',
          duration: 3000,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    toasterRef.current?.show({
      title: 'Format Changed',
      message: `Switched to ${formatOptions.find(f => f.value === format)?.label} format.`,
      variant: 'default',
      duration: 2000,
    });
  };

  const renderFormattedContent = () => {
    if (!pasteContent) return null;
    return renderContent(pasteContent, selectedFormat);
  };

  const handlePaste = async () => {
    if (!pasteContent.trim()) {
      toasterRef.current?.show({
        title: 'Empty Content',
        message: 'Please enter some content to paste.',
        variant: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsCreatingPaste(true);

    toasterRef.current?.show({
      title: 'Creating Paste...',
      message: 'Please wait while we process your content.',
      variant: 'default',
      duration: 2000,
    });

    try {
      const response = await fetch('/api/paste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: pasteContent,
          format: selectedFormat,
          is_public: true,
          password: isPasswordProtected ? pastePassword : null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const pasteUrl = `${window.location.origin}/paste/${result.data.id}`;
        
        toasterRef.current?.show({
          title: 'Paste Created!',
          message: 'Your paste has been created successfully.',
          variant: 'success',
          duration: 4000,
          actions: {
            label: 'Copy Link',
            onClick: () => {
              navigator.clipboard.writeText(pasteUrl);
              toasterRef.current?.show({
                title: 'Link Copied',
                message: 'Paste link copied to clipboard.',
                variant: 'success',
                duration: 2000,
              });
            },
            variant: 'outline',
          },
        });

        // Redirect to paste after a short delay
        setTimeout(() => {
          window.location.href = `/paste/${result.data.id}`;
        }, 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toasterRef.current?.show({
        title: 'Error',
        message: error.message || 'Failed to create paste.',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setIsCreatingPaste(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster ref={toasterRef} />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold tracking-tight" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                paste
              </h1>
              <p className="text-sm text-white/60 mt-1">
                pastebin but with ai
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/chinmay1088/paste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              {user ? (
                <>
                  <span className="text-sm text-white/60">
                    {user.email}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => supabase.auth.signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Input */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-light mb-2">create a new paste</h2>
              <p className="text-white/70">
                paste your text or upload a file to share with others
              </p>
            </div>

            {/* Format Selector & AI Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-white/80">Format:</label>
                <DropdownMenu
                  options={formatOptions.map(format => ({
                    label: format.label,
                    onClick: () => handleFormatSelect(format.value),
                    Icon: format.Icon,
                  }))}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {formatOptions.find(f => f.value === selectedFormat)?.label || 'Select Format'}
                </DropdownMenu>
              </div>
              
              <Button
                variant="ai"
                size="sm"
                onClick={() => setAiEnhanceOpen(true)}
                disabled={!pasteContent.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI
              </Button>
            </div>

            {/* Text Area */}
            <div className="space-y-4">
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste your content here..."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
              
              {/* File Upload */}
              <div className="border border-dashed border-white/20 rounded-xl bg-white/5">
                <FileUpload onChange={handleFileUpload} />
              </div>
            </div>

            {/* Password Protection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password protect this paste
                </label>
                <Switch
                  checked={isPasswordProtected}
                  onCheckedChange={(checked) => {
                    setIsPasswordProtected(checked);
                    if (!checked) {
                      setPastePassword('');
                    }
                  }}
                />
              </div>
              
              {isPasswordProtected && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="password"
                    value={pastePassword}
                    onChange={(e) => setPastePassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    placeholder="Enter password for this paste"
                    required={isPasswordProtected}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePaste}
                className="flex-1"
                disabled={!pasteContent.trim() || (isPasswordProtected && !pastePassword.trim()) || isCreatingPaste}
                isLoading={isCreatingPaste}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isCreatingPaste ? 'Creating...' : 'Create Paste'}
              </Button>
              <Button variant="outline" onClick={() => setPasteContent('')}>
                Clear
              </Button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-light mb-2">preview</h3>
              <p className="text-white/70 text-sm">
                see how your content will appear
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-h-64 overflow-auto">
              {pasteContent ? (
                renderFormattedContent()
              ) : (
                <div className="flex items-center justify-center h-32 text-white/40">
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Your content preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-lg font-mono text-white">
                  {pasteContent.length}
                </div>
                <div className="text-xs text-white/60">Characters</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-lg font-mono text-white">
                  {pasteContent.split('\n').length}
                </div>
                <div className="text-xs text-white/60">Lines</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-lg font-mono text-white">
                  {pasteContent.split(/\s+/).filter(word => word.length > 0).length}
                </div>
                <div className="text-xs text-white/60">Words</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* My Pastes Section */}
      <MyPastes user={user} />

      {/* AI Enhancement Modal */}
      <AIEnhance
        isOpen={aiEnhanceOpen}
        onClose={() => setAiEnhanceOpen(false)}
        originalText={pasteContent}
        onTextUpdate={(newText: string) => setPasteContent(newText)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}
