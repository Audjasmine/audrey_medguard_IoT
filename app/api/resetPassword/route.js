import { connect } from "@/utils/connect";
import User from "@/models/user";
import { NextResponse } from 'next/server';
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { password, email } = await req.json();

        await connect();

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return NextResponse.json({
                message: "User not found"
            }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        user.resetToken = undefined;
        user.resetTokenExpires = undefined;

        try {
            await user.save();
        } catch (error) {
            console.log(error);
        }

        return NextResponse.json({
            message: "Password reset successful"
        }, { status: 200 });

    } catch (error) {
        console.error("Error while resetting password", error);
        return NextResponse.json({ message: "Error while resetting password" }, { status: 500 });
    }
}

