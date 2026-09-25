import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";

const MODEL = "alibaba/qwen3.8-max-prime";

export async function POST(request: Request) {
  const started = Date.now();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt || prompt.length > 8000) {
      return Response.json(
        { error: "Prompt is required and must be 8,000 characters or fewer." },
        { status: 400 },
      );
    }

    const result = await generateText({
      model: MODEL,
      system:
        "You are Qwen, the Solvix AI reasoning assistant. Use strong reasoning and long-context analysis. Be factual, concise, security-conscious, and never invent financial, job, trading, payment, or revenue records. Treat verified data and projections as separate. Do not execute financial or external actions without explicit authorization.",
      prompt,
      maxOutputTokens: 4000,
      providerOptions: {
        gateway: {
          user: user.id,
          tags: ["solvix", "qwen", "qwen3.8-max-prime", "brain-ai"],
        },
      },
    });

    await supabase.from("solvix_ai_events").insert({
      user_id: user.id,
      model: MODEL,
      status: "success",
      input_tokens: result.usage?.inputTokens ?? null,
      output_tokens: result.usage?.outputTokens ?? null,
      latency_ms: Date.now() - started,
    });

    return Response.json({
      model: MODEL,
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Qwen request failed", error);
    return Response.json({ error: "Qwen request failed" }, { status: 500 });
  }
}
