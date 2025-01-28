import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    data: {
        type: String,
        required: true
    },
    reward: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'completed', 'failed'],
        default: 'available'
    },
    assignedTo: {
        type: String,
        ref: 'Swarm'
    },
    result: String,
    computeProof: String,
    requirements: {
        minComputePower: Number,
        preferredHardware: String,
        estimatedTime: Number
    },
    metrics: {
        startTime: Date,
        completionTime: Date,
        computeTime: Number,
        verificationTime: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// Indexes for performance
TaskSchema.index({ status: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ createdAt: 1 });

// Middleware for automatic updatedAt
TaskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const TaskDB = mongoose.model('Task', TaskSchema);
