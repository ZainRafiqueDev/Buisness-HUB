# Connected Business Hub: demo script

A fictional coaching business ("Northlight") showing one connected customer journey:
website → AI assistant → lead in CRM → booking → purchase → course access → email automations.

**Live in the demo:** website, assistant (keyword retrieval over approved content), CRM store, automation rules.
**Simulated:** Shopify, Kajabi, booking webhooks, email sending. Their events use the same shapes the real platforms send.

## Run it

```
cd C:\Users\zainr\Downloads\connected-business-hub
npm run build
npx next start -p 3100
```

Open http://localhost:3100. Before the call, click **Reset demo data** on the CRM page.

Keep two browser tabs open: **Website** and **CRM & automations**.

## 5-minute script

**0:00. Set it up (say it first)**
"I built a small proof of concept with a fictional business and sample data, to show how I think about your project. The website, assistant and CRM are live; Shopify, Kajabi and booking are simulated with the same events the real platforms send."

**0:30. AI assistant → lead**
Open the chat, click "Which course is right for me?"
- Point at **"Source: Course comparison"**: "It only answers from approved content, so it won't make up prices."
- Fill in name and email and tick consent: "It captures the lead, with consent."
- Type "do you do tax returns": "When it doesn't know, it hands off to a human instead of guessing."

**1:30. Booking**
Type "Can I book a call this week?", pick a slot and book.

**2:15. Behind the scenes (the most important part)**
Switch to the CRM tab:
- One contact, tagged, status **booked**.
- **"Stopped Welcome & nurture (2 emails cancelled)"**: "Once someone books, they stop getting 'please book a call' emails. This is where most setups annoy customers."
- Click any event to show the JSON payload: "This is the same shape as a Calendly or HubSpot webhook."

**3:15. Course purchase → Kajabi**
Website → Courses → Enroll on Focus Reset → Pay (demo). Back to CRM:
- Shopify `orders/create` → Kajabi `offer.granted` → status **customer** → course onboarding emails.
- "The customer pays once and gets their course login automatically, with no manual work."

**4:15. How it connects page**
"Demo vs. production": "For your project, each simulated piece is replaced with the real API, starting with whatever you need at launch."

**4:45. Hand it back**
"Is this close to the journey you have in mind, or would you want it to work differently?"

## If asked

- **Is the AI an LLM?** "Here it's deterministic, so a live demo can't go off-script. In production the same knowledge base becomes retrieved context for an LLM, and booking and lead capture become tools it can call, with a human handoff and a monthly cost cap."
- **Is it built in Replit?** "This is Next.js. The same app runs on Replit as-is. Your site would stay in Replit unless there's a real reason to move it."
- **Is any of this your real data?** "No. A fictional business and sample data only; nothing from the NDA."
