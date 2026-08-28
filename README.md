# 🤖 AgentPay AI

## AI-Powered Agentic Commerce Platform

AgentPay AI is a full-stack **AI-powered agentic commerce platform** that allows users to shop using natural language.

Instead of manually searching, filtering, comparing, and purchasing products, users can simply describe what they need.

For example:

> "Find me a gaming mouse under ₹2,000 with good reviews."

AgentPay AI understands the user's request, identifies the shopping intent, searches and ranks relevant products, checks the user's spending limit, and—when approved—initiates a secure Razorpay payment flow.

---

# 🌐 Demo

## 🚀 Live Application

**Live Demo:** Coming Soon

> The production URL will be added after deployment.

---

# 🎥 Demo Video

## Full Product Walkthrough

**Demo Video:** Add your YouTube / Loom link here

The demo showcases the complete AgentPay workflow:

- User authentication
- Natural-language shopping
- AI intent understanding
- Product search
- Product ranking
- AI recommendation reasoning
- Spending-limit guardrail
- Out-of-budget purchase blocking
- Razorpay Checkout
- Payment verification
- Order completion
- Inventory update
- Audit logging

### Recommended Demo Flow

```text
User
  │
  ▼
Natural Language Request
  │
  ▼
AI Shopping Agent
  │
  ▼
Intent Understanding
  │
  ▼
Product Search & Ranking
  │
  ▼
AI Recommendations
  │
  ▼
User Selects Product
  │
  ▼
Purchase Request
  │
  ▼
JWT Authentication
  │
  ▼
Spending Guardrail
  │
  ├─────────────── BLOCKED
  │                    │
  │                    ▼
  │              Explain Reason
  │
  └─────────────── APPROVED
                       │
                       ▼
                 Razorpay Order
                       │
                       ▼
                Razorpay Checkout
                       │
                       ▼
                Payment Completed
                       │
                       ▼
              Signature Verification
                       │
                       ▼
                  Order = PAID
                       │
                       ▼
                 Stock Decrement
                       │
                       ▼
                  Audit Record