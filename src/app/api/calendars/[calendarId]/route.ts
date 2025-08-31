import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUser } from "@/app/lib/getUser";

export const runtime = "nodejs";

const defaults = {

    listIcon: "user",
    listBackgroundColor: "#698f3f",
    calendarDefaultVisibility: "DEFAULT",

};


const getAccessRole = async (accessToken: string, calendarId: string) => {

    const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(calendarId)}`,
    
        { 
            
            headers: { Authorization: `Bearer ${accessToken}` } 
    
        }
    
    );

    if (!response.ok) return null;

    const req = await response.json();

    return req?.accessRole as ("owner" | "writer" | "reader" | "freeBusyReader" | null);
    
}

export async function GET (req: Request, { params }: { params: { calendarId: string } } ){

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Method: CalendarID/GET, Error: User inaccessible/unauthorized."}, { status: 401 });
    
    const token = await prisma.googleToken.findUnique( 
        
        { where: { userId: user.id } },

    );
    if (!token) return NextResponse.json({ error: "Method: CalendarID/GET, Error: No Google Token. "}, { status: 400 });

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}`,
    
        { 
            
            headers: { Authorization: `Bearer ${token.accessToken}`},

        }

    );
    if(!response.ok) return NextResponse.json({ error: "Method: CalendarID/GET, Error: Calendar(s) not found. "}, { status: response.status });

    const google = await response.json();

    const preferences = await prisma.calendar.findUnique({

        where: { ownerId_googleId: { ownerId: user.id, googleId: params.calendarId }}, 
        select: { icon: true, color: true, defaultVisibility: true, name: true, description: true,}

    });

    return NextResponse.json({

        id: google.id,
        name: google.summary ?? preferences?.name ?? google.id,
        description: google.description ?? preferences?.description ?? "",
        icon: preferences?.icon ?? defaults.listIcon,
        color: preferences?.color ?? defaults.listBackgroundColor,
        defaultVisibility: preferences?.defaultVisibility ?? defaults.calendarDefaultVisibility

    });

}

export async function PATCH (req: Request, { params }: { params: { calendarId: string } } ){

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Method: CalendarID/PATCH, Error: User inaccessible/unauthorized."}, { status: 401 });

    const token = await prisma.googleToken.findUnique( 
        
        { where: { userId: user.id } },

    );
    if (!token) return NextResponse.json({ error: "Method: CalendarID/GET, Error: No Google Token. "}, { status: 400 });
    
    let body: any;

    try{

        body = await req.json();

    }
    catch(error: any){

        return NextResponse.json( { error: error } );

    }

    const accessRole = await getAccessRole(token.accessToken, params.calendarId);
    if (accessRole === "owner") {

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}`,
    
            {

                method: "PATCH",
                headers: {

                    Authorization: `Bearer ${token.accessToken}`,
                    "Content-Type": "application/json",

                },
                body: JSON.stringify({

                    summary: body.name.trim(),
                    description: body.description ?? "",

                }),

            }

        );
        if(!response.ok) return NextResponse.json( { error: response.statusText }, { status: response.status });

    }
    else{ 

        const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(params.calendarId)}`,
    
            {

                method: "PATCH",
                headers: {

                    Authorization: `Bearer ${token.accessToken}`,
                    "Content-Type": "application/json",

                },
                body: JSON.stringify({

                    summaryOverride: body.name.trim(),

                }),

            }

        );
        if(!response.ok) return NextResponse.json( { error: response.statusText }, { status: response.status });

    }

    await prisma.calendar.upsert({

        where: {

            ownerId_googleId: {

                ownerId: user.id,
                googleId: params.calendarId,

            }

        },
        create: {

            ownerId: user.id,
            googleId: params.calendarId,
            name: body.name.trim(),
            description: body.description ?? "",
            icon: body.icon ?? defaults.listIcon,
            color: body.color ?? defaults.listBackgroundColor,
            defaultVisibility: body.defaultVisibility

        },
        update:{

            name: body.name.trim(),
            description: body.description ?? "",
            icon: body.icon ?? defaults.listIcon,
            color: body.color ?? defaults.listBackgroundColor,
            defaultVisibility: body.defaultVisibility

        },

    });

    return NextResponse.json({

        id: params.calendarId,
        name: body.name.trim(),
        description: body.description ?? "",
        icon: body.icon ?? defaults.listIcon,
        color: body.color ?? defaults.listBackgroundColor,
        defaultVisibility: body.defaultVisibility

    });

}