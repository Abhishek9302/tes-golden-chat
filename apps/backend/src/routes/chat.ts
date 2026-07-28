import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callHuggingFace(
  messages: ChatMessage[],
  model: string
): Promise<{ ok: boolean; status: number; data?: any }> {
  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 512
    })
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  return { ok: true, status: res.status, data: await res.json() };
}

async function callGroq(messages: ChatMessage[]): Promise<any> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages,
      max_tokens: 512
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq failed: ${text}`);
  }
  return res.json();
}

function extractReply(data: any): string {
  return data?.choices?.[0]?.message?.content || "...";
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const systemPrompt =
    "You are a supportive persona coach. Keep replies concise, warm, and actionable.";
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message }
  ];

  try {
    const provider = process.env.LLM_PROVIDER || "huggingface";

    if (provider === "groq") {
      const data = await callGroq(messages);
      return res.json({ reply: extractReply(data) });
    }

    const hf = await callHuggingFace(messages, process.env.FINE_TUNED_MODEL_ID!);
    if (hf.ok) {
      return res.json({ reply: extractReply(hf.data) });
    }

    if ([400, 402, 403].includes(hf.status)) {
      const data = await callGroq(messages);
      return res.json({ reply: extractReply(data) });
    }

    return res
      .status(502)
      .json({ error: "HuggingFace request failed", status: hf.status });
  } catch (err: any) {
    console.error("chat error", err);
    res.status(500).json({ error: "LLM error", detail: err.message });
  }
});

export default router;
