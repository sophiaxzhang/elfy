export interface Task {
  id: string;
  name: string;
  gems: number;
  room: string;
  status: TaskStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'waiting_approval' | 'completed';

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
