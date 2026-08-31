# 🤖 AgentPay AI

**AI-powered agentic commerce platform** where users describe what they want in natural language, an AI agent discovers and ranks products, and a deterministic backend controls authentication, inventory, spending limits, and payments.

> **Core idea:** AI recommends. The backend decides.

**Track:** AI Growth & Agentic Commerce — Razorpay Buildathon

🌐 [Live Demo](https://agent-pay-ebon.vercel.app) · 🎥 [Demo Video](YOUR_YOUTUBE_URL) · 💻 [GitHub](https://github.com/mohdfarahidali987-sketch/AgentPay)

---

## 🎯 Problem

Traditional e-commerce makes users manually search, filter, compare, and evaluate products before making a purchase.

AgentPay AI reduces this friction by allowing users to express their shopping intent in natural language. The AI understands the request, discovers relevant products, ranks them, and guides the user toward a purchase.

Because an AI agent participates in a financial workflow, AgentPay separates **AI decision support from security-critical operations**.

> AI handles intent and recommendations. Authentication, spending controls, inventory, and payment decisions remain deterministic backend operations.

---

## 🏗️ Architecture

```text
User
 │
 ▼
AI Shopping Agent
(Search → Filter → Rank → Recommend)
 │
 ▼
User selects "Buy with AI"
 │
 ▼
Backend Purchase Workflow
 │
 ├── JWT Authentication
 ├── Product Validation
 ├── Stock Validation
 └── Spending Guardrail
          │
          ├── BLOCKED ──► Purchase Rejected
          │
          └── APPROVED
                  │
                  ▼
           Create Internal Order
                  │
                  ▼
           Create Razorpay Order
                  │
                  ▼
           Razorpay Checkout
                  │
                  ▼
          Payment Verification
                  │
                  ▼
          Razorpay Webhook
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    authorized  captured  failed
        │         │         │
        └─────────┼─────────┘
                  ▼
          Database State Update
                  │
                  ▼
          Inventory + Audit Log
```

---

## ✨ Key Features

### 🤖 AI Shopping Agent

- Natural-language shopping requests
- Intent and requirement extraction
- Product discovery and filtering
- Product ranking
- Recommendation explanations
- Conversational shopping assistance

Example:

```text
"Find a gaming mouse under ₹2,000 with good reviews."
```

---

### 🛡️ Spending Guardrail

Every purchase is checked against the user's spending limit **before Razorpay Checkout is opened**.

```text
Limit:     ₹5,000
Spent:     ₹1,499
Remaining: ₹3,501

Product:   ₹22,999
Decision:  BLOCKED
```

The AI cannot bypass the backend spending guardrail.

---

### 💳 Razorpay Payments

AgentPay integrates Razorpay with:

- Server-side Razorpay order creation
- Razorpay Checkout
- HMAC SHA-256 payment signature verification
- Razorpay Webhooks
- Payment state synchronization
- Inventory updates
- Audit logging

Handled webhook events:

```text
payment.authorized
payment.captured
payment.failed
```

---

### 🔐 Authentication & Security

- Email/password authentication
- Google Sign-In
- JWT-protected APIs
- Backend authorization
- Zod request validation
- Environment-based secret management
- Server-side payment verification
- Webhook signature verification

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| AI | OpenAI API |
| Authentication | JWT, Google Sign-In |
| Validation | Zod |
| Payments | Razorpay Checkout, Razorpay Webhooks |
| Deployment | Vercel, Render |

---

## 🗄️ Database

AgentPay uses **PostgreSQL + Prisma ORM**.

Core entities:

- `User` — authentication and spending limits
- `Product` — catalog, pricing, ratings, and inventory
- `Order` — purchase and Razorpay payment state
- `AgentAction` — agent and commerce audit trail

---

## 🚀 Setup

### Backend

```bash
git clone https://github.com/mohdfarahidali987-sketch/AgentPay.git
cd AgentPay/backend

npm install
cp .env.example .env
```

Configure:

```env
DATABASE_URL=
JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

OPENAI_API_KEY=
AI_MODEL=
GOOGLE_CLIENT_ID=
```

Then:

```bash
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Configure:

```env
VITE_API_URL=
VITE_RAZORPAY_KEY_ID=
VITE_GOOGLE_CLIENT_ID=
```

Then:

```bash
npm run dev
```

> Use Razorpay **Test Mode** credentials during development.

---

## 🚀 Deployment

**Frontend:** [AgentPay AI](https://agent-pay-ebon.vercel.app)

**Backend:** Deployed on Render.

Razorpay Webhooks are configured to send payment events to the deployed backend.

---

## 🔮 Future Improvements

- Advanced payment reconciliation for complex asynchronous payment scenarios
- Idempotent webhook event processing
- Automated unit, integration, and end-to-end testing
- Production observability and payment monitoring
- Refund and cancellation workflows
- More advanced multi-agent commerce workflows

---

## 👨‍💻 Author

### Muhammed Farahid

B.Tech Computer Science & Engineering, **NIT Srinagar**.

Interested in:

- Backend Engineering
- AI & Agentic Applications
- Payment Infrastructure
- Secure API Design
- Full-Stack Development
- Data Structures & Algorithms

I built AgentPay AI to explore how AI agents can participate in real-world commerce while keeping financial and security-critical decisions under deterministic backend control.

🔗 [GitHub](https://github.com/mohdfarahidali987-sketch) · [AgentPay AI](https://github.com/mohdfarahidali987-sketch/AgentPay)

---

### ⭐ AgentPay AI

**AI recommends. The backend decides.**