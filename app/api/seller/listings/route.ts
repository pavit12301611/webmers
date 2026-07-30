import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getSellerListings, createListing } from '@/lib/data';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user.role === 'SELLER' || session.user.role === 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const listings = await getSellerListings(session.user.id);
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user.role === 'SELLER' || session.user.role === 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, price, category, description, techStack } = body;

  if (!title || !price || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const newListing = await createListing({
    sellerId: session.user.id,
    title,
    price: Number(price),
    category,
    description: description || '',
    techStack: techStack || [],
  });

  return NextResponse.json({ success: true, listing: newListing });
}
