import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const plans = {
  basic: { name: "Basic", priceAed: 39, description: "CV rewrite" },
  pro: { name: "Pro", priceAed: 79, description: "CV + cover letter" },
  premium: { name: "Premium", priceAed: 149, description: "Full package" },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const packageValue = String(formData.get("package") || "basic").toLowerCase();
    const email = String(formData.get("email") || "");

    let planKey = "basic";
    if (packageValue.includes("premium")) {
      planKey = "premium";
    } else if (packageValue.includes("pro")) {
      planKey = "pro";
    }

    const plan = plans[planKey];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aed",
            unit_amount: Math.round(plan.priceAed * 100),
            product_data: {
              name: "ResumeFix AI - " + plan.name,
              description: plan.description,
            },
          },
        },
      ],
      success_url: appUrl + "/success?paid=1",
      cancel_url: appUrl + "/upload?canceled=1",
      customer_email: email || undefined,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: error && error.message ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
