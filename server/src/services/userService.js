import { UserModel } from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
const saltRounds = 10;

//handles logic
export const UserService = {
    async createUser(newUser) {
        const {name, email, pin, password} = newUser;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const createdUser = await UserModel.create({ name, email, pin, password:hashedPassword });

        const accessToken = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: createdUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        console.log(createdUser);
        console.log("access token: " + accessToken);
        console.log("refresh token: " + refreshToken);
        return { accessToken: accessToken, refreshToken: refreshToken, user: createdUser }; 
    },
    async createChild(newChild){
        const {name, parentId, gem} = newChild;
        const createdChild = await UserModel.createChild({ name, parentId, gem });
        return createdChild;
    },

    async loginUser(email, password){
        //return token !!!
        const user = await UserModel.findByEmail(email);
        if(!user){
            return null;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            return null;
        }
        else{
            const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            console.log("access token: " + accessToken);
            console.log("refresh token: " + refreshToken);
            return { accessToken: accessToken, refreshToken: refreshToken, user: user };
        }
    },

    async updateTokenConfig(userId, tokenConfig) {
        const { numberOfTokens, giftCardAmount } = tokenConfig;
        const updatedConfig = await UserModel.updateTokenConfig({ 
            userId, 
            numberOfTokens: parseInt(numberOfTokens), 
            giftCardAmount: parseFloat(giftCardAmount) 
        });
        return updatedConfig;
    },

    async saveFamilySetup(userId, familyData) {
        console.log('saveFamilySetup called with:', { userId, familyData });
        const { email, password, pin, children } = familyData;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log('About to call upsertParentInfo with:', { userId, email, pin, children });
        
        // Update parent information including children as JSON array
        const updatedParent = await UserModel.upsertParentInfo({ 
            userId: parseInt(userId), // Convert to number
            email, 
            password: hashedPassword, 
            pin,
            children: children || [] // Save children as JSON array
        });
        
        console.log('upsertParentInfo result:', updatedParent);
        
        return { parent: updatedParent, children: children || [] };
    }
}

export const refreshToken = (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
      //res.json({ accessToken });
      return accessToken;
    } catch (error) {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  };