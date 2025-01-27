import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
    matcher: ["/dashboard", "/userDetails"],
};

export default async function middleware(req) {
    console.log('Middleware is running for:', req.nextUrl.pathname);

    const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET });
    console.log(token);

    if (!token) {
        const signInUrl = new URL('/auth/signIn', req.nextUrl.origin);
        signInUrl.searchParams.set('callbackUrl', encodeURIComponent(req.nextUrl.pathname));
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}
