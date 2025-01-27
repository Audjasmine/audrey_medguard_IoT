import { connect } from "@/utils/connect";
import User from "@/models/user";
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { token } = await req.json();

        await connect();

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token and not expired
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
                { status: 400 }
            );
        }

        // Return user data (excluding sensitive information)
        const userData = {
            id: user._id,
            email: user.email,
            name: user.name
        };

        return NextResponse.json({ 
            message: "Token verified",
            user: userData 
        }, { status: 200 });

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { message: "Error verifying token" },
            { status: 500 }
        );
    }
}
