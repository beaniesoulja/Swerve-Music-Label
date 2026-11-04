# Newsletter privacy notice — draft for owner review

Not published. Supply the public operator/business name, country and mailing address before approval. The website must keep signups disabled until the approved notice is available.

## Proposed notice

Swerve Music's newsletter is operated by **[public operator name]**, based in **[country]**, at **[public mailing address]**. Contact **hello@swervemusic.org** about your subscription or personal information.

When you sign up, we collect your name and email address, the signup source, subscription status, and signup/confirmation dates. We use these to confirm your request and send the music news, artist stories, releases and live-show updates you requested. You are subscribed only after confirming the email link. Confirmation links expire after 24 hours.

Cloudflare hosts and protects the website. Neon stores subscription records. Resend delivers newsletter emails. These services process information needed to provide those functions. The configured database is in the United States and the sending domain uses Resend's European region; this does not mean all provider processing is confined to those regions. Email open and click tracking are disabled in our Resend domain configuration.

Our signup service also stores keyed hashes of email addresses and, when configured behind our trusted proxy, IP addresses to limit abuse. Expired rate-limit entries are removed during successful signup rate checks. Cloudflare may separately process security logs under its service policies.

Each confirmed subscriber receives an unsubscribe link. Unsubscribing stops eligibility for future newsletter sends; it does not immediately erase the record. We retain subscription status and confirmation history to manage your choices. Contact us to request access, correction or deletion. **[Owner to approve a retention/deletion process before publication; no automatic subscriber deletion schedule is currently implemented.]**

The website loads fonts from Google Fonts. Following Apple Music, Spotify, Instagram or other external links takes you to services with their own privacy practices.

## Email footer for approval

Swerve Music · **[public operator name and mailing address]**

You received this because you confirmed a Swerve Music newsletter subscription. Unsubscribe: **[personalized unsubscribe URL]**. Contact: hello@swervemusic.org.

## Activation still required

- Approve the public identity, retention wording and notice; publish the approved page and set `PRIVACY_POLICY_URL`.
- Authenticate the prepared Resend DNS records and verify the sending domain.
- Store a domain-restricted sending key, database connection and stable signing secret in Cloudflare runtime secrets.
- Run an owner-authorized delivery/confirmation/unsubscribe test before enabling public signups.
- Before any campaign, configure the sending workflow to honor current unsubscribes, provider bounce/complaint suppression and email footer requirements. No campaign has been sent or scheduled.
