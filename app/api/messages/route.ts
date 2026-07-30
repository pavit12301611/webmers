import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getUserById } from '@/lib/data';

let messagesStore: any[] = [];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ messages: messagesStore });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to, subject, message } = await req.json();
  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newMsg = {
    id: Date.now(),
    from: session.user.name || session.user.email,
    to,
    subject,
    message,
    date: new Date().toISOString(),
  };

  messagesStore.unshift(newMsg);
  return NextResponse.json({ success: true, message: newMsg });
}
