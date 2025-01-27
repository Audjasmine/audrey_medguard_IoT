import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['monitor', 'sensor', 'wearable', 'diagnostic', 'therapeutic']
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'maintenance', 'error'],
        default: 'inactive'
    },
    firmware: {
        version: String,
        lastUpdate: Date
    },
    location: {
        ward: String,
        room: String
    },
    lastMaintenance: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Map,
        of: String
    }
},
{
    timestamps: true
});

const Device = refreshModel('Device', deviceSchema);

export default Device;