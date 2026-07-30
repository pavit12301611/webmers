import { randomUUID } from 'crypto';

export interface CodeUnlockDelivery {
  orderId: string;
  buyerEmail: string;
  downloadUrl: string;
  expiresAt: Date;
  delivered: boolean;
}

const deliveries: CodeUnlockDelivery[] = [];

export function createCodeDelivery(orderId: string, buyerEmail: string): CodeUnlockDelivery {
  const delivery: CodeUnlockDelivery = {
    orderId,
    buyerEmail,
    downloadUrl: `https://deliver.webmers.io/download/${randomUUID()}?o=${orderId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    delivered: false,
  };
  deliveries.push(delivery);
  return delivery;
}

export function getCodeDelivery(orderId: string): CodeUnlockDelivery | null {
  return deliveries.find((d) => d.orderId === orderId) ?? null;
}

export function markDelivered(orderId: string): boolean {
  const d = deliveries.find((d) => d.orderId === orderId);
  if (d) {
    d.delivered = true;
    return true;
  }
  return false;
}
