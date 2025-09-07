import "use server";
import { NextResponse } from "next/server";
import { authUserOrThrow } from "@/app/lib/getUser";
import { s3DeleteObject, s3StagedAttachmentKey } from "@/app/lib/s3";

export async function DELETE(req: Request, ctx: { params: Promise<{ calendarId: string }> }) {
    try {

        const user = await authUserOrThrow();
        const { calendarId, tempId } = (await ctx.params) as any;
        
        const filename = new URL(req.url).searchParams.get("filename");
        if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

        const key = s3StagedAttachmentKey(user.id, calendarId, tempId, filename);
        await s3DeleteObject(key);

        return NextResponse.json({ ok: true });

    }
    catch (error: any){

        return NextResponse.json({ error: error?.message ?? "Internal Server Error" }, { status: 500 });

    }

}
