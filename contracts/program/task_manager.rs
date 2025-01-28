use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[program]
pub mod task_manager {
    use super::*;

    pub fn create_task(ctx: Context<CreateTask>, task_data: TaskData) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.owner = ctx.accounts.authority.key();
        task.data = task_data;
        task.status = TaskStatus::Active;
        task.created_at = Clock::get()?.unix_timestamp;
        
        // Emit task creation event
        emit!(TaskCreated {
            task_id: task.key(),
            owner: task.owner,
            reward: task.data.reward,
        });

        Ok(())
    }

    pub fn assign_task(ctx: Context<AssignTask>, swarm_id: String) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(!task.is_assigned(), ErrorCode::TaskAlreadyAssigned);

        task.assigned_to = Some(ctx.accounts.swarm.key());
        task.assigned_at = Some(Clock::get()?.unix_timestamp);

        emit!(TaskAssigned {
            task_id: task.key(),
            swarm_id: swarm_id,
        });

        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>, result: Vec<u8>, compute_proof: Vec<u8>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(!task.is_completed(), ErrorCode::TaskAlreadyCompleted);
        
        // Verify computation result
        require!(verify_computation(&compute_proof, &result), ErrorCode::InvalidComputeProof);

        task.status = TaskStatus::Completed;
        task.result = Some(result);
        task.completed_at = Some(Clock::get()?.unix_timestamp);

        // Calculate and distribute rewards
        let reward_amount = calculate_reward(task, ctx.accounts.swarm.performance_score);
        distribute_rewards(ctx, reward_amount)?;

        emit!(TaskCompleted {
            task_id: task.key(),
            reward: reward_amount,
        });

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TaskData {
    pub task_type: String,
    pub requirements: Vec<u8>,
    pub reward: u64,
    pub deadline: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TaskStatus {
    Active,
    Assigned,
    Completed,
    Failed,
}

#[account]
pub struct Task {
    pub owner: Pubkey,
    pub data: TaskData,
    pub status: TaskStatus,
    pub assigned_to: Option<Pubkey>,
    pub result: Option<Vec<u8>>,
    pub created_at: i64,
    pub assigned_at: Option<i64>,
    pub completed_at: Option<i64>,
}

// Events
#[event]
pub struct TaskCreated {
    pub task_id: Pubkey,
    pub owner: Pubkey,
    pub reward: u64,
}

#[event]
pub struct TaskAssigned {
    pub task_id: Pubkey,
    pub swarm_id: String,
}

#[event]
pub struct TaskCompleted {
    pub task_id: Pubkey,
    pub reward: u64,
}

// Error handling
#[error_code]
pub enum ErrorCode {
    TaskAlreadyAssigned,
    TaskAlreadyCompleted,
    InvalidComputeProof,
    InsufficientReward,
}

// Helper functions
fn verify_computation(proof: &[u8], result: &[u8]) -> bool {
    // Implement verification logic
    true // Placeholder
}

fn calculate_reward(task: &Task, performance_score: u64) -> u64 {
    // Implement reward calculation logic
    task.data.reward * performance_score / 100
}

fn distribute_rewards(ctx: Context<CompleteTask>, amount: u64) -> Result<()> {
    // Implement reward distribution logic
    Ok(())
}
