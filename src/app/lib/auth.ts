import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);

export type MinimalUser = {

    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    picture: string | null;

};

export async function authUser(): Promise<MinimalUser | null> {

  try {

    const session = (await cookies()).get("ga_session")?.value;
    if (!session) return null;

    const { payload } = await jwtVerify(session, sessionSecret);
    const userId = (payload as any).userId as string | undefined;
    if (!userId) return null;

    const user = await prisma.user.findUnique({

        where: { id: userId },
        select: { id: true, email: true, name: true, firstName: true, picture: true },

    });

    return user ?? null;

  } 
  catch {

    return null;

  }

}
