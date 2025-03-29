'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';

export function AuthButton() {
  return (
    <Link href="/api/auth/signin">
      <Button variant="outline" size="sm">
        <UserIcon className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    </Link>
  );
}