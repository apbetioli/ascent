export type { PaymentProvider, WebhookResult, CheckoutSession } from "./types";
export { stripeProvider, stripe } from "./stripe";

// Default payment provider
import { stripeProvider } from "./stripe";
export const paymentProvider = stripeProvider;
