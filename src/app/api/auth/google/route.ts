import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/";
  const state = Buffer.from(JSON.stringify({ next })).toString("base64url");

  const parameters = new URLSearchParams({

    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"].join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state

  });

  return NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + parameters.toString() );
}