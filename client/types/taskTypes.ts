export interface Task {
  id: string;
  name: string;
  gems: number;
  location: string;
  status: number; // 0: not_started, 1: in_progress, 2: waiting_approval, 3: completed
  desc?: string;
  child_id: number;
  parent_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'waiting_approval' | 'completed';

// Status mapping for integer values
export const STATUS_MAP = {
  0: 'not_started' as const,
  1: 'in_progress' as const,
  2: 'waiting_approval' as const,
  3: 'completed' as const,
} as const;

// Reverse mapping for converting string status to integer
export const STATUS_TO_INT = {
  'not_started': 0,
  'in_progress': 1,
  'waiting_approval': 2,
  'completed': 3,
} as const;

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
