import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
        required: false
    },
    resetTokenExpires: {
        type: Date,
        required: false
    }
},
{
    timestamps: true
});


const User = refreshModel('User', userSchema);

export default User;