import { sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { newsletterSubscribers } from "../../../db/schema";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("newsletter_subscribers")) {
    return "Newsletter storage is being prepared. Please try again shortly.";
  }
  return "We could not add you right now. Please try again.";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      consent?: unknown;
      website?: unknown;
    };

    if (typeof payload.website === "string" && payload.website.trim()) {
      return Response.json({ message: "Thanks for subscribing." }, { status: 201 });
    }

    const name = typeof payload.name === "string" ? payload.name.trim().replace(/\s+/g, " ") : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

    if (name.length < 2 || name.length > 80) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (payload.consent !== true) {
      return Response.json({ error: "Please confirm that you want to receive the newsletter." }, { status: 400 });
    }

    const db = getDb();
    await db
      .insert(newsletterSubscribers)
      .values({ name, email, source: "website", status: "subscribed" })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: {
          name,
          status: "subscribed",
          consentAt: sql`CURRENT_TIMESTAMP`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });

    return Response.json(
      { message: "You are on the list. Welcome to the movement." },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
