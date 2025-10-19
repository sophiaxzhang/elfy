import { ChoreService } from "../services/choreService.js"

//handles requests - calls services
export const ChoreController = {
    async createChore(req, res){
        console.log("=== CREATE CHORE REQUEST ===");
        console.log("incoming chore body:", req.body);
        try {
            const newChore = await ChoreService.createChore(req.body);
            console.log("Created chore:", newChore);
            res.status(200).json({ success: true, task: newChore });
            
        } catch (error) {
            console.error("chore creation error:", error);
            res.status(500).json({ message: "internal server error", errorCode: error.code });
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
    },

    async getChoresByChild(req, res) {
        console.log("=== GET CHORES BY CHILD REQUEST ===");
        console.log("Request params:", req.params);
        console.log("Request headers:", req.headers);
        try {
            const { childId } = req.params;
            console.log("Child ID:", childId);
            const chores = await ChoreService.getChoresByChild(childId);
            console.log("Found chores:", chores);
            res.status(200).json({ success: true, tasks: chores });
        } catch (error) {
            console.error("get chores by child error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    },

    async getChoresByParent(req, res) {
        console.log("=== GET CHORES BY PARENT REQUEST ===");
        try {
            const { parentId } = req.params;
            const chores = await ChoreService.getChoresByParent(parentId);
            res.status(200).json({ success: true, tasks: chores });
        } catch (error) {
            console.error("get chores by parent error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    },

    async getChoreById(req, res) {
        console.log("=== GET CHORE BY ID REQUEST ===");
        try {
            const { id } = req.params;
            const chore = await ChoreService.getChoreById(id);
            res.status(200).json({ success: true, task: chore });
        } catch (error) {
            console.error("get chore by id error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    },

    async updateChore(req, res) {
        console.log("=== UPDATE CHORE REQUEST ===");
        console.log("Request params:", req.params);
        console.log("Request body:", req.body);
        try {
            const { id } = req.params;
            const updates = req.body;
            console.log("Updating chore with ID:", id, "Updates:", updates);
            const chore = await ChoreService.updateChore(id, updates);
            console.log("Updated chore:", chore);
            res.status(200).json({ success: true, task: chore });
        } catch (error) {
            console.error("update chore error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    },

    async deleteChore(req, res) {
        console.log("=== DELETE CHORE REQUEST ===");
        try {
            const { id } = req.params;
            const chore = await ChoreService.deleteChore(id);
            res.status(200).json({ success: true, task: chore });
        } catch (error) {
            console.error("delete chore error:", error);
            res.status(500).json({ message: "internal server error" });
        }
    }
}