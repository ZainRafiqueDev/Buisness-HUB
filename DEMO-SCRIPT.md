# Connected Business Hub: walkthrough script

One customer-journey engine set up for three different businesses. Each uses its own tools; the workflows stay the same.

| Business | Type | Tools |
|---|---|---|
| Northlight Coaching | Coaching + online courses | HubSpot, Calendly, Shopify, Kajabi, Slack |
| Lumen Wellness Studio | Appointments + memberships | GoHighLevel, Acuity, Stripe, Twilio SMS, Square |
| Ember & Oak | E-commerce + subscriptions | Shopify, Klaviyo, Cal.com |

## Be upfront about this (say it before you share your screen)

> "I put together a working proof of concept to show how I'd approach your project. These are three example
> businesses I set up to show the same system adapting to different tools, not past clients. The website,
> assistant, CRM logic and automations really run here; the connections to Shopify, Kajabi, HubSpot and the
> others use the same events those platforms send, but they aren't linked to live accounts."

Never present Northlight, Lumen or Ember & Oak as real clients. If Kalista asks for a live link or a reference
and they're fictional, the trust you built is gone.

## Run it

```
cd C:\Users\zainr\Downloads\connected-business-hub
npx next start -p 3100
```

Open http://localhost:3100. If you changed code, run `npm run build` first.
Before the call, press **Reset** on each business's CRM page (or leave them empty and use "Simulate visitors").

Keep two tabs open: the business **Website** and its **CRM**.

## Screens

- **Hub** (`/`): the three businesses side by side, with their tools and automations.
- **Website**: lead form, one-question quiz with a recommendation, booking (with deposit for Lumen), two-step checkout, reviews, FAQ, chat assistant.
- **CRM**: pipeline board (New → Engaged → Booked → Customer), contacts table, activity feed, contact profile with score, spend, tags, appointments ("Mark attended"), orders and timeline.
- **Automations**: 8–9 workflows per business with on/off switches, run counts and scheduled counts.
- **Insights**: funnel, lead sources, sales by item, checkout recovery, AI assistant answer rate.
- **How it connects**: each tool and its connection method, the same roles across all three businesses, the delivery phases.

Admin toolbar on every admin screen:
- **▶ Simulate visitors**: plays out 6 realistic visitor journeys so the reports have something to show.
- **⏩ Skip ahead 1 day**: moves the clock forward so scheduled emails and texts visibly send.
- **Reset**: clears that business.

## 6-minute walkthrough

**0:00. Hub.** "Same engine, three businesses, different tools. Your setup would be a fourth configuration."

**0:45. Northlight website → quiz.** Pick "A clear system for planning my week", enter a name and email. Recommendation appears.

**1:30. Chat.** Open the chat and ask "Which course is right for me?". Point at "Source: Course comparison": it only answers from approved content. Then ask something off-topic like "do you offer tax advice": it passes the question to the team instead of guessing.

**2:15. Checkout and abandonment.** Click Enroll on Focus Reset, enter details, then **close** the checkout at the payment step.
Switch to CRM → Activity → "⏱ Scheduled": the abandoned-checkout reminders are queued.
Click **Skip ahead 1 day**: the first reminder sends.
Go back, enroll again and pay: "Stopped Abandoned checkout… because they completed the purchase", then Kajabi access granted, then onboarding emails.

**3:30. Pipeline.** Open the contact: score bar, 🔥 hot-lead tag, Slack alert, full timeline. Click any row to show the raw event data.

**4:15. Switch to Lumen** (dropdown at the top). Book a massage: $25 deposit through Stripe, SMS reminder via Twilio. In the CRM click **Mark attended**: thank-you, review request on day 2, rebooking invite on day 21.

**5:00. Automations.** Turn one workflow off and back on: "Every piece is a switch. We launch the essentials first and add the rest in phases."

**5:30. Insights, then How it connects.** "Same roles, different tools. For your project we'd fill in this column with your stack."

**6:00. Hand it back.** "Which of these journeys matters most for your launch?"

## If asked

- **Is the assistant a real AI model?** "Here it answers from a fixed knowledge base so a live walkthrough can't go off-script. In production the same knowledge base becomes retrieved context for an LLM, with booking and lead capture as tools, a human handoff and a monthly cost cap."
- **Is this built in Replit?** "It's Next.js. The same app runs on Replit as-is. Your site would stay in Replit unless there's a real reason to move it."
- **Are these real clients?** "No. They're example businesses I set up for this walkthrough, using no information from your NDA."
- **How long would yours take?** Point to the four phases on "How it connects", then offer the paid Phase 1 review for a firm quote.
