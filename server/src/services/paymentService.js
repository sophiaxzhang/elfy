import { PaymentModel } from '../models/paymentModel.js';
import { UserModel } from '../models/userModel.js';
import axios from 'axios';

export const PaymentService = {
    async pullFunds({ userId, amount, cardId, pin }) {
        try {
            // Get payment method details
            const paymentMethod = await PaymentModel.getPaymentMethodById(cardId, userId);
            if (!paymentMethod) {
                throw new Error('Payment method not found or does not belong to user');
            }

            // Verify PIN if provided
            if (pin) {
                const parent = await UserModel.findByEmail(paymentMethod.user_email);
                if (!parent || parent.pin !== pin) {
                    throw new Error('Invalid PIN');
                }
            }

            // Generate transaction data for Visa Direct API
            const transactionData = {
                systemsTraceAuditNumber: Math.floor(Math.random() * 900000) + 100000,
                retrievalReferenceNumber: Math.floor(Math.random() * 900000000000) + 100000000000,
                acquiringBin: process.env.VISA_ACQUIRING_BIN || "123456",
                acquirerCountryCode: "840", // US country code
                senderPrimaryAccountNumber: paymentMethod.card_number.replace(/\s/g, ''),
                senderCardExpiryDate: paymentMethod.expiry_date,
                senderCurrencyCode: "840", // USD
                amount: amount.toFixed(2),
                businessApplicationId: "AA", // Account to Account transfer
                merchantCategoryCode: "6012", // Financial institutions
                cardAcceptor: {
                    name: "Elf Payment App",
                    terminalId: "12345678",
                    idCode: "123456789012345",
                    address: {
                        street: "123 Main St",
                        city: "San Francisco",
                        state: "CA",
                        zipCode: "94105",
                        country: "USA"
                    }
                },
                recipientPrimaryAccountNumber: process.env.VISA_RECIPIENT_ACCOUNT || "4111111111111112",
                transactionIdentifier: `TXN_${Date.now()}_${userId}`
            };

            // Make API call to Visa Direct (or your payment processor)
            let apiResponse;
            try {
                // For development, we'll simulate the API call
                // In production, replace with actual Visa Direct API call
                apiResponse = await this.simulateVisaDirectCall(transactionData);
                
                // In production, use this instead:
                // apiResponse = await axios.post(process.env.VISA_DIRECT_API_URL, transactionData, {
                //     headers: {
                //         'Authorization': `Bearer ${process.env.VISA_API_KEY}`,
                //         'Content-Type': 'application/json'
                //     }
                // });
            } catch (apiError) {
                console.error('Visa Direct API error:', apiError);
                throw new Error('Payment processing failed: ' + apiError.message);
            }

            // Create transaction record
            const transaction = await PaymentModel.createTransaction({
                userId,
                paymentMethodId: cardId,
                amount,
                type: 'pull_funds',
                status: apiResponse.status || 'completed',
                transactionId: apiResponse.transactionId || transactionData.transactionIdentifier,
                externalReference: apiResponse.referenceNumber || transactionData.retrievalReferenceNumber,
                responseData: JSON.stringify(apiResponse)
            });

            // Update parent's gift card amount
            await UserModel.updateGiftCardAmount(userId, amount);

            return transaction;

        } catch (error) {
            console.error('Pull funds service error:', error);
            throw error;
        }
    },

    async simulateVisaDirectCall(transactionData) {
        // Simulate API response for development
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'completed',
                    transactionId: transactionData.transactionIdentifier,
                    referenceNumber: transactionData.retrievalReferenceNumber,
                    amount: transactionData.amount,
                    message: 'Transaction completed successfully'
                });
            }, 1000); // Simulate network delay
        });
    },

    async getPaymentMethods(userId) {
        try {
            return await PaymentModel.getPaymentMethodsByUserId(userId);
        } catch (error) {
            console.error('Get payment methods service error:', error);
            throw error;
        }
    },

    async getTransactionHistory(userId, limit = 10, offset = 0) {
        try {
            return await PaymentModel.getTransactionsByUserId(userId, limit, offset);
        } catch (error) {
            console.error('Get transaction history service error:', error);
            throw error;
        }
    },

    async getTransactionStatus(transactionId) {
        try {
            return await PaymentModel.getTransactionById(transactionId);
        } catch (error) {
            console.error('Get transaction status service error:', error);
            throw error;
        }
    }
};
