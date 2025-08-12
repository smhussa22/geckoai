"use server";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { SignJWT } from "jose";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function GET(req: NextRequest) {

  try {

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    
    if (!code || !stateRaw) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL!}/404`); // @todo add an error redirect or something

    let next = "/";

    try {

      const parsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
      if (typeof parsed?.next === "string") next = parsed.next;

    }
    catch (error: any) {

      console.error("Failed to parse state:", error); // @todo add an error redirect or something

    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {

      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({

        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,

      }),

    });

    if (!tokenResponse.ok) {

      const body = await tokenResponse.text();
      console.error("Token exchange failed:", tokenResponse.status, body);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/404`); // @todo add an error redirect or something

    }

    const token = await tokenResponse.json();

    if (!token.id_token || !token.access_token) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/404`); // @todo add an error redirect or something

    const payload = JSON.parse(Buffer.from(token.id_token.split(".")[1], "base64").toString());
    const sub = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const firstName = payload.given_name;
    const picture = payload.picture;
    
    if (!sub || !email) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/404`); // @todo add an error redirect or something

    await prisma.$transaction(async (transaction) => {

      await transaction.user.upsert({

        where: { id: sub },
        create: { id: sub, email, name, firstName, picture },
        update: { email, name, firstName, picture },

      });

      const expiresAt = new Date(Date.now() + (token.expires_in || 3600) * 1000);

      await transaction.googleToken.upsert({

        where: { userId: sub },
        create: {

          userId: sub,
          accessToken: token.access_token,
          refreshToken: token.refresh_token || null,
          scope: token.scope || null,
          expiresAt,

        },
        update: {

          accessToken: token.access_token,
          refreshToken: token.refresh_token || null,
          scope: token.scope || null,
          expiresAt,

        },

      });

    });

    const jwt = await new SignJWT({ userId: sub }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(sessionSecret);

    const response = NextResponse.redirect(process.env.NEXT_PUBLIC_REDIRECT_URL!); // @todo add an error redirect or something

    response.cookies.set("ga_session", jwt, {

      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,

    });
    
    return response;

  } catch (error: any) {

    console.error("[google/callback] ERROR:", error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL!); // @todo add an error redirect or something

  }

}