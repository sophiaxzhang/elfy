import { Router } from "express";
import { ChoreController } from "../controllers/choreController.js";

const router = Router();

router.post('/', ChoreController.createChore);
router.get('/get-chores', ChoreController.getChores);

export default router;