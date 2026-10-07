import Link from "next/link";

export default function NewsletterActionPage({ action, token, result }: {
  action: "confirm" | "unsubscribe"; token?: string; result?: string;
}) {
  const validShape = action === "confirm" ? /^[a-f0-9]{64}$/.test(token || "") : /^\d+\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token || "");
  const title = action === "confirm" ? "Confirm your subscription" : "Unsubscribe from the newsletter";
  return <main className="message-page">
    <Link className="text-link" href="/">Swerve Music</Link>
    <h1>{result === "success" ? (action === "confirm" ? "You’re on the list." : "You’re unsubscribed.") : title}</h1>
    {result === "success" ? <p>{action === "confirm" ? "Your Swerve Music newsletter subscription is confirmed." : "You will no longer receive the Swerve Music newsletter."}</p> :
      result === "invalid" || !validShape ? <p>This link is invalid, expired, or has already been used. For a new confirmation, return to the newsletter signup. To unsubscribe, use the link in your most recent newsletter.</p> :
      <><p>{action === "confirm" ? "Choose Confirm subscription to start receiving the Swerve Music newsletter." : "Choose Unsubscribe to stop receiving the Swerve Music newsletter."}</p>
      <form method="post" action={`/api/newsletter/${action}`}>
        <input type="hidden" name="token" value={token} />
        <button className="button button-dark" type="submit">{action === "confirm" ? "Confirm subscription" : "Unsubscribe"}</button>
      </form></>}
    <Link className="text-link" href="/#newsletter">Back to Swerve Music</Link>
  </main>;
}
