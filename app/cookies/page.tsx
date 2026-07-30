import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
export const metadata: Metadata = { title: 'Cookie policy', description: 'How Webmers uses cookies.' };
export default function CookiesPage() { return <LegalPage eyebrow="Legal" title="Cookie policy" updated="July 30, 2026" sections={[
  { title: 'Essential cookies', body: <p>Webmers uses essential cookies to maintain your secure sign-in session, prevent fraud, and remember security-related preferences. These cookies are required for core functionality.</p> },
  { title: 'Analytics and preferences', body: <p>If optional analytics or preference technologies are enabled, we will request consent where required and provide a way to change that choice.</p> },
  { title: 'Managing cookies', body: <p>You can control cookies through your browser. Disabling essential cookies may prevent sign-in and checkout from working correctly.</p> },
]} />; }
