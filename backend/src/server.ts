import "dotenv/config";
import express from "express";
import cors from "cors";

// ✅ Validate environment first
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { requestLoggingMiddleware } from "./middleware/logging.middleware";
import { errorHandlingMiddleware } from "./middleware/error.middleware";

import productsRouter from "./routes/product.routes.js";
import agentRouter from "./routes/agent.routes";
import usersRouter from "./routes/users.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(cors());
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