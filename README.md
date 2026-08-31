 # 🤖 AgentPay AI

**AI-powered agentic commerce platform** — users describe what they want in natural language, an AI agent searches and ranks products, and a deterministic backend enforces authentication, inventory, and spending limits before any payment is initiated.

> **Core idea:** AI recommends. The backend decides.

**Track:** AI Growth & Agentic Commerce (Razorpay Buildathon)

🌐 [Live Demo](https://agent-pay-ebon.vercel.app) · 🎥 [Demo Video](YOUR_YOUTUBE_URL) · 💻 [Repo](https://github.com/mohdfarahidali987-sketch/AgentPay)

---

## Architecture


The AI layer only ever *recommends*. Every step that touches money, inventory, or auth is deterministic backend logic, verified independently of anything the AI suggested.

---

## Features

**AI Shopping Agent** — understands natural-language requests ("gaming mouse under ₹2,000 with good reviews"), extracts intent, searches the catalog, and ranks results with an explanation for each recommendation (price, rating, reviews, stock).

**Spending Guardrail** — every purchase is checked against a spending limit before checkout opens:



**Payment Processing** — Razorpay order creation, checkout, backend signature verification, and webhook-based sync (`payment.authorized`, `payment.captured`, `payment.failed`) so internal order state never drifts from what Razorpay actually recorded.

**Auth** — email/password and Google sign-in, JWT-protected routes, backend-side authorization on every request.

**Audit trail** — every agent action and payment state change is logged to `AgentAction`/audit tables in Postgres.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Razorpay Checkout |
| Backend | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT |
| Database | PostgreSQL |
| AI | OpenAI API |
| Payments | Razorpay SDK + Webhooks |

---

## Database

Core entities: `User`, `Product`, `Order`, `AgentAction` (audit log). Orders and AgentActions both reference the purchasing user; every AI-initiated action is written to `AgentAction` independent of whether the resulting order succeeded.

---

## Setup

```bash
git clone https://github.com/mohdfarahidali987-sketch/AgentPay.git
cd AgentPay

# Backend
cd backend
npm install
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, RAZORPAY_KEY_ID/SECRET, OPENAI_API_KEY
npx prisma migrate dev
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env   # fill VITE_API_URL, VITE_RAZORPAY_KEY_ID
npm run dev
```

Razorpay keys must be **test-mode** during development.

---

## Results

<!-- Fill this in with your actual numbers — run your batch/test script and paste the output.
This is the single most important section for the buildathon evaluation: it's the difference
between "we built a guardrail" and "we proved the guardrail works." Example shape: -->

- Orders processed in test batch: `__`
- Auto-approved vs. blocked by spending guardrail: `__ / __`
- Payment verification success rate: `__%`
- Average time from "Buy with AI" click to order confirmation: `__`

---

## What's Not Built Yet

- Advanced payment reconciliation for edge-case async webhook ordering
- Automated test suite
- Observability/logging dashboard for agent actions in production

---

## Author

**Muhammed Farahid** — B.Tech CSE, NIT Srinagar. Interested in backend engineering, AI-powered systems, and payment infrastructure.

[GitHub](https://github.com/mohdfarahidali987-sketch) · [AgentPay AI](https://github.com/mohdfarahidali987-sketch/AgentPay)