'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { clearTips, loadTips } from '@/lib/rexWriter';

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  
  const [resume, setResume] = useState<any>(null);
  const [latexSource, setLatexSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);

  // Rex Writer's suggestions from the last build or update
  useEffect(() => {
    if (resumeId) setTips(loadTips(resumeId));
  }, [resumeId]);

  const dismissTips = () => {
    clearTips(resumeId);
    setTips([]);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (resumeId && user) {
      loadResume();
    }
  }, [resumeId, user, authLoading]);

  const loadResume = async () => {
    try {
      const data = await api.getResume(resumeId);
      setResume(data);
      setLatexSource(data.latex_source || '');
      
      // Auto-compile on load
      compileResume(data.latex_source);
    } catch (error) {
      console.error('Failed to load resume:', error);
      alert('Failed to load resume');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const compileResume = async (source?: string) => {
    setCompiling(true);
    try {
      const blob = await api.compileResume(resumeId, source || latexSource);
      const url = URL.createObjectURL(blob);
      
      // Revoke old URL to prevent memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
    } catch (error: any) {
      alert(`Compilation failed: ${error.message}`);
    } finally {
      setCompiling(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateResume(resumeId, { latex_source: latexSource });
      setResume({ ...resume, latex_source: latexSource });
      alert('Saved successfully!');
    } catch (error) {
      alert('Failed to save');
    }
  };

  const openChat = () => {
    if (
      latexSource !== (resume?.latex_source || '') &&
      !confirm('You have unsaved LaTeX changes. Leave the editor without saving them?')
    ) {
      return;
    }
    router.push(`/editor/${resumeId}/chat`);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${resume?.title || 'resume'}.pdf`;
      link.click();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/15 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-white/70 hover:text-white"
            >
              ← Dashboard
            </button>
            <h1 className="text-xl font-bold">{resume?.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={openChat}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm flex items-center gap-2"
            >
              <span className="h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-semibold bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_8px_#8c45ff]">
                R
              </span>
              Chat with Rex
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
            >
              Save
            </button>
            <button
              onClick={() => compileResume()}
              disabled={compiling}
              className="px-4 py-2 rounded-lg bg-[#8c45ff]/20 hover:bg-[#8c45ff]/30 transition text-sm disabled:opacity-50"
            >
              {compiling ? 'Compiling...' : 'Compile'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!pdfUrl}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_8px_#8c45ff] hover:shadow-[0px_0px_12px_#8c45ff] transition text-sm disabled:opacity-50"
            >
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {tips.length > 0 && (
        <div className="border-b border-white/15 bg-[linear-gradient(to_right,rgb(140,69,255,.2),black)]">
          <div className="container mx-auto px-4 py-3 flex gap-4 items-start">
            <div className="h-8 w-8 flex-none rounded-full inline-flex items-center justify-center text-sm font-semibold bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] border border-white/15">
              R
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium">Rex polished your resume. To make it even stronger:</div>
              <ul className="mt-1 space-y-0.5 text-white/70">
                {tips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-3 flex-none">
              <button onClick={openChat} className="text-sm text-[#A369FF] hover:text-white transition">
                Add details with Rex
              </button>
              <button
                onClick={dismissTips}
                aria-label="Dismiss tips"
                className="text-white/50 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-panel editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: LaTeX Editor */}
        <div className="w-1/2 border-r border-white/15 flex flex-col">
          <div className="px-4 py-2 bg-white/5 border-b border-white/15 text-sm font-medium">
            LaTeX Source
          </div>
          <textarea
            value={latexSource}
            onChange={(e) => setLatexSource(e.target.value)}
            className="flex-1 p-4 bg-black text-white font-mono text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {/* Right: PDF Preview */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="px-4 py-2 bg-white/5 border-b border-white/15 text-sm font-medium">
            PDF Preview
          </div>
          <div className="flex-1 overflow-auto">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white/50">
                Click &quot;Compile&quot; to preview your resume
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
