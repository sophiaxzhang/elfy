import { ChoreService } from "../services/choreService.js"

//handles requests - calls services
export const ChoreController = {
    async createChore(req, res){
        console.log("incoming chore body:", req.body);
        try {
            const newUser = await ChoreService.createChore(req.body);
            res.status(200).json(newUser);
            
        } catch (error) {
            console.error("chore creation error:", error);
            res.status(500).send({message: "internal server error", errorCode: error.code});
        }
    },

    async getChores(req, res){
        console.log("incoming chores body:", req.body);
        try {
            const chores = await ChoreService.getChores(req.body);
            res.status(200).json(chores);
        } catch (error) {
            console.error("chore retrieval error:", error);
            res.status(500).send({message: "internal server error"});
        }
    }
}