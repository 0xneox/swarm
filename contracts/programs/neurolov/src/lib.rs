use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("NEURoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod neurolov {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.total_staked = 0;
        pool.reward_rate = 100; // 1 NEURO per computation unit
        Ok(())
    }

    pub fn create_task(ctx: Context<CreateTask>, computation_units: u64, reward: u64) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.creator = ctx.accounts.creator.key();
        task.computation_units = computation_units;
        task.reward = reward;
        task.status = TaskStatus::Open;
        
        // Transfer reward to escrow
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, reward)?;
        
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>, result_hash: [u8; 32]) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Open, ErrorCode::InvalidTaskStatus);
        
        // Verify computation result
        if !verify_computation_result(&result_hash) {
            return Err(ErrorCode::InvalidComputationResult.into());
        }
        
        // Distribute rewards
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.worker_token_account.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, task.reward)?;
        
        task.status = TaskStatus::Completed;
        task.completed_by = Some(ctx.accounts.worker.key());
        
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
    Failed,
}

#[error_code]
pub enum ErrorCode {
    InvalidTaskStatus,
    InvalidComputationResult,
    InsufficientReward,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub total_staked: u64,
    pub reward_rate: u64,
}

#[account]
pub struct Task {
    pub creator: Pubkey,
    pub computation_units: u64,
    pub reward: u64,
    pub status: TaskStatus,
    pub completed_by: Option<Pubkey>,
}

// ... Additional implementation details
