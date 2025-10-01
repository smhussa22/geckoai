import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { authUserOrThrow } from "@/app/lib/getUser";
import { stripe } from "@/app/lib/stripe";

export async function POST(){

    const user = await authUserOrThrow();
    if (!user) return NextResponse.json(

        { error: "STRIPE/POST user not authorized"},
        { status: 401 },

    );

    let customerId = (await user).stripeCustomerId;
    if (!customerId) {

        const customer = await stripe.customers.create({

            email: (await user).email,
            metadata: { 

                userId: (await user).id,

            },

        });

        await prisma.user.update({

            where: { 
                
                id: (await user).id,
            
            },
            data: { 

                stripeCustomerId: customer.id,

            },

        });

        customerId = customer.id;

    };

    const session = await stripe.checkout.sessions.create({

        mode: 'payment',
        customer: customerId,
        line_items: [

            {

                price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
                quantity: 1,

            },

        ],

        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`

    });

    return NextResponse.json(

        { 
            
            id: session.id,
            url: session.url,

        },

    );

}