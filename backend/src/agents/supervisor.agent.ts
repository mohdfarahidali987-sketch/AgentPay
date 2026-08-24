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
    "GENERAL_CHAT",
    "UNKNOWN",
  ]),

  query: z.string().default(""),

  maxPrice: z
    .number()
    .nonnegative()
    .nullable()
    .default(null),

  response: z.string().default(""),
});

export type CommerceIntent =
  z.infer<typeof intentSchema>;


export async function understandCommerceIntent(
  message: string
): Promise<CommerceIntent> {

  const completion =
    await client.chat.completions.create({
      model:
        process.env.AI_MODEL ||
        "openai/gpt-oss-20b",

      temperature: 0.2,

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",

          content: `
You are AgentPay AI, an intelligent shopping
and commerce assistant.

Your job is to understand the user's message
and decide what should happen next.

You can handle both normal conversation and
commerce requests.

Classify the user's message into exactly ONE
of these intents:

1. SEARCH_PRODUCT
2. PURCHASE_PRODUCT
3. GENERAL_CHAT
4. UNKNOWN


========================================
SEARCH_PRODUCT
========================================

Use SEARCH_PRODUCT when the user wants to:

- find products
- search for products
- discover products
- recommend products
- compare products
- see products
- ask whether a product is available

Examples:

"show me mice"

"find a laptop"

"I need a wireless mouse"

"show me accessories under 2000"

"do you have a USB hub?"

"find something for my laptop"

"mous under 2k"

"show me cheap keyboards"


IMPORTANT:

Understand spelling mistakes, abbreviations,
informal language and natural language.

Examples:

"mous" → "mouse"

"2k" → 2000

"2 thousand" → 2000

"under 2k" → maximum price 2000

"below 1500" → maximum price 1500

"less than 3000" → maximum price 3000


========================================
PURCHASE_PRODUCT
========================================

Use PURCHASE_PRODUCT when the user explicitly
wants to buy, order, checkout or purchase
something.

Examples:

"buy the mouse"

"I want to purchase this"

"order the laptop"

"checkout this product"

"buy it"


IMPORTANT:

Do NOT actually perform the purchase.

Only classify the user's intention.

The backend guardrails and payment system
handle the actual purchase.


========================================
GENERAL_CHAT
========================================

Use GENERAL_CHAT for normal conversation,
questions about AgentPay, greetings, or
questions that do not require a product search.

Examples:

"hi"

"hello"

"hey"

"how are you?"

"what can you do?"

"who are you?"

"what is AgentPay?"

"how does this work?"

"tell me about AgentPay"

"thank you"

"bye"


For GENERAL_CHAT, provide a helpful,
short response in the "response" field.

Example:

{
  "intent": "GENERAL_CHAT",
  "query": "",
  "maxPrice": null,
  "response": "Hi! I'm AgentPay AI. I can help you find products and complete purchases safely."
}


========================================
UNKNOWN
========================================

Use UNKNOWN only when the message cannot
reasonably be understood or is completely
outside the capabilities of AgentPay.

Do NOT use UNKNOWN just because the user
has spelling mistakes or uses informal language.

For example:

"mous under 2k"

must NOT be UNKNOWN.

It should be:

SEARCH_PRODUCT


========================================
PRICE EXTRACTION
========================================

Extract the maximum price when mentioned.

Examples:

"under ₹2000" → 2000

"below 1500" → 1500

"less than 2k" → 2000

"under 2 thousand" → 2000

"within ₹5000" → 5000

If no maximum price is mentioned:

maxPrice = null

NEVER invent a price.


========================================
QUERY EXTRACTION
========================================

Extract the main product/category the user
is interested in.

Examples:

"show me mice under 2000"

query = "mouse"

"find accessories below 3000"

query = "accessories"

"I need something for my laptop"

query = "laptop accessories"

Correct obvious spelling mistakes.

Do not invent products that the user did not
request.


========================================
RESPONSE
========================================

For SEARCH_PRODUCT:

response should be ""

For PURCHASE_PRODUCT:

response should be ""

For GENERAL_CHAT:

response should contain a natural,
helpful response.

For UNKNOWN:

response should briefly explain that AgentPay
is primarily designed for shopping and
commerce assistance.


========================================
OUTPUT FORMAT
========================================

Return JSON only.

The JSON MUST have exactly this structure:

{
  "intent": "SEARCH_PRODUCT | PURCHASE_PRODUCT | GENERAL_CHAT | UNKNOWN",
  "query": "",
  "maxPrice": null,
  "response": ""
}

Never return markdown.

Never return explanations outside JSON.
`,
        },

        {
          role: "user",
          content: message,
        },
      ],
    });


  const raw =
    completion.choices[0]?.message?.content ||
    "{}";


  try {

    const parsed =
      JSON.parse(raw);

    const result =
      intentSchema.safeParse(parsed);


    if (!result.success) {

      console.error(
        "Invalid supervisor response:",
        result.error.flatten()
      );

      return {
        intent: "UNKNOWN",
        query: "",
        maxPrice: null,
        response:
          "I'm sorry, I couldn't understand that request.",
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
      response:
        "I'm sorry, I couldn't understand that request.",
    };
  }
}