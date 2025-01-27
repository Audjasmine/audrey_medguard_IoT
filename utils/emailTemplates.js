export const emailTemplates = {
    registration: (userName) => ({
        subject: "Welcome to audrey! 🌱",
        message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2E7D32;">Welcome to audrey!</h1>
                <h2>Hi ${userName},</h2>
                <p>Thank you for joining audrey! We're excited to have you as part of our farming community.</p>
                <p>With your new account, you can:</p>
                <ul>
                    <li>Manage your farm profile</li>
                    <li>Track your farming activities</li>
                    <li>Connect with other farmers</li>
                    <li>Access farming resources and tools</li>
                </ul>
                <p>Get started by completing your farm profile!</p>
                <p>Best regards,<br/>The audrey Team</p>
            </div>
        `
    }),
    
    profileUpdate: (userName, updates) => ({
        subject: "Profile Updated Successfully ✅",
        message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2E7D32;">Profile Update Confirmation</h1>
                <h2>Hi ${userName},</h2>
                <p>Your profile has been successfully updated with the following changes:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    ${Object.entries(updates)
                        .filter(([key, value]) => value && !key.includes('password'))
                        .map(([key, value]) => `<p><strong>${key.replace('_', ' ').toUpperCase()}:</strong> ${value}</p>`)
                        .join('')}
                </div>
                <p>If you didn't make these changes, please contact our support team immediately.</p>
                <p>Best regards,<br/>The audrey Team</p>
            </div>
        `
    }),

    passwordReset: (resetUrl) => ({
        subject: "Password Reset Request - audrey 🔐",
        message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2E7D32;">Password Reset Request</h1>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>If you didn't request this, please ignore this email. The link will expire in 1 hour.</p>
                <p>Best regards,<br/>The audrey Team</p>
            </div>
        `
    })
}
