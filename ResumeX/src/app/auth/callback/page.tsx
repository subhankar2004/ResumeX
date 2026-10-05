'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Landing page for OAuth redirects: the backend passes the JWT in the URL fragment
export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    // Strict mode runs effects twice in development; only consume the token once
    if (handled.current) return;
    handled.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    // Remove the token from the address bar and browser history
    window.history.replaceState(null, '', window.location.pathname);

    if (!token) {
      router.replace('/login?error=' + encodeURIComponent('Sign-in failed, please try again'));
      return;
    }

    loginWithToken(token)
      .then(() => router.replace('/'))
      .catch(() =>
        router.replace('/login?error=' + encodeURIComponent('Sign-in failed, please try again'))
      );
  }, [loginWithToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Signing you in...</div>
    </div>
  );
}
