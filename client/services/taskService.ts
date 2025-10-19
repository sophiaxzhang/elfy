import { getToken } from './authService';
import { IP_ADDRESS, PORT } from '@env';

const API_BASE_URL = `http://${IP_ADDRESS}:${PORT}`;

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

export interface CreateTaskRequest {
  name: string;
  gems: number;
  location: string;
  desc?: string;
  child_id: number;
  parent_id: number;
}

export interface UpdateTaskRequest {
  name?: string;
  gems?: number;
  location?: string;
  desc?: string;
  status?: number; // 0: not_started, 1: in_progress, 2: waiting_approval, 3: completed
}

export const TaskService = {
  async createTask(taskData: CreateTaskRequest, token?: string): Promise<Task> {
    try {
      const authToken = token || await getToken();
      console.log('TaskService.createTask called with:', taskData);
      
      const response = await fetch(`${API_BASE_URL}/chore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(taskData),
      });

      console.log('Create task response status:', response.status);
      console.log('Create task response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Create task error response:', errorText);
        throw new Error(`Failed to create task: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Create task result:', result);
      return result.task;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  async getTasksByChild(childId: number, token?: string): Promise<Task[]> {
    try {
      const authToken = token || await getToken();
      console.log('TaskService.getTasksByChild called with:', { childId, authToken: authToken ? 'present' : 'missing' });
      
      const response = await fetch(`${API_BASE_URL}/chore/child/${childId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Response data:', result);
      return result.tasks;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },

  async getTasksByParent(parentId: number, token?: string): Promise<Task[]> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/chore/parent/${parentId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      return result.tasks;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: UpdateTaskRequest, token?: string): Promise<Task> {
    try {
      const authToken = token || await getToken();
      console.log('TaskService.updateTask called with:', { taskId, updates });
      
      const response = await fetch(`${API_BASE_URL}/chore/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });

      console.log('Update task response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update task error response:', errorText);
        throw new Error(`Failed to update task: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Update task result:', result);
      return result.task;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string, token?: string): Promise<void> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/chore/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  },

  async getTask(taskId: string, token?: string): Promise<Task> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/chore/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const result = await response.json();
      return result.task;
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  }
};
