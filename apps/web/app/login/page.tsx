'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const { login, claims, ready } = useAuth();
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('password123');
  const [organizationCode, setOrganizationCode] = React.useState('DEMO');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (ready && claims) router.replace('/');
  }, [ready, claims, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password, organizationCode);
      toast.success(t('login.signedIn'));
      router.replace('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('login.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org">{t('login.org')}</Label>
              <Input
                id="org"
                value={organizationCode}
                onChange={(e) => setOrganizationCode(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">{t('login.username')}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? t('login.signingIn') : t('login.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
