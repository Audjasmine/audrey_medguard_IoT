import { connect } from "@/utils/connect";
import User from "@/models/user";
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendMail } from "@/utils/mail";
import { emailTemplates } from '@/utils/emailTemplates';

export async function POST(req) {
    try {
        const { email } = await req.json();

        await connect();

        const exists = await User.findOne({ $or: [{ email }] });

        if (!exists) {
            return NextResponse.json({ message: "email not exists." }, { status: 400 });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const passwordResetExpires = Date.now() + 3600000; 

        exists.resetToken = passwordResetToken;
        exists.resetTokenExpires = passwordResetExpires;
        await exists.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/resetPassword/${resetToken}`;
        console.log(resetUrl);

        const template = emailTemplates.passwordReset(resetUrl);

        await sendMail({
            sender: process.env.MAIL_USER,
            receipients: email,
            subject: template.subject,
            message: template.message
        });

        return NextResponse.json({ message: "Password reset email sent" }, { status: 200 });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ message: "Error sending reset email" }, { status: 500 });
    }
}
