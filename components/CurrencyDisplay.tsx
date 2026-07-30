import { useState } from 'react';

export default function CurrencyDisplay({ basePrice }: { basePrice: number }) {
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const rates: Record<string, number> = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 };
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

  const converted = Math.round(basePrice * rates[currency]);

  return (
    <div className="flex items-center gap-2 text-sm text-white/60">
      <span className="font-medium text-white">{symbols[currency]}{converted.toLocaleString()}</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
        className="bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-xs focus:outline-none"
        aria-label="Select currency"
      >
        <option value="INR">INR</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
    </div>
  );
}
