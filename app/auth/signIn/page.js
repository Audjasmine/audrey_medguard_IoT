"use client";

import { useState } from 'react';
import {
    Card,
    CardTitle,
    CardHeader,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading-button'
import toast from 'react-hot-toast';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const [data, setData] = useState({email: '', password: ''})
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    
    const handleInput = (e) => {
        e.preventDefault();
        setData((prev) => ({...prev, [e.target.name]: e.target.value}));
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.email || !data.password) {
            toast.error('All fields are required');
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });
            
            console.log("SignIn result:", result); // Add this log
            
            if (result?.error) {
                toast.error('Invalid credentials');
            } else {
                toast.success('Logged in successfully');
                console.log("Attempting redirect to /dashboard"); // Add this log
                router.push('/dashboard');
            }
        } catch (error) {
            console.log("Error during login", error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-32">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                    Welcome back! Please login to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            Email <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="johndoe@example.com"
                            onChange={handleInput}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Password <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            onChange={handleInput}
                        />
                    </div>
                    <LoadingButton type="submit" className="w-full" loading={isLoading}>
                        Sign In
                    </LoadingButton>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signUp" className="text-primary hover:underline">
                            Sign Up
                        </Link>
                    </p>
                    <Link href="/auth/forgotPassword" className="text-sm text-primary hover:underline">
                        Forgot Password?
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}