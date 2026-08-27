import { Router } from "express";
import prisma from "../lib/prisma";
import { signAccessToken } from "../lib/auth";
import { validateBody, schemas } from "../middleware/validation.middleware";

const router = Router();

// Create a test/demo user
router.post(
  "/",
  validateBody(schemas.createUser),
  async (req, res) => {
    try {
      const { name, email, spendingLimit } = req.body;

      const limit =
        spendingLimit === undefined
          ? 5000
          : Number(spendingLimit);

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

// Login endpoint - Get JWT token
router.post(
  "/login",
  validateBody(schemas.login),
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const token = signAccessToken({
        userId: user.id,
        email: user.email,
      });

      return res.json({
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          spendingLimit: user.spendingLimit,
        },
      });
    } catch (error) {
      console.error("Login failed:", error);

      return res.status(500).json({
        message: "Login failed",
      });
    }
  }
);

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