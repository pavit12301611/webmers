export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  // For production: send to PostHog / Mixpanel / custom endpoint
  console.log('[Analytics]', eventName, properties);
}
