import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: `STRIPEWEBHOOK/POST: ${error.message}` },
            { status: 400 }
        );
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerId = session.customer as string;

            await prisma.user.updateMany({
                where: { stripeCustomerId: customerId },
                data: { plan: "PLUS" },
            });

            break;
        }

        default:
            console.log(`${event.type} no case`);
    }

    return NextResponse.json({ received: true });
}
