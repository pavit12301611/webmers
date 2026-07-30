import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
export const metadata: Metadata = { title: 'Privacy policy', description: 'How Webmers handles personal information.' };
export default function PrivacyPage() { return <LegalPage eyebrow="Legal" title="Privacy policy" updated="July 30, 2026" sections={[
  { title: 'What we collect', body: <p>We collect account details you provide, purchase and support records, and limited technical data needed to operate and secure Webmers.</p> },
  { title: 'How we use it', body: <p>We use information to provide the marketplace, process transactions, prevent abuse, communicate service updates, and meet legal obligations. We do not sell personal information.</p> },
  { title: 'Sharing and retention', body: <p>We share data only with service providers required to run the service, sellers involved in your order, or where law requires it. We retain records only for as long as needed for these purposes.</p> },
  { title: 'Your choices', body: <p>You may request access, correction, deletion, or a copy of your personal information by contacting support. Transaction records may be retained where legally required.</p> },
]} />; }
