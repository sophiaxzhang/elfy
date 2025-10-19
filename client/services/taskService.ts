import { getToken } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface Task {
  id: string;
  name: string;
  gems: number;
  location: string;
  status?: string;
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
  status?: string;
}

export const TaskService = {
  async createTask(taskData: CreateTaskRequest, token?: string): Promise<Task> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const result = await response.json();
      return result.task;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  async getTasksByChild(childId: number, token?: string): Promise<Task[]> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/api/tasks/child/${childId}`, {
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

  async getTasksByParent(parentId: number, token?: string): Promise<Task[]> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/api/tasks/parent/${parentId}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const result = await response.json();
      return result.task;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string, token?: string): Promise<void> {
    try {
      const authToken = token || await getToken();
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
