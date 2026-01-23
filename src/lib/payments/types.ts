export interface PaymentProvider {
  /**
   * Create a checkout URL for a user to complete payment
   */
  createCheckoutUrl(userId: string, email: string): Promise<string>;

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
  customerId?: string;
  paid?: boolean;
  error?: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}
