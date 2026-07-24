import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder for database query
  const listings = [
    {
      id: '1',
      title: 'Meridian SaaS',
      description: 'A fully-built SaaS landing page with modern design.',
      price: 299,
      category: 'SaaS',
      techStack: ['Next.js', 'Tailwind', 'Stripe'],
      images: [],
      status: 'ACTIVE',
    },
  ];
  return NextResponse.json({ listings });
}
