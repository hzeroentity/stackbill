import Stripe from 'stripe'

// Server-side Stripe instance (for API routes only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})