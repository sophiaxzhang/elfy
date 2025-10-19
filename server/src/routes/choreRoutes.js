import { Router } from "express";
import { ChoreController } from "../controllers/choreController.js";
import { verifyToken } from "../middlewares/validationMiddleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

router.post('/', ChoreController.createChore);
router.get('/get-chores', ChoreController.getChores);
router.get('/child/:childId', ChoreController.getChoresByChild);
router.get('/parent/:parentId', ChoreController.getChoresByParent);
router.get('/:id', ChoreController.getChoreById);
router.put('/:id', ChoreController.updateChore);
router.delete('/:id', ChoreController.deleteChore);

export default router;