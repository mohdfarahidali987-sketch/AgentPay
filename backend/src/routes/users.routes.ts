import { Router } from "express";
import prisma from "../lib/prisma.js";
import { hashPassword, signAccessToken, verifyPassword } from "../lib/auth.js";
import { validateBody, schemas } from "../middleware/validation.middleware.js";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

const router = Router();

// Create a test/demo user
router.post(
  "/",
  validateBody(schemas.createUser),
  async (req, res) => {
    try {
      const { name, email, password, spendingLimit } = req.body;

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
        passwordHash: hashPassword(password),
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
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({
          message: "Invalid email or password",
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

router.post(
  "/google",
  validateBody(schemas.googleLogin),
  async (req, res) => {
    try {
      if (!env.GOOGLE_CLIENT_ID) {
        return res.status(503).json({
          message: "Google login is not configured",
        });
      }

      const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const googleUser = ticket.getPayload();

      if (!googleUser?.sub || !googleUser.email || !googleUser.email_verified) {
        return res.status(401).json({ message: "Google account could not be verified" });
      }

      let user = await prisma.user.findUnique({
        where: { googleSubject: googleUser.sub },
      });

      if (!user) {
        user = await prisma.user.upsert({
          where: { email: googleUser.email.toLowerCase() },
          update: { googleSubject: googleUser.sub },
          create: {
            name: googleUser.name || googleUser.email.split("@")[0],
            email: googleUser.email.toLowerCase(),
            googleSubject: googleUser.sub,
          },
        });
      }

      const token = signAccessToken({ userId: user.id, email: user.email });
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
      console.error("Google login failed:", error);
      return res.status(401).json({ message: "Google login failed" });
    }
  }
);

export default router;