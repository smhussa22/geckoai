import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function getUser(){

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return null;

    try {

        const { payload } = await jwtVerify(session, sessionSecret);
        const userId = payload.userId as string; 
        return await prisma.user.findUnique({ where: { id: userId } });

    } 
    catch (error: any) {

        console.error(error);
        return null;

    }

}

export async function authUserOrThrow() {

    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    return user; 
    
}