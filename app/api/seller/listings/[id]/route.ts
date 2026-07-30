import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { updateListingStatus, updateListing, deleteListing, ListingStatus } from '@/lib/data';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, data } = await req.json();
  const listingId = params.id;
  const sellerId = session.user.id;

  let success = false;

  if (action === 'status' && data?.status) {
    success = await updateListingStatus(listingId, sellerId, data.status as ListingStatus);
  } else if (action === 'update' && data) {
    success = await updateListing(listingId, sellerId, data);
  } else if (action === 'delete') {
    success = await deleteListing(listingId, sellerId);
  }

  if (!success) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
