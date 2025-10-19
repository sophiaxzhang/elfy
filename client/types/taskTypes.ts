export interface Task {
  id: string;
  name: string;
  gems: number;
  location: string;
  status?: string; // Optional since your chore table doesn't have this field
  desc?: string;
  child_id: number;
  parent_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'waiting_approval' | 'completed';

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
