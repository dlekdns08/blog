import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const token = process.env.CLAUDE_TOKEN;

  if (!token) {
    return Response.json({ ok: false, error: "CLAUDE_TOKEN 환경변수가 없습니다." }, { status: 503 });
  }

  try {
    const client = new Anthropic({ apiKey: token });
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 16,
      messages: [{ role: "user", content: "ping" }],
    });
    const text = res.content.find((b) => b.type === "text")?.text ?? "";
    return Response.json({ ok: true, reply: text, tokenPrefix: token.slice(0, 10) + "..." });
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
