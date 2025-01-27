import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const vulnerabilitySchema = new mongoose.Schema({
    vulnId: {
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
    type: {
        type: String,
        required: true,
        enum: ['authentication', 'authorization', 'encryption', 'data_exposure', 'configuration', 'input_validation']
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical']
    },
    cvssScore: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'in_progress', 'resolved', 'wont_fix'],
        default: 'open'
    },
    discoveredAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    resolvedAt: {
        type: Date,
        required: false
    },
    mitigation: {
        type: String,
        required: false
    },
    affectedComponents: [{
        type: String
    }],
    remediation: {
        steps: [{
            type: String
        }],
        estimatedTime: Number,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        }
    },
    references: [{
        type: String
    }],
    assignedTo: {
        type: String
    }
},
{
    timestamps: true
});

const Vulnerability = refreshModel('Vulnerability', vulnerabilitySchema);

export default Vulnerability;