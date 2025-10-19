import { PaymentService } from "../services/paymentService.js";

export const PaymentController = {
    async pullFunds(req, res) {
        try {
            console.log("=== PULL FUNDS REQUEST ===");
            console.log("Request body:", req.body);
            
            const { userId, amount, cardId, pin } = req.body;
            
            if (!userId || !amount || !cardId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Missing required fields: userId, amount, and cardId are required" 
                });
            }

            if (parseFloat(amount) <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Amount must be greater than 0" 
                });
            }

            const result = await PaymentService.pullFunds({
                userId: parseInt(userId),
                amount: parseFloat(amount),
                cardId: parseInt(cardId),
                pin
            });

            res.status(200).json({
                success: true,
                message: "Funds pulled successfully",
                transaction: result
            });

        } catch (error) {
            console.error("Pull funds error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    async getPaymentMethods(req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "User ID is required" 
                });
            }

            const paymentMethods = await PaymentService.getPaymentMethods(parseInt(userId));
            
            res.status(200).json({
                success: true,
                paymentMethods
            });

        } catch (error) {
            console.error("Get payment methods error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    async getTransactionHistory(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 10, offset = 0 } = req.query;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "User ID is required" 
                });
            }

            const transactions = await PaymentService.getTransactionHistory(
                parseInt(userId), 
                parseInt(limit), 
                parseInt(offset)
            );
            
            res.status(200).json({
                success: true,
                transactions
            });

        } catch (error) {
            console.error("Get transaction history error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    async getTransactionStatus(req, res) {
        try {
            const { transactionId } = req.params;
            
            if (!transactionId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Transaction ID is required" 
                });
            }

            const status = await PaymentService.getTransactionStatus(transactionId);
            
            res.status(200).json({
                success: true,
                status
            });

        } catch (error) {
            console.error("Get transaction status error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
};
