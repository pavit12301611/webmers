import Razorpay from 'razorpay';
import { createHmac, timingSafeEqual } from 'crypto';

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay() {
  if (!razorpayConfigured()) throw new Error('Razorpay is not configured');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const actual = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function verifyWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const actual = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}
