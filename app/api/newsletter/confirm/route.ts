import { newsletterAction } from "../../../lib/newsletter-action";
export function POST(request: Request) { return newsletterAction(request, "confirm"); }
