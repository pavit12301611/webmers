import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
export const metadata: Metadata = { title: 'Terms of service', description: 'Terms for using the Webmers marketplace.' };
export default function TermsPage() { return <LegalPage eyebrow="Legal" title="Terms of service" updated="July 30, 2026" sections={[
  { title: 'Marketplace role', body: <p>Webmers provides a marketplace for digital website assets. Listing descriptions, delivery commitments, and rights granted by sellers must be accurate and lawful.</p> },
  { title: 'Accounts and purchases', body: <p>You are responsible for your account credentials and for providing accurate information. Prices, taxes, payment processing, and any applicable refund process are shown before purchase.</p> },
  { title: 'Acceptable use', body: <p>Do not misuse the platform, violate intellectual-property rights, attempt unauthorized access, or submit harmful, deceptive, or unlawful content.</p> },
  { title: 'Digital delivery', body: <p>Website assets are digital goods. Ownership, licensing, source-code access, and post-sale support are governed by the listing and order terms presented at checkout.</p> },
]} />; }
