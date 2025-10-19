import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { createUserSchema } from "../schemas/userSchema.js";

const router = Router();

router.post('/', UserController.createUser);
router.post('/child', UserController.createChild);
// router.post('/', validateData(createUserSchema), UserController.createUser);
router.post('/login', UserController.loginUser);
router.post('/refresh-token', UserController.refreshToken);
router.put('/token-config', UserController.updateTokenConfig);
router.put('/family-setup', UserController.saveFamilySetup);
export default router;