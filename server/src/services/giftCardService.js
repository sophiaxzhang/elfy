import axios from 'axios';

// Gift Card Service integrates with a third-party API (e.g., Giftbit)
// This module is safe to enable/disable via env vars and provides a
// robust mock when credentials are not present.

const GIFT_CARD_API_BASE_URL = process.env.GIFT_CARD_API_BASE_URL; // e.g., https://api.giftbit.com/papi/v2
const GIFT_CARD_API_KEY = process.env.GIFT_CARD_API_KEY; // set in server/.env
const GIFT_CARD_BRAND_CODE = process.env.GIFT_CARD_BRAND_CODE || 'AMAZON_US';
const GIFT_CARD_SENDER = process.env.GIFT_CARD_SENDER || 'Elf Rewards';
const IS_GIFT_CARD_ENABLED = !!(GIFT_CARD_API_BASE_URL && GIFT_CARD_API_KEY);

export const GiftCardService = {
  /**
   * Purchase a virtual gift card for the given amount (in USD).
   * If credentials are missing, returns a deterministic mock response.
   */
  async purchaseGiftCard({ amountUsd, recipientEmail, note }) {
    const cents = Math.round(Number(amountUsd) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      throw new Error('Invalid gift card amount');
    }

    if (!IS_GIFT_CARD_ENABLED) {
      // Mock response when API credentials are not configured
      const mockCode = `MOCK-GIFTCARD-${Date.now()}`;
      return {
        success: true,
        provider: 'mock',
        brand: GIFT_CARD_BRAND_CODE,
        amountUsd: Number(amountUsd),
        code: mockCode,
        claimUrl: `https://example.com/redeem/${mockCode}`,
        message: 'Mock gift card created (credentials not configured)'
      };
    }

    try {
      // Example Giftbit-like payload; adjust to your provider's spec
      // Placeholder endpoint and headers; insert real values when ready
      const payload = {
        brand_code: GIFT_CARD_BRAND_CODE,
        value: cents, // in cents if provider expects that
        currency: 'USD',
        recipient: recipientEmail || 'no-recipient@example.com',
        sender: GIFT_CARD_SENDER,
        note: note || 'Thanks for your hard work!'
      };

      const response = await axios.post(
        `${GIFT_CARD_API_BASE_URL}/giftcards`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${GIFT_CARD_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      // Normalize provider response
      const data = response.data || {};
      return {
        success: true,
        provider: 'giftcard_api',
        brand: data.brand || GIFT_CARD_BRAND_CODE,
        amountUsd: Number(amountUsd),
        code: data.code || data.token || 'UNKNOWN',
        claimUrl: data.claim_url || data.url || null,
        raw: data
      };
    } catch (error) {
      // Fail closed with a clear error, caller decides how to proceed
      throw new Error(
        `Gift card purchase failed: ${error?.response?.status || ''} ${error?.message || error}`
      );
    }
  }
};

export default GiftCardService;


