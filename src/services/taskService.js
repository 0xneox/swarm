import { atom, selector } from 'recoil';
import { initializeComputeEnvironment } from '../utils/webgpu';

export const taskListState = atom({
  key: 'taskListState',
  default: []
});

export const activeTaskState = atom({
  key: 'activeTaskState',
  default: null
});

export const taskStatsState = selector({
  key: 'taskStatsState',
  get: ({ get }) => {
    const tasks = get(taskListState);
    return {
      completed: tasks.filter(t => t.status === 'completed').length,
      active: tasks.filter(t => t.status === 'active').length,
      totalEarnings: tasks.reduce((acc, t) => acc + (t.earnings || 0), 0)
    };
  }
});

class TaskService {
  constructor() {
    this.computeEnvironment = null;
  }

  async initialize() {
    try {
      this.computeEnvironment = await initializeComputeEnvironment();
      return true;
    } catch (error) {
      console.error('Failed to initialize compute environment:', error);
      throw error;
    }
  }

  async fetchAvailableTasks() {
    try {
      const response = await fetch('https://api.neurolov.xyz/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async startTask(taskId) {
    try {
      if (!this.computeEnvironment) {
        await this.initialize();
      }

      const response = await fetch(`https://api.neurolov.xyz/tasks/${taskId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start task');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting task:', error);
      throw error;
    }
  }

  async submitTaskResult(taskId, result) {
    try {
      const response = await fetch(`https://api.neurolov.xyz/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result)
      });

      if (!response.ok) {
        throw new Error('Failed to submit task result');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting task result:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
