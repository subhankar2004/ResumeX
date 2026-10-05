'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ProfileMenu } from '@/components/ProfileMenu';

interface Resume {
  id: string;
  title: string;
  updated_at: string;
  template_name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadResumes();
    }
  }, [user, authLoading]);

  const loadResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete resume');
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/15 bg-black/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            ResumeX
          </Link>
          <ProfileMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* AI interviewer entry point */}
        <div className="border border-white/15 rounded-xl p-6 md:p-8 mb-10 flex flex-col md:flex-row md:items-center gap-6 bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)]">
          <div className="h-14 w-14 flex-none rounded-full inline-flex items-center justify-center text-xl font-semibold bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_20px_#8c45ff] border border-white/15">
            R
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-medium tracking-tight">Meet Rex, your resume buddy</h2>
            <p className="text-white/70 mt-1">
              Pick a template and Rex will chat with you to fill it in, no forms or LaTeX
              required. You can still edit every line afterwards.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/create"
              className="px-5 py-3 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition"
            >
              Start with Rex
            </Link>
            <Link
              href="/templates"
              className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              Browse templates
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Resumes</h2>
            <p className="text-white/70">
              {user?.plan === 'free' && `Free plan: ${resumes.length}/2 resumes`}
              {user?.plan === 'pro' && `Pro plan: ${resumes.length} resumes`}
            </p>
          </div>
          <Link
            href="/create"
            className="px-6 py-3 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition"
          >
            + New Resume
          </Link>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="border border-white/15 rounded-xl p-12 backdrop-blur bg-white/5 max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">No resumes yet</h3>
              <p className="text-white/70 mb-6">
                Create your first professional resume with ResumeX
              </p>
              <Link
                href="/create"
                className="inline-block px-6 py-3 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff]"
              >
                Get Started
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="border border-white/15 rounded-xl p-6 backdrop-blur bg-white/5 hover:border-white/30 transition"
              >
                <h3 className="text-xl font-semibold mb-2">{resume.title}</h3>
                <p className="text-sm text-white/50 mb-4">
                  {new Date(resume.updated_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/editor/${resume.id}`}
                    className="flex-1 text-center py-2 px-4 rounded-lg bg-[#8c45ff]/20 hover:bg-[#8c45ff]/30 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
