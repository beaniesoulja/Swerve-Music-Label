import type { Metadata } from "next";
import NewsletterActionPage from "../../components/newsletter-action-page";
export const metadata: Metadata = { title: "Confirm subscription · Swerve Music", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return <NewsletterActionPage action="confirm" token={typeof params.token === "string" ? params.token : undefined} result={typeof params.result === "string" ? params.result : undefined} />;
}
