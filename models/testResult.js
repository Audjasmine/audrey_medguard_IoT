import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const testResultSchema = new mongoose.Schema({
    executionId: {
        type: String,
        required: true,
        unique: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase',
        required: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'running', 'completed', 'failed'],
        default: 'pending'
    },
    results: {
        passed: {
            type: Boolean,
            default: false
        },
        findings: [{
            type: {
                type: String,
                enum: ['authentication', 'encryption', 'access_control', 'configuration']
            },
            severity: {
                type: String,
                enum: ['low', 'medium', 'high']
            },
            description: String
        }],
        metrics: {
            responseTime: Number,
            resourceUsage: Number,
            securityScore: Number
        }
    },
    metadata: {
        environment: {
            type: String,
            default: 'production'
        },
        executor: {
            type: String,
            default: 'system'
        },
        version: {
            type: String,
            default: '1.0'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

// Update the updatedAt field on save
testResultSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const TestResult = refreshModel('TestResult', testResultSchema);

export default TestResult;