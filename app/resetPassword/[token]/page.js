"use client";

import { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function ResetPasswordForm({ token }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();

    const verifyToken = useCallback(async () => {
        try {
            const response = await fetch('/api/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                throw new Error('Failed to verify token');
            }

            const data = await response.json();
            setVerified(true);
            setUser(data.user);
        } catch (error) {
            console.error('Error verifying token:', error);
            toast.error('Invalid or expired reset link');
            router.push('/auth/forgotPassword');
        }
    }, [token, router]);

    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            router.push('/auth/forgotPassword');
        }
    }, [token, router, verifyToken]);

    if (!verified) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Verifying Reset Link</CardTitle>
                        <CardDescription>
                            Please wait while we verify your reset link...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: user.email,  
                    password 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reset password');
            }

            toast.success('Password reset successful');
            router.push('/auth/signIn');
        } catch (error) {
            toast.error('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <LoadingButton type="submit" className="w-full" loading={isLoading}>
                            Reset Password
                        </LoadingButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPassword({ params }) {
    const resolvedParams = use(params);
    return <ResetPasswordForm token={resolvedParams.token} />;
}
