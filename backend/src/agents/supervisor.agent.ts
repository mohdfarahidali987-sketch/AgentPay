import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

const intentSchema = z.object({
  intent: z.enum([
    "SEARCH_PRODUCT",
    "PURCHASE_PRODUCT",
    "UNKNOWN",
  ]),
  query: z.string().default(""),
  maxPrice: z.number().nonnegative().nullable().default(null),
});

export type CommerceIntent = z.infer<typeof intentSchema>;

export async function understandCommerceIntent(
  message: string
): Promise<CommerceIntent> {
  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || "openai/gpt-oss-20b",

    temperature: 0,

    response_format: {
      type: "json_object",
    },

    messages: [
      {
        role: "system",
        content: `
You are the Supervisor Agent for AgentPay AI.

Your job is to understand a user's commerce request.

Classify the request into exactly one intent:

SEARCH_PRODUCT
PURCHASE_PRODUCT
UNKNOWN

Rules:

SEARCH_PRODUCT:
The user only wants to find, search, compare or recommend products.

PURCHASE_PRODUCT:
The user explicitly wants to buy, purchase, order or checkout a product.

UNKNOWN:
The request is unrelated to shopping or cannot be understood.

Extract:
- query: the product the user is looking for
- maxPrice: maximum price mentioned by the user
- If no maximum price is mentioned, use null.

Return JSON only:

{
  "intent": "SEARCH_PRODUCT | PURCHASE_PRODUCT | UNKNOWN",
  "query": "product description",
  "maxPrice": 1500
}

Never invent a price.
Never invent a product.
`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  const raw =
    completion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(raw);

    const result = intentSchema.safeParse(parsed);

    if (!result.success) {
      console.error(
        "Invalid supervisor response:",
        result.error.flatten()
      );

      return {
        intent: "UNKNOWN",
        query: "",
        maxPrice: null,
      };
    }

    return result.data;
  } catch (error) {
    console.error(
      "Failed to parse supervisor response:",
      error
    );

    return {
      intent: "UNKNOWN",
      query: "",
      maxPrice: null,
    };
  }
}