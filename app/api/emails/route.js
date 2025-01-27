import { sendMail } from "@/utils/mail"
import { emailTemplates } from "@/utils/emailTemplates"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const body = await request.json()
        const { type, userData } = body

        if (!type || !userData) {
            return NextResponse.json({ 
                message: "Missing required fields", 
            }, { status: 400 });
        }

        const sender = {
            name: "Farmeztool",
            email: process.env.MAIL_USER
        }

        let emailContent;
        switch (type) {
            case 'registration':
                emailContent = emailTemplates.registration(userData.name);
                break;
            case 'profileUpdate':
                emailContent = emailTemplates.profileUpdate(userData.name, userData.updates);
                break;
            default:
                return NextResponse.json({ 
                    message: "Invalid email type", 
                }, { status: 400 });
        }

        const result = await sendMail({
            sender: `${sender.name} <${sender.email}>`,
            receipients: `${userData.name} <${userData.email}>`,
            subject: emailContent.subject,
            message: emailContent.message
        })

        console.log("Email sent successfully:", result);
        return NextResponse.json({ 
            message: "Email sent successfully", 
            result 
        }, { status: 201 });

    } catch (error) {
        console.error("Error sending email:", error.message);
        return NextResponse.json({ 
            message: "Error sending email", 
            error: error.message 
        }, { status: 500 });
    }
}
