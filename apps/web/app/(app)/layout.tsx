'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { claims, ready } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !claims) router.replace('/login');
  }, [ready, claims, router]);

  if (!ready || !claims) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
