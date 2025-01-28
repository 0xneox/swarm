import React, { useEffect, useState } from 'react';
import { taskService } from '../../services/taskService';
import TaskCard from './components/TaskCard';
import TaskFilters from './components/TaskFilters';
import { MarketplaceContainer, TaskGrid } from './styles';

const TaskMarketplace = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    rewardType: 'all',
    hardware: 'all',
    duration: 'all'
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      const availableTasks = await taskService.fetchAvailableTasks();
      setTasks(availableTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleTaskStart = async (taskId) => {
    try {
      await taskService.startTask(taskId);
      loadTasks(); // Refresh task list
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  return (
    <MarketplaceContainer>
      <TaskFilters 
        filters={filters}
        onFilterChange={setFilters}
      />
      <TaskGrid>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onStart={() => handleTaskStart(task.id)}
          />
        ))}
      </TaskGrid>
    </MarketplaceContainer>
  );
};

export default TaskMarketplace;
