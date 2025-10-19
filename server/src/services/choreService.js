import { ChoreModel } from '../models/choreModel.js'

//handles logic
export const ChoreService = {
    async getChores(parentId){
        const chores = await ChoreModel.getChores(parentId);
        console.log("chores:", chores);
        return chores;
    },

    async createChore(chore){
        const {name, desc, gems, child_id, parent_id, location, status} = chore
        const createdChore = await ChoreModel.create({ name, desc, gems, child_id, parent_id, location, status });
        return createdChore;
    },

    async getChoresByChild(childId) {
        console.log('ChoreService.getChoresByChild called with childId:', childId);
        const chores = await ChoreModel.getChoresByChild(childId);
        console.log("chores for child:", chores);
        return chores;
    },

    async getChoresByParent(parentId) {
        const chores = await ChoreModel.getChoresByParent(parentId);
        console.log("chores for parent:", chores);
        return chores;
    },

    async getChoreById(id) {
        const chore = await ChoreModel.getChoreById(id);
        return chore;
    },

    async updateChore(id, updates) {
        console.log('ChoreService.updateChore called with:', { id, updates });
        const chore = await ChoreModel.updateChore(id, updates);
        console.log('ChoreService.updateChore result:', chore);
        return chore;
    },

    async deleteChore(id) {
        const chore = await ChoreModel.deleteChore(id);
        return chore;
    }
}
