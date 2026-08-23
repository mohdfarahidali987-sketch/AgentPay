import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// Create a test/demo user
router.post("/", async (req, res) => {
  try {
    const { name, email, spendingLimit } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "name and email are required",
      });
    }

    const limit =
      spendingLimit === undefined
        ? 5000
        : Number(spendingLimit);

    if (!Number.isFinite(limit) || limit < 0) {
      return res.status(400).json({
        message: "spendingLimit must be a valid non-negative number",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        user: existingUser,
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        spendingLimit: limit,
      },
    });

    return res.status(201).json({
      user,
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    return res.status(500).json({
      message: "Failed to create user",
    });
  }
});

// Get user
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);

    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
});

export default router;