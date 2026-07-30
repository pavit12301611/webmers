import { NextResponse } from 'next/server';

/** Lightweight liveness endpoint for load balancers and uptime monitors. */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'webmers',
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
