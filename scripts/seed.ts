import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (optional)
  await prisma.message.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  // Demo users
  const adminPass = await hash('Admin@123', 12);
  const sellerPass = await hash('Seller@123', 12);
  const buyerPass = await hash('Buyer@123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@webmers.io',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: adminPass,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@webmers.io',
      name: 'Sarah K.',
      role: 'SELLER',
      passwordHash: sellerPass,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@webmers.io',
      name: 'David R.',
      role: 'BUYER',
      passwordHash: buyerPass,
    },
  });

  console.log(`Created users: admin, seller (${seller.id}), buyer (${buyer.id})`);

  // Demo listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: 'Meridian SaaS',
        description: 'A fully-built SaaS landing page with modern design, interactive components, and Stripe-ready checkout.',
        price: 299,
        category: 'SaaS',
        techStack: ['Next.js', 'Tailwind CSS', 'Stripe', 'Framer Motion'],
        images: ['https://picsum.photos/seed/meridian/800/600', 'https://picsum.photos/seed/meridian2/800/600'],
        demoUrl: 'https://demo.webmers.io/meridian',
        status: 'ACTIVE',
        sellerId: seller.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Nocturne Portfolio',
        description: 'Minimal portfolio template for designers and photographers. Clean typography and elegant animations.',
        price: 149,
        category: 'Portfolio',
        techStack: ['React', 'Tailwind CSS', 'GSAP'],
        images: ['https://picsum.photos/seed/nocturne/800/600'],
        demoUrl: 'https://demo.webmers.io/nocturne',
        status: 'ACTIVE',
        sellerId: seller.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Lumina E-commerce',
        description: 'Complete online store with product grids, cart functionality, and secure checkout integration.',
        price: 399,
        category: 'E-commerce',
        techStack: ['Next.js', 'Tailwind CSS', 'Stripe', 'PostgreSQL'],
        images: ['https://picsum.photos/seed/lumina/800/600', 'https://picsum.photos/seed/lumina2/800/600', 'https://picsum.photos/seed/lumina3/800/600'],
        demoUrl: 'https://demo.webmers.io/lumina',
        status: 'ACTIVE',
        sellerId: seller.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Aurora Blog',
        description: 'Editorial blog theme with reading-time estimation, newsletter signup, and category filters.',
        price: 89,
        category: 'Blog',
        techStack: ['Next.js', 'Tailwind CSS', 'Markdown'],
        images: ['https://picsum.photos/seed/aurora/800/600'],
        demoUrl: 'https://demo.webmers.io/aurora',
        status: 'ACTIVE',
        sellerId: seller.id,
      },
    }),
  ]);

  console.log(`Created ${listings.length} demo listings`);

  // Demo orders (escrow PENDING -> PAID -> COMPLETED)
  await Promise.all([
    prisma.order.create({
      data: {
        buyerId: buyer.id,
        listingId: listings[0].id,
        amount: 299,
        status: 'COMPLETED',
        layoutChoice: 'Hero-Centered',
        codeUnlocked: true,
      },
    }),
    prisma.order.create({
      data: {
        buyerId: buyer.id,
        listingId: listings[1].id,
        amount: 149,
        status: 'COMPLETED',
        layoutChoice: 'Split-Screen',
        codeUnlocked: false,
      },
    }),
    prisma.order.create({
      data: {
        buyerId: buyer.id,
        listingId: listings[2].id,
        amount: 399,
        status: 'PENDING',
        layoutChoice: 'Video-Hero',
        codeUnlocked: false,
      },
    }),
  ]);
  console.log('Created demo orders');

  // Reviews
  await Promise.all([
    prisma.review.create({
      data: {
        buyerId: buyer.id,
        listingId: listings[0].id,
        rating: 5,
        comment: 'Incredible design and the editor made customization a breeze.',
        verified: true,
      },
    }),
    prisma.review.create({
      data: {
        buyerId: buyer.id,
        listingId: listings[1].id,
        rating: 4,
        comment: 'Beautiful minimal style. Would recommend for any portfolio.',
        verified: true,
      },
    }),
  ]);
  console.log('Created demo reviews');

  // Wishlist
  await prisma.wishlist.create({
    data: {
      userId: buyer.id,
      listingId: listings[3].id,
    },
  });
  console.log('Created demo wishlist entry');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
