import { UserService } from "../services/userService.js"

//handles requests - calls services
export const UserController = {
    async createUser(req, res){
        console.log("=== CREATE USER REQUEST ===");
        console.log("incoming user body:", req.body);
        try {
            const newUser = await UserService.createUser(req.body);
            console.log("User created successfully:", newUser);
            res.status(200).json(newUser);
            
        } catch (error) {
            console.error("user creation error:", error);
            console.error("Error details:", error.message);
            res.status(500).send({message: "internal server error", errorCode: error.code});
        }
    },

    async createChild(req, res){
        console.log("incoming child body:", req.body);
        try {
            const newChild = await UserService.createChild(req.body);
            res.status(200).json(newChild);
        } catch (error) {
            console.error("child creation error:", error);
            res.status(500).send({message: "internal server error"});
        }
    },

    async loginUser(req, res){
        console.log("incoming user body:", req.body);
        try {
            const newLogin = await UserService.loginUser(req.body.email, req.body.password);
            if (!newLogin) {
                // Login failed (user not found or password invalid)
                return res.status(401).json({ success: false, message: "Invalid credentials" });
              }
          
              // Send success response
              return res.status(200).json({ success: true, user: newLogin });
            
        } catch (error) {
            console.error("user login error:", error);
            res.status(500).send({message: "internal server error"});
        }
    },

    //refresh token function
    async refreshToken(req, res){
        const { refreshToken } = req.body;
        try {
            if (!refreshToken) {
                return res.status(401).json({ error: "Refresh token required" });
              }

              try {
                const accessToken = await UserService.refreshToken(refreshToken);
                if (!accessToken) {
                    // Login failed (user not found or password invalid)
                    return res.status(401).json({ success: false, message: "Invalid token" });
                  }
    
                  // Send success response
                  return res.status(200).json({ accessToken });
                
            } catch (error) {
                console.error("user login error:", error);
                res.status(500).send({message: "internal server error"});
            }
        } catch (error) {
            console.error("refresh token error:", error);
            res.status(500).send({message: "internal server error"});
        }
        
        
    },

    async updateTokenConfig(req, res){
        try {
            const { userId, numberOfTokens, giftCardAmount } = req.body;
            console.log("Extracted data:", { userId, numberOfTokens, giftCardAmount });
            
            if (!userId) {
                console.error("Missing userId in request");
                return res.status(400).json({ message: "User ID is required" });
            }
            
            const updatedConfig = await UserService.updateTokenConfig(userId, { numberOfTokens, giftCardAmount });
            res.status(200).json({ success: true, config: updatedConfig });
        } catch (error) {
            console.error("token config update error:", error);
            console.error("Error stack:", error.stack);
            res.status(500).json({message: "internal server error"});
        }
    },

    async saveFamilySetup(req, res){
        console.log("=== FAMILY SETUP REQUEST ===");
        console.log("incoming family setup body:", req.body);
        try {
            const { userId, email, password, pin, children } = req.body;
            console.log("Extracted data:", { userId, email, pin, children });
            const familyData = await UserService.saveFamilySetup(userId, { email, password, pin, children });
            console.log("Family setup completed successfully:", familyData);
            res.status(200).json({ success: true, family: familyData });
        } catch (error) {
            console.error("family setup save error:", error);
            console.error("Error stack:", error.stack);
            res.status(500).send({message: "internal server error"});
        }
    },

    async savePaymentMethod(req, res){
        console.log("=== PAYMENT METHOD REQUEST ===");
        console.log("incoming payment method body:", req.body);
        try {
            const { userId, cardNumber, expiryDate, cvv, cardholderName, billingAddress } = req.body;
            console.log("Extracted payment data:", { userId, cardNumber, expiryDate, cvv, cardholderName, billingAddress });
            const paymentMethod = await UserService.savePaymentMethod(userId, { 
                cardNumber, 
                expiryDate, 
                cvv, 
                cardholderName, 
                billingAddress 
            });
            console.log("Payment method saved successfully:", paymentMethod);
            res.status(200).json({ success: true, paymentMethod });
        } catch (error) {
            console.error("payment method save error:", error);
            console.error("Error stack:", error.stack);
            res.status(500).send({message: "internal server error"});
        }
    },

    async validatePin(req, res) {
        console.log("=== PIN VALIDATION REQUEST ===");
        console.log("incoming pin validation body:", req.body);
        try {
            const { userId, pin } = req.body;
            console.log("Extracted data:", { userId, pin, pinType: typeof pin });
            const isValid = await UserService.validatePin(userId, pin);
            console.log("PIN validation result:", isValid);
            res.status(200).json({ success: true, isValid });
        } catch (error) {
            console.error("pin validation error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    },

    async getFamilyData(req, res) {
        console.log("=== GET FAMILY DATA REQUEST ===");
        try {
            const { userId } = req.params;
            const familyData = await UserService.getFamilyData(userId);
            res.status(200).json({ success: true, family: familyData });
        } catch (error) {
            console.error("get family data error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    },

    async updateChildGems(req, res) {
        console.log("=== UPDATE CHILD GEMS REQUEST ===");
        try {
            const { childId, gemsToAdd } = req.body;
            console.log("Extracted data:", { childId, gemsToAdd });
            
            if (!childId || gemsToAdd === undefined) {
                return res.status(400).json({ message: "Child ID and gems to add are required" });
            }
            
            const updatedChild = await UserService.updateChildGems(childId, gemsToAdd);
            res.status(200).json({ success: true, child: updatedChild });
        } catch (error) {
            console.error("update child gems error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    }
}