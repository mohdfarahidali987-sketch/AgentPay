import "dotenv/config";
import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { requestLoggingMiddleware } from "./middleware/logging.middleware.js";
import { errorHandlingMiddleware } from "./middleware/error.middleware.js";

import productsRouter from "./routes/product.routes.js";
import agentRouter from "./routes/agent.routes.js";
import usersRouter from "./routes/users.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
const app = express();

app.use(cors());

app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhookRouter
);
app.use(express.json());

// ✅ Add request logging middleware
app.use(requestLoggingMiddleware);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AgentPay AI",
  });
});

app.use("/api/products", productsRouter);

app.use("/api/agent", agentRouter);
app.use("/api/users", usersRouter);
app.use("/api/payment", paymentRoutes);

// ✅ Add global error handling middleware
app.use(errorHandlingMiddleware);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 AgentPay AI running`, {
    endpoint: `http://localhost:${PORT}`,
  });
});