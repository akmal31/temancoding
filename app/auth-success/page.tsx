'use client';

import { useEffect } from 'react';

export default function AuthSuccess() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
      window.close();
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <p>Login berhasil. Jendela ini akan tertutup otomatis...</p>
    </div>
  );
}
