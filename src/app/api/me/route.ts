import { NextResponse } from 'next/server';
import { authUser } from '@/app/lib/auth';

export async function GET(_req: Request) {
  const user = await authUser();
  if (!user) return NextResponse.json(null, { status: 401 });
  return NextResponse.json(user);
}
