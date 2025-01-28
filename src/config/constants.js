export const CONFIG = {
  SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  SWARM_WS: import.meta.env.VITE_SWARM_WS || 'ws://localhost:3002',
  MIN_TFLOPS_REQUIRED: 8,
  TOKEN_DECIMALS: 9,
  TASK_TYPES: {
    TRAINING: 'training',
    INFERENCE: 'inference',
    FINE_TUNING: 'fine-tuning'
  }
};
