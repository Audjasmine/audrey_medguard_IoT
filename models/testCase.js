import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const testCaseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    deviceType: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
    },
    securityLevel: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'running', 'passed', 'failed'],
        default: 'pending'
    },
    lastRun: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
testCaseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default refreshModel('TestCase', testCaseSchema);