# 🤖 AgentPay AI

### AI-Powered Agentic Commerce Platform

AgentPay AI is an AI-powered commerce platform where users can describe what they want in natural language, and an AI shopping agent searches and ranks products, evaluates purchase requests against user spending limits, and initiates secure payments through Razorpay.

The project combines **AI agents, product discovery, authentication, spending guardrails, payment processing, inventory management, and audit logging** into a single commerce workflow.

---

## 🔗 Quick Links

[![Live Demo](https://img.shields.io/badge/Live-Demo-7c3aed?style=for-the-badge)](YOUR_DEPLOYED_URL)

[![Demo Video](https://img.shields.io/badge/Demo-Video-red?style=for-the-badge)](YOUR_YOUTUBE_URL)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge)](https://github.com/mohdfarahidali987-sketch/AgentPay)

> Replace `YOUR_DEPLOYED_URL` and `YOUR_YOUTUBE_URL` with your actual deployment and video links.

---


# ✨ Features

### 🤖 AI Shopping Agent

Users can interact with AgentPay using natural language instead of manually searching through products.

Example:

> "Find me a gaming mouse under ₹2,000 with good reviews."

The AI analyzes the request and extracts relevant shopping intent and preferences.

---

### 🔎 AI Product Search & Ranking

The Product Agent:

- Understands the user's request
- Searches available products
- Filters products according to the request
- Considers price and product attributes
- Uses ratings and review information
- Ranks relevant products
- Provides explanations for recommendations

Each recommended product can display:

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

Before a purchase is executed, AgentPay checks the user's spending limit.

Example:

```text
Spending Limit:      ₹5,000
Current Spending:   ₹1,499
Remaining Limit:    ₹3,501

Requested Product:  ₹22,999

Decision: BLOCKED


# 💳 Payment Flow

AgentPay AI integrates **Razorpay** to provide a secure payment workflow for approved purchases.

The payment system is designed so that AI recommendations and spending decisions are handled before the payment gateway is opened.

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
 ▼
Order Status → PAID
 │
 ▼
Atomic Stock Decrement
 │
 ▼
Audit Log



 

```markdown
### Payments

- Razorpay
- Razorpay Checkout
- Server-side payment signature verification
- HMAC SHA-256 verification
- Test Mode support

## 💡 Why Razorpay Integration?

The payment integration is not treated as a simple "Pay Now" button.

AgentPay AI places deterministic backend controls before the payment gateway:

```text
AI Recommendation
       ↓
User Intent
       ↓
Authentication
       ↓
Spending Guardrail
       ↓
Product & Stock Validation
       ↓
Razorpay Order
       ↓
Razorpay Checkout
       ↓
Server-Side Verification
       ↓
Order Confirmation
       ↓
Inventory Update
       ↓
Audit Trail

## 🤖 AI Agent

AgentPay AI uses an agent-oriented architecture to turn natural-language shopping requests into actionable commerce workflows.

Instead of requiring users to manually search, filter, compare, and purchase products, the user can simply describe what they want and the AI coordinates the shopping process.

### 🧠 Agent Workflow

```text
User Request
     │
     ▼
┌──────────────────────┐
│   Supervisor Agent   │
│  Intent Understanding│
└──────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ Search Agent │
    │   Products   │
    └──────┬───────┘
           │
           ▼
   Product Filtering
           │
           ▼
    Product Ranking
           │
           ▼
 AI Recommendation + Reasons
           │
           ▼
       User Selects
        "Buy with AI"
           │
           ▼
┌──────────────────────┐
│   Purchase Workflow  │
│ Authentication       │
│ Stock Validation     │
│ Spending Guardrail   │
│ Payment Creation     │
└──────────┬───────────┘
           │
           ▼
       Razorpay


       ## 🔐 Authentication & Security

AgentPay AI implements multiple layers of authentication and security to protect user accounts, purchase operations, payment workflows, and sensitive application data.

The security architecture follows a simple principle:

> **The frontend can request an operation, but the backend decides whether that operation is allowed.**

---

### 🔑 Authentication Architecture

AgentPay supports two authentication methods:

- Email & Password
- Google Sign-In

After successful authentication, the backend issues a JWT access token.

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


             ## 🗄️ Database Design

AgentPay AI uses **PostgreSQL** as its relational database with **Prisma ORM** for type-safe database access and schema management.

The database is designed to support:

- User authentication
- Product catalog
- Orders
- Razorpay payment tracking
- Spending limits
- AI purchase decisions
- Guardrail results
- Audit logging
- Product inventory management

---

### 🏗️ Database Architecture

```text
                    PostgreSQL
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
      User           Product           Order
        │               │                │
        │               │                │
        └───────────────┼────────────────┘
                        │
                        ▼
                  AgentAction
                   (Audit Log)


                   ## 🛠️ Tech Stack

AgentPay AI is built using a modern full-stack architecture with a focus on **AI-powered commerce, secure backend services, relational data management, and online payments**.

### 🎨 Frontend

| Technology | Purpose |
|---|---|
| **React** | Building the interactive user interface |
| **TypeScript** | Type-safe frontend development |
| **Vite** | Fast development server and production build |
| **Tailwind CSS** | Responsive and modern UI styling |
| **React Hooks** | Managing application state and component lifecycle |
| **Fetch API** | Communicating with backend REST APIs |

The frontend provides:

- AI shopping interface
- Conversational AI chat
- Product recommendations
- Product ranking explanations
- Authentication UI
- Spending guardrail status
- Razorpay checkout integration
- Payment status and order feedback
- Responsive dashboard-style interface

---

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Backend JavaScript runtime |
| **Express.js** | REST API framework |
| **TypeScript** | Type-safe backend development |
| **Zod** | Request validation and schema validation |
| **CORS** | Cross-origin request handling |
| **dotenv** | Environment variable management |

The backend is responsible for:

- Authentication
- Authorization
- AI orchestration
- Product search
- Purchase workflow
- Spending-limit enforcement
- Stock validation
- Order management
- Payment creation
- Payment verification
- Audit logging

---

### 🤖 AI

| Technology | Purpose |
|---|---|
| **OpenAI API** | Natural-language understanding and AI agent functionality |

The AI layer is used for:

- Understanding natural-language shopping requests
- Detecting user intent
- Extracting product requirements
- Product search assistance
- Product recommendation
- Ranking explanations
- Conversational shopping assistance

The AI is separated from security-critical operations.

```text
User
  ↓
AI understands request
  ↓
Product recommendations
  ↓
User chooses product
  ↓
Backend validates purchase
  ↓
Spending Guardrail
  ↓
Razorpay Payment


## 🔮 Future Improvements

AgentPay AI is designed as a foundation for **secure agentic commerce**. The current implementation focuses on AI-powered product discovery, spending guardrails, authentication, Razorpay payments, inventory management, and auditability.

The following improvements are planned for future versions.

### 🔔 1. Razorpay Webhooks

Add Razorpay webhooks to handle asynchronous payment events such as:

```text
payment.captured
payment.failed
order.paid
refund.created
refund.processed

## 👨‍💻 Author

### Muhammed Farahid

B.Tech Computer Science & Engineering student at **National Institute of Technology Srinagar (NIT Srinagar)**, passionate about **Full-Stack Development, Data Structures & Algorithms, AI-powered applications, and backend systems**.

I built **AgentPay AI** to explore how AI agents can be integrated with real-world commerce and payment systems while keeping security-critical decisions under deterministic backend control.

### 💻 Interests

- Full-Stack Web Development
- AI & Agentic Applications
- Backend Engineering
- Data Structures & Algorithms
- Payment Systems
- Secure API Design
- Database Systems

## GitHub:
https://github.com/mohdfarahidali987-sketch

## AgentPay AI:
https://github.com/mohdfarahidali987-sketch/AgentPay