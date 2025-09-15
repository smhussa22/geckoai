import { NextResponse } from "next/server";
import { getUserStorage } from "@/app/lib/getUserStorage";

export async function GET() {
    try {
        const data = await getUserStorage();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: String(error?.message ?? error) }, { status: 400 });
    }
}
