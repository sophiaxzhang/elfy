export interface Child {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  totalGemsEarned: number;
  currentGoal: number;
  completedTasks: number;
  totalTasks: number;
}

export interface Parent {
  id: string;
  name: string;
  children: Child[];
}
