# 🤖 AgentPay AI

### AI-Powered Agentic Commerce & Secure Payment Platform

AgentPay AI is an **AI-powered agentic commerce platform** that allows users to describe what they want in natural language.

The AI shopping agent searches and ranks relevant products, while deterministic backend controls validate authentication, inventory, spending limits, and payment operations before a transaction is initiated.

The platform integrates **Razorpay** for secure payment processing and uses **Razorpay Webhooks** to synchronize asynchronous payment events with the internal order state.

> **Core idea:** Let AI assist with commerce decisions while keeping security-critical payment and spending decisions under deterministic backend control.

---

## 🔗 Quick Links

- 🌐 **Live Demo:** [AgentPay AI](YOUR_VERCEL_URL)
- 🎥 **5-Minute Demo Video:** [Watch Demo](YOUR_YOUTUBE_URL)
- 💻 **GitHub:** [AgentPay Repository](https://github.com/mohdfarahidali987-sketch/AgentPay)

---

# ✨ Features

### 🤖 AI Shopping Agent

Users can interact with AgentPay using natural language instead of manually searching through products.

Example:

> "Find me a gaming mouse under ₹2,000 with good reviews."

The AI understands the request and extracts relevant shopping intent and preferences.

---

### 🔎 AI Product Search & Ranking

The Product Agent:

- Understands natural-language shopping requests
- Extracts product requirements
- Searches available products
- Filters products according to user requirements
- Considers price and product attributes
- Uses ratings and review information
- Ranks relevant products
- Provides explanations for recommendations

Each recommendation can display:

- Product name
- Brand
- Description
- Price
- Rating
- Review count
- Stock availability
- AI ranking reasons

---

### 🛡️ Spending Guardrail

Before a purchase reaches the payment gateway, AgentPay applies a deterministic spending guardrail.

Example:

```text
Spending Limit:      ₹5,000
Current Spending:    ₹1,499
Remaining Limit:     ₹3,501

Requested Product:   ₹22,999

Decision:             BLOCKED

# 💳 Payment Flow

AgentPay AI integrates **Razorpay** to provide a secure and reliable
payment workflow for approved purchases.

AI recommendations and spending decisions are handled before the
payment gateway is opened. Security-critical payment operations are
performed and verified on the backend.

## Payment Architecture

```text
User
 │
 │ Click "Buy with AI"
 ▼
JWT Authentication
 │
 ▼
Product Validation
 │
 ▼
Stock Validation
 │
 ▼
Spending Guardrail
 │
 ├─────────────── BLOCKED ───────────────► Purchase Rejected
 │                                         │
 │                                         ▼
 │                                  "You're out of budget"
 │
 ▼
APPROVED
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
User Completes Payment
 │
 ▼
Razorpay Payment Response
 │
 ▼
Backend Signature Verification
 │
 ├────────────── INVALID ───────────────► Payment Rejected
 │
 ▼
Payment Verified
 │
 ├──────────────────────────────────────┐
 │                                      │
 ▼                                      ▼
Order Processing                 Razorpay Webhook
 │                                      │
 ▼                                      ▼
Payment State                  payment.authorized
                               payment.captured
                               payment.failed
                                      │
                                      ▼
                              Webhook Verification
                                      │
                                      ▼
                              Database Synchronization
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
                  PAID              FAILED          AUTHORIZED
                    │
                    ▼
             Atomic Stock Update
                    │
                    ▼
                Audit Log

# 🤖 AI Agent

AgentPay AI uses an **agent-oriented architecture** to transform natural-language shopping requests into personalized product recommendations and actionable commerce workflows.

Instead of manually searching, filtering, comparing, and evaluating products, users can simply describe what they want. The AI interprets the request, discovers relevant products, ranks them, and provides explanations for its recommendations.

The AI layer is intentionally separated from security-critical operations such as authentication, spending-limit enforcement, inventory validation, and payment processing.

> **AI recommends. The backend decides.**

---

## 🧠 Agent Workflow

```text
User Request
     │
     ▼
┌─────────────────────────┐
│    Supervisor Agent     │
│  Intent Understanding   │
│  Requirement Extraction │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Search Agent       │
│   Product Discovery     │
└────────────┬────────────┘
             │
             ▼
      Product Filtering
             │
             ▼
       Product Ranking
             │
             ▼
┌─────────────────────────┐
│ AI Recommendation       │
│ + Ranking Explanation   │
└────────────┬────────────┘
             │
             ▼
        User Selects
        "Buy with AI"
             │
             ▼
┌─────────────────────────┐
│   Backend Purchase      │
│       Workflow          │
│                         │
│ Authentication          │
│ Product Validation      │
│ Stock Validation        │
│ Spending Guardrail      │
│ Order Creation          │
└────────────┬────────────┘
             │
             ▼
       Razorpay Payment


## 🔐 Authentication & Security

AgentPay AI uses multiple layers of authentication, authorization, validation,
and payment security to protect user accounts, purchase operations, and
financial transactions.

The core security principle is:

> **The frontend can request an operation, but the backend decides whether
> that operation is allowed.**

---

### 🔑 Authentication Architecture

AgentPay supports two authentication methods:

- Email & Password
- Google Sign-In

After successful authentication, the backend issues a **JWT access token**.

```text
                    User
                     │
             ┌───────┴────────┐
             │                │
             ▼                ▼
      Email + Password   Google Sign-In
             │                │
             ▼                ▼
       Backend Login    Google Credential
             │                │
             └───────┬────────┘
                     ▼
              Authentication
                     │
                     ▼
                 JWT Token
                     │
                     ▼
              Frontend Storage
                     │
                     ▼
        Authorization: Bearer <token>
                     │
                     ▼
             Protected API
                     │
                     ▼
          Backend Authorization

  ## 🗄️ Database Design

AgentPay AI uses **PostgreSQL** as its relational database with **Prisma ORM**
for type-safe database access, schema management, migrations, and database
queries.

The database is designed around the core commerce workflow:

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Orders      AgentActions
 │               │
 │               │
 ▼               ▼
Product       Audit Log

### 🏗️ Database Architecture

```text
                                         PostgreSQL
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
          ┌──────┐        ┌─────────┐      ┌─────────┐
          │ User │        │ Product │      │  Order  │
          └──┬───┘        └────┬────┘      └────┬────┘
             │                 │                │
             │                 │                │
             │                 └───────┬────────┘
             │                         │
             │                         ▼
             │                    Purchase
             │                    Lifecycle
             │                         │
             └─────────────┬───────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ AgentAction  │
                    │  Audit Log   │
                    └──────────────┘


                   ## 🛠️ Tech Stack

AgentPay AI is built using a modern full-stack architecture with a focus on **AI-powered commerce, secure backend services, relational data management, and online payments**.

### 🎨 Frontend

AgentPay AI uses a modern React-based frontend focused on conversational
shopping, product discovery, secure purchasing, and payment feedback.

| Technology | Purpose |
|---|---|
| **React** | Building the interactive user interface |
| **TypeScript** | Type-safe frontend development |
| **Vite** | Development server and production build |
| **Tailwind CSS** | Responsive and modern UI styling |
| **React Hooks** | Managing component state and lifecycle |
| **Fetch API** | Communicating with backend REST APIs |
| **Razorpay Checkout** | Handling the client-side payment experience |

### Frontend Responsibilities

The frontend provides:

- 🤖 AI-powered shopping interface
- 💬 Conversational AI chat
- 🔎 Product search and discovery
- ⭐ Product recommendations and ranking explanations
- 🔐 Email/password and Google authentication
- 🛡️ Spending guardrail feedback
- 🛒 Product purchase workflow
- 💳 Razorpay Checkout integration
- ✅ Payment verification feedback
- 📦 Order and payment status
- 📱 Responsive dashboard-style interface

The frontend acts primarily as a **client interface**. Security-critical
decisions such as authorization, spending limits, inventory validation, and
payment verification are handled by the backend.

---

### ⚙️ Backend

AgentPay AI uses a modular **Node.js + Express + TypeScript** backend to
handle authentication, AI orchestration, commerce workflows, guardrails,
database operations, and payment processing.

| Technology | Purpose |
|---|---|
| **Node.js** | Backend runtime |
| **Express.js** | REST API framework |
| **TypeScript** | Type-safe backend development |
| **Prisma ORM** | Type-safe database access and transactions |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication and protected API access |
| **Zod** | Request and schema validation |
| **CORS** | Cross-origin request handling |
| **dotenv** | Environment variable management |
| **Razorpay SDK** | Server-side payment and order integration |
| **OpenAI API** | AI agent and conversational capabilities |

### Backend Responsibilities

The backend is responsible for:

#### 🔐 Authentication & Authorization

- User registration
- Email/password authentication
- Google authentication
- JWT token generation
- Protected API routes
- User authorization

#### 🤖 AI & Commerce

- AI agent orchestration
- Natural-language request processing
- Product search
- Product filtering and ranking
- AI-powered recommendations
- Conversational shopping

#### 🛡️ Purchase Guardrails

- Spending-limit enforcement
- Product validation
- Stock validation
- Purchase approval/blocking
- Deterministic backend purchase decisions

#### 💳 Payment Processing

- Server-side Razorpay Order creation
- Razorpay Checkout integration
- Payment signature verification
- Razorpay Webhook processing
- `payment.authorized` handling
- `payment.captured` handling
- `payment.failed` handling
- Payment state synchronization
- Order status management

#### 🗄️ Database & Audit

- PostgreSQL data management
- Prisma ORM
- User and product management
- Order management
- Inventory updates
- Payment tracking
- Agent action logging
- Audit trail
- Database transactions

---

### 🔄 Backend Architecture

```text
                         Express Backend
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    Authentication        AI / Commerce        Payments
          │                    │                    │
          │                    │                    ├── Razorpay
          │                    │                    ├── Verification
          │                    │                    └── Webhooks
          │                    │
          │                    └── Product Search
          │                    └── Recommendations
          │                    └── Purchase Workflow
          │
          └── JWT
                               │
                               ▼
                         Guardrail Layer
                               │
                               ▼
                         Prisma ORM
                               │
                               ▼
                         PostgreSQL

### 🤖 AI

AgentPay AI uses the **OpenAI API** to power its natural-language shopping
experience and agentic commerce workflow.

Users can describe what they want in their own words, and the AI interprets
their intent, extracts relevant requirements, and assists in discovering and
ranking suitable products.

| Technology | Purpose |
|---|---|
| **OpenAI API** | Natural-language understanding, intent processing, recommendations, and conversational AI |

### 🧠 AI Responsibilities

The AI layer is responsible for:

- Understanding natural-language shopping requests
- Detecting user intent
- Extracting product requirements
- Assisting product discovery
- Filtering relevant products
- Ranking products based on user requirements
- Generating recommendation explanations
- Providing conversational shopping assistance

### 🔐 AI Security Boundary

The AI is intentionally separated from security-critical operations.

The AI can **recommend** a product, but it cannot directly authorize or
execute a payment.

```text
User
  │
  ▼
Natural-Language Request
  │
  ▼
AI Agent
  │
  ├── Understand Intent
  ├── Extract Requirements
  ├── Find Products
  └── Rank Recommendations
  │
  ▼
AI Recommendation
  │
  ▼
User Selects Product
  │
  ▼
Backend
  │
  ├── Authentication
  ├── Product Validation
  ├── Stock Validation
  └── Spending Guardrail
  │
  ▼
Razorpay Payment

## 🔮 Future Improvements

AgentPay AI is designed as a foundation for **secure agentic commerce**. The current implementation focuses on AI-powered product discovery, deterministic spending guardrails, authentication, secure Razorpay payments, webhook-based payment synchronization, inventory management, and auditability.

Future improvements will focus on improving **payment reliability, AI capabilities, scalability, observability, and automated testing**.

### 💰 1. Advanced Payment Reconciliation

Build a comprehensive reconciliation system to handle complex and asynchronous payment scenarios and keep Razorpay payment states synchronized with internal order states.

```text
Razorpay Payment Events
          │
          ▼
   Payment Reconciliation
          │
          ▼
   Internal Order State

## 👨‍💻 Author

### Muhammed Farahid

B.Tech Computer Science & Engineering student at **National Institute of Technology Srinagar (NIT Srinagar)** with a strong interest in **software engineering, backend development, AI-powered systems, and data structures & algorithms**.

I built **AgentPay AI** to explore how AI agents can participate in real-world commerce while maintaining strong boundaries around **authentication, spending controls, payment verification, and financial operations**.

### 💻 Areas of Interest

- 🤖 AI & Agentic Applications
- ⚙️ Backend & Full-Stack Engineering
- 💳 Payment Systems & FinTech
- 🛡️ Secure API Design
- 🗄️ Database Systems
- 🧠 Data Structures & Algorithms
- 🌐 Web Application Development

### 🔗 Links

- **GitHub:** [mohdfarahidali987-sketch](https://github.com/mohdfarahidali987-sketch)
- **AgentPay AI:** [View Repository](https://github.com/mohdfarahidali987-sketch/AgentPay)