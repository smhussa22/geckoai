import { prisma } from "@/app/lib/prisma";

export async function googleIdForCalendar(ownerId: string, dbCalendarId: string) {
    
  const calendar = await prisma.calendar.findFirst({

    where: { id: dbCalendarId, ownerId, deletedAt: null },
    select: { googleId: true },

  });

  return calendar?.googleId || null;
  
}
