import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request){

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session');

    if (error) return NextResponse.json({error}, {status: 400})
    if (!code) return NextResponse.json({error: 'No access code'}, {status: 400});

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {

        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({

            code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
            grant_type: "authorization_code",

        }),

    });

    const token = await tokenResponse.json();

    return NextResponse.json(token);
    
}