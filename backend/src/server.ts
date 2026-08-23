import "dotenv/config";
import express from "express";
import cors from "cors";

import productsRouter from "./routes/product.routes.js";
import agentRouter from "./routes/agent.routes";
import usersRouter from "./routes/users.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AgentPay AI",
  });
});

app.use("/api/products", productsRouter);

app.use("/api/agent", agentRouter);
app.use("/api/users", usersRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 AgentPay AI running on port ${PORT}`
  );
});