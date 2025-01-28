import express from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { taskManager } from '../services/taskManager.js';
import { validateTask } from '../middleware/validation.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await taskManager.getAvailableTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', validateTask, async (req, res) => {
  try {
    const { data, reward } = req.body;
    const task = await taskManager.createTask(data, reward);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { result, walletAddress } = req.body;
    
    const completion = await taskManager.completeTask(
      taskId,
      result,
      new PublicKey(walletAddress)
    );
    
    res.json(completion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const taskRouter = router;
