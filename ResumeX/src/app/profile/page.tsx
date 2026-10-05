'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Header } from '@/sections/Header';

const profileTypes = [
  { value: 'fresher', label: 'Fresher', description: 'Student or recent graduate' },
  { value: 'experienced', label: 'Experienced', description: 'Several years in the workforce' },
  { value: 'tech', label: 'Tech', description: 'Engineering, data or IT roles' },
  { value: 'non_tech', label: 'Non-Tech', description: 'Business, sales, operations and more' },
];

const signInMethods = [
  { key: 'password', label: 'Email & password' },
  { key: 'google', label: 'Google' },
  { key: 'github', label: 'GitHub' },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const [profileType, setProfileType] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    setProfileType(user?.profile_type || '');
  }, [user?.profile_type]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateProfile(profileType);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const isConnected = (method: (typeof signInMethods)[number]['key']) =>
    method === 'password' ? Boolean(user.has_password) : Boolean(user.providers?.includes(method));

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <div>
          <h1 className="text-5xl font-medium tracking-tighter">Profile</h1>
          <p className="text-white/70 mt-2">Manage your account and resume preferences.</p>
        </div>

        {/* Account */}
        <section className="border border-white/15 rounded-xl p-6 backdrop-blur bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)]">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-none rounded-full inline-flex items-center justify-center text-2xl font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] border border-white/15">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xl font-medium truncate">{user.email}</div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold capitalize">
                  {user.plan} plan
                </span>
                {user.created_at && (
                  <span className="text-sm text-white/50">
                    Member since{' '}
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6 flex-wrap">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition"
            >
              Go to dashboard
            </Link>
            {user.plan === 'free' && (
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition"
              >
                See Pro features
              </Link>
            )}
          </div>
        </section>

        {/* Profile type */}
        <section className="border border-white/15 rounded-xl p-6 backdrop-blur bg-white/5">
          <h2 className="text-xl font-semibold">Profile type</h2>
          <p className="text-white/70 text-sm mt-1">
            Used to tailor template suggestions to your career stage.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 mt-5">
            {profileTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setProfileType(type.value)}
                className={twMerge(
                  'text-left border border-white/15 rounded-lg p-4 transition hover:border-white/30',
                  profileType === type.value && 'border-[#A369FF] bg-[#8c45ff]/10'
                )}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-white/50 mt-1">{type.description}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !profileType || profileType === user.profile_type}
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_20px_#8c45ff] transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {message && (
              <span
                className={twMerge(
                  'text-sm',
                  message.type === 'success' ? 'text-emerald-300' : 'text-red-300'
                )}
              >
                {message.text}
              </span>
            )}
          </div>
        </section>

        {/* Sign-in methods */}
        <section className="border border-white/15 rounded-xl p-6 backdrop-blur bg-white/5">
          <h2 className="text-xl font-semibold">Sign-in methods</h2>
          <p className="text-white/70 text-sm mt-1">Ways you can sign in to this account.</p>

          <div className="mt-5 divide-y divide-white/10 border border-white/15 rounded-lg">
            {signInMethods.map((method) => {
              const connected = isConnected(method.key);
              return (
                <div key={method.key} className="flex items-center justify-between px-4 py-3">
                  <span>{method.label}</span>
                  <span
                    className={twMerge(
                      'text-xs rounded-full px-2 py-0.5 border',
                      connected
                        ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10'
                        : 'border-white/15 text-white/50'
                    )}
                  >
                    {connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/20 hover:bg-red-500/30 transition"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}
