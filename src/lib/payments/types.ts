export interface PaymentProvider {
  /**
   * Create a checkout URL for a user to complete payment
   * @param email - Email address (optional, Stripe will collect if not provided)
   * @param userId - User ID (optional, for existing users)
   */
  createCheckoutUrl(email?: string, userId?: string): Promise<string>;

  /**
   * Handle incoming webhook from payment provider
   */
  handleWebhook(req: Request): Promise<WebhookResult>;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}

export interface WebhookResult {
  success: boolean;
  userId?: string;
  email?: string;
  customerId?: string;
  sessionId?: string;
  paid?: boolean;
  error?: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}
