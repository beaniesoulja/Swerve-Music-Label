# Swerve Music newsletter DNS

Resend domain `74a6daa9-02a8-44cf-94c9-094e386cc0d0`, region `eu-west-1`. These are public verification records, not API credentials. Add only these records; preserve the root Cloudflare MX/SPF, existing DKIM and DMARC reject policy. TTL Auto; DNS only.

| Type | Name | Value | Priority |
| --- | --- | --- | --- |
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDB6KHvvnrjQHgWAmh08RGEeqSJGnUKwmYkRlYIhG569mBMOdJSUlC4Hw6tKJPBUVaAuZksTsQLsR14wn3aCNvt+ayJJPov2LsRCOCq0dMO89b5SdfAft3BeF0BhuSpRRVx+GVymodsZ0ct1cJbhsqcT7SVDkKpA7ge66z8CJJtjwIDAQAB | — |
| MX | send | feedback-smtp.eu-west-1.amazonses.com | 10 |
| TXT | send | v=spf1 include:amazonses.com ~all | — |
| CNAME | rsend | send.forge.rmta.net | — |

Email open and click tracking are disabled. Receiving is disabled in Resend; enquiry forwarding remains with Cloudflare.
