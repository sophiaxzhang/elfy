import { ChoreModel } from '../models/choreModel.js'

//handles logic
export const ChoreService = {
    async getChores(parentId){
        const chores = await ChoreModel.getChores(parentId);
        console.log("chores:", chores);
        return chores;
    },

    async createChore(chore){
        const {name, desc, gems, child_id, parent_id, location} = chore
        const createdChild = await ChoreModel.create({ name, desc, gems, child_id, parent_id, location });
        return createdChild;
    }
}
