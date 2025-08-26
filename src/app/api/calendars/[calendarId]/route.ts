import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUser } from "@/app/lib/getUser";

export const runtime = "nodejs";

export async function GET (req: Request, { params }: { params: { calendarId: string } } ){

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Method: CalendarID/GET, Error: User inaccessible/unauthorized."}, { status: 401 });
    
    const calendar = await prisma.calendar.findFirst({ where: { id: params.calendarId, ownerId: user.id  } } );
    if (!calendar) return NextResponse.json({ error: "Method: CalendarID/GET, Error: Calendar not found." }, { status: 404 });

    return NextResponse.json(calendar);

}

export async function PATCH (req: Request, { params }: { params: { calendarId: string } } ){

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Method: CalendarID/PATCH, Error: User inaccessible/unauthorized."}, { status: 401 });

    try{

        const body = await req.json();
        if(!body.name.trim()) return NextResponse.json({ error: "Method: CalendarID/PATCH, Error: Calendar must have a name."}, { status: 400 });

        const owner = await prisma.calendar.findFirst({ 

            where: { id: params.calendarId, ownerId: user.id }, 
            select: { id: true } 

        });

        if (!owner) return NextResponse.json({ error: "Method: CalendarID/PATCH, Error: Calendar not found."}, { status: 404 } );

        const update = await prisma.calendar.updateMany({

            where: { id: params.calendarId },
            data: {

                name: body.name.trim(),
                description: body.description ?? "",
                defaultVisibility: body.defaultVisibility,
                icon: body.icon ?? null,
                color: body.color ?? null

            }

        });

        return NextResponse.json(update);

    }
    catch(error: any){

        return NextResponse.json( { error: error } );

    }

}