import { Router } from 'express';
import { getDatabase } from '../database/index.js';
import { createSwarm, joinSwarm, leaveSwarm } from '../services/swarmService.js';

const router = Router();

router.post('/create', async (req, res) => {
  try {
    const { walletAddress, gpuScore } = req.body;
    const swarm = await createSwarm(walletAddress, gpuScore);
    res.json(swarm);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/join/:swarmId', async (req, res) => {
  try {
    const { swarmId } = req.params;
    const { walletAddress, gpuScore } = req.body;
    const result = await joinSwarm(swarmId, walletAddress, gpuScore);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const swarmRouter = router;
