import { atom } from 'recoil';

export const swarmState = atom({
  key: 'swarmState',
  default: {
    id: null,
    members: [],
    totalPower: 0,
    activeTask: null
  }
});

class SwarmService {
  constructor() {
    this.ws = null;
    this.swarmId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect(userId) {
    try {
      this.ws = new WebSocket('wss://swarm.neurolov.xyz');
      
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

      return new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          this.joinSwarm(userId);
          this.reconnectAttempts = 0;
          resolve(true);
        };

        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'SWARM_JOINED':
          this.swarmId = data.swarmId;
          break;
        case 'TASK_ASSIGNED':
          this.handleTaskAssignment(data.task);
          break;
        case 'MEMBER_UPDATE':
          this.handleMemberUpdate(data.members);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.attemptReconnect();
  }

  handleClose() {
    console.log('WebSocket connection closed');
    this.attemptReconnect();
  }

  async attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(async () => {
        try {
          await this.connect(this.userId);
        } catch (error) {
          console.error('Reconnection attempt failed:', error);
        }
      }, backoffTime);
    }
  }

  async joinSwarm(userId) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'JOIN_SWARM',
        userId
      }));
    }
  }

  async leaveSwarm() {
    if (this.ws?.readyState === WebSocket.OPEN && this.swarmId) {
      this.ws.send(JSON.stringify({
        type: 'LEAVE_SWARM',
        swarmId: this.swarmId
      }));
      this.ws.close();
    }
  }

  private handleTaskAssignment(task) {
    // Implement task assignment logic
  }

  private handleMemberUpdate(members) {
    // Implement member update logic
  }
}

export const swarmService = new SwarmService();
