import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { TaskDB } from '../database/models/Task';
import { SwarmService } from './swarmService';
import { ComputeService } from './compute';
import { Monitor } from '../utils/monitor';
import { RateLimiter } from '../utils/rateLimiter';

class TaskManager {
    constructor() {
        this.connection = new Connection(process.env.SOLANA_RPC_URL);
        this.program = new Program(/* program config */);
        this.swarmService = new SwarmService();
        this.computeService = new ComputeService();
        this.monitor = new Monitor();
        this.rateLimiter = new RateLimiter({
            windowMs: 15 * 60 * 1000,
            max: 100
        });
    }

    async createTask(data, reward) {
        try {
            // Validate and rate limit
            await this.rateLimiter.checkLimit(data.userId);
            
            const task = new TaskDB({
                data,
                reward,
                status: 'available',
                createdAt: Date.now(),
                requirements: this.calculateRequirements(data)
            });

            await task.save();

            // Create on-chain task
            const transaction = await this.program.methods
                .createTask(data, reward)
                .rpc();

            // Notify swarms
            await this.swarmService.notifyNewTask(task);

            return {
                task: task.toJSON(),
                transaction
            };
        } catch (error) {
            this.monitor.recordError('task_creation', error);
            throw error;
        }
    }

    async assignTask(taskId, swarmId) {
        try {
            const task = await TaskDB.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const swarm = await this.swarmService.getSwarm(swarmId);
            if (!swarm) {
                throw new Error('Swarm not found');
            }

            // Verify swarm capabilities
            await this.verifySwarmCapabilities(swarm, task.requirements);

            task.status = 'assigned';
            task.assignedTo = swarmId;
            task.assignedAt = Date.now();
            await task.save();

            // Update on-chain state
            await this.program.methods
                .assignTask(taskId, swarmId)
                .rpc();

            // Notify swarm members
            await this.swarmService.notifyTaskAssignment(swarmId, task);

            return task;
        } catch (error) {
            this.monitor.recordError('task_assignment', error);
            throw error;
        }
    }

    async completeTask(taskId, result, computeProof, walletAddress) {
        try {
            const task = await TaskDB.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Verify computation result
            const isValid = await this.computeService.verifyComputeProof(
                result,
                computeProof,
                task.data
            );

            if (!isValid) {
                throw new Error('Invalid computation proof');
            }

            // Update task status
            task.status = 'completed';
            task.result = result;
            task.completedAt = Date.now();
            await task.save();

            // Process on-chain completion
            const transaction = await this.program.methods
                .completeTask(result, computeProof)
                .accounts({
                    task: new PublicKey(taskId),
                    user: walletAddress,
                })
                .rpc();

            // Update metrics
            this.monitor.recordTaskCompletion(taskId, walletAddress);

            return {
                task: task.toJSON(),
                transaction
            };
        } catch (error) {
            this.monitor.recordError('task_completion', error);
            throw error;
        }
    }

    private async verifySwarmCapabilities(swarm, requirements) {
        // Implement swarm capability verification
        return true; // Placeholder
    }

    private calculateRequirements(data) {
        // Implement requirement calculation
        return {
            minComputePower: 10,
            preferredHardware: 'GPU',
            estimatedTime: 3600
        };
    }
}

export const taskManager = new TaskManager();
