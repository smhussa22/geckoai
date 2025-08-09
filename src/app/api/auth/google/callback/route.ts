import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request){

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) return NextResponse.json({error}, {status: 400})
    if (!code) return NextResponse.json({error: 'No access code'}, {status: 400});

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {

        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({

            code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${url.origin}/api/auth/google/callback`,
            grant_type: "authorization_code",

        }),

    });

    if (!tokenResponse.ok) {

        const detail = await tokenResponse.text();
        return NextResponse.redirect(new URL(`/?error=token_exchange_failed&detail=${encodeURIComponent(detail)}`, url));

    }

    const token = await tokenResponse.json() as {

        id_token: string;
        access_token: string;
        refresh_token?: string;
        expires_in: number;
        scope: string;
        token_type: 'Bearer';

    };

    if (!token.id_token) return NextResponse.json({ error: "No ID token from Google" }, { status: 400 });

    const payload = JSON.parse(atob(token.id_token.split('.')[1]));

    const user = {
        
        sub: payload.sub,
        name: payload.name,
        firstName: payload.given_name,
        email: payload.email,
        picture: payload.picture,

    };

    const res = NextResponse.redirect(new URL("/taillink", url));

        res.cookies.set("session", JSON.stringify(user), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,

    });

    return res;
    
}