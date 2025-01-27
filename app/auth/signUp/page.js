"use client";

import { useState } from 'react';
import {
    Card,
    CardTitle,
    CardHeader,
    CardDescription,  
    CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading-button'
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
    const [data, setData] = useState({name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'user', verified: 0})
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    
    const handleInput = (e) => {
        e.preventDefault();
        setData((prev) => ({...prev, [e.target.name]: e.target.value}));
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.name || !data.email || !data.password || !data.confirmPassword) {
            toast.error('All fields are required');
            console.log("all fields are required");
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                // Send welcome email
                const emailResponse = await fetch('/api/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'registration',
                        userData: {
                            name: data.name,
                            email: data.email
                        }
                    })
                });

                if (emailResponse.ok) {
                    console.log('Welcome email sent successfully');
                } else {
                    console.error('Failed to send welcome email');
                }

                toast.success('Account created successfully');
                console.log('Account created successfully');
                router.push('/dashboard');
            } else {
                toast.error('An error occured');
                console.log('An error occured');
            }
        } catch (error) {
            console.log("Error while creating user", error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-32">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                    Create an account to get started.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Name <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            onChange={handleInput}
                        />
                    </div>
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
                        <Label htmlFor="phone">
                            Phone <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter your phone number"
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
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">
                            Confirm Password <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            onChange={handleInput}
                        />
                    </div>
                    <LoadingButton type="submit" className="w-full" loading={isLoading}>
                        Sign Up
                    </LoadingButton>
                </CardContent>
                <div className="mt-2 mb-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/signIn" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </Card>
    )
}