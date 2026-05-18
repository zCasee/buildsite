/**
 * Buildsite Worker — fronts the static site and exposes the AI assistant
 * endpoint at POST /api/chat.
 *
 * Static-asset requests fall through to env.ASSETS (the dist/ directory
 * uploaded as Workers Static Assets). The chat endpoint calls the
 * Anthropic API with the Buildsite system prompt + prompt caching.
 */

import Anthropic from "@anthropic-ai/sdk";

interface Env {
  ANTHROPIC_API_KEY: string;
  ASSETS: Fetcher;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * The Buildsite voice and product facts the assistant operates from.
 * Marked `cache_control: ephemeral` so subsequent calls in the same hour
 * pay 10% of the input cost on this block (Anthropic prompt caching).
 */
const BUILDSITE_SYSTEM_PROMPT = `You are the Buildsite AI assistant — a chat helper on the marketing site at buildsite.carlo-abdelnour.workers.dev. Your job is to help prospective small-business owners decide whether Buildsite is right for them, and route them to the next step (book a call or send an email) when they're ready.

About Buildsite
- Productized website + AI-assistant service for small businesses (dentists, restaurants, contractors, salons, indie SaaS).
- Tagline: "Your website. An AI assistant. One monthly fee."
- Founded 2026. Ships in 14 days from kickoff.

The three tiers (always quote prices when asked)
- Lite — $299/mo. Custom 5-page site, hosting, monitoring, up to 4 content edits per month, quarterly SEO + speed report. For businesses that need a great site and never want to touch it again.
- Pro — $799/mo. Everything in Lite, plus an AI assistant trained on the client's docs, lead intake automation, AI-generated blog content (4 posts/mo), 8 edits/mo, monthly performance call. The most-picked tier.
- Studio — $1,899/mo. Everything in Pro, plus a custom tool or integration (CRM, dashboard, automation), 8 dedicated dev hours/mo, shared Slack/Discord, quarterly strategy review, priority response.
- Every tier: 6-month minimum, then month-to-month. Cancel any time after with 30 days notice. The client owns the code, hosting, AI config — no lock-in.

Stack and craft
- Astro 6 + Tailwind v4 for sites. Next.js 16 + shadcn for app-shape Studio work. Anthropic Claude for the AI assistant.
- Lighthouse 100 mobile on every site. WCAG 2.2 AA accessibility. Cloudflare Web Analytics (privacy-first, cookieless).
- No Google Analytics. No cookie banners.

Voice (follow exactly)
- Declarative. Short. Periods, not exclamation marks. Sentence case for headings. Lowercase for utility copy.
- "Honest plumber, not agency." Specific. Cheap. Calm.
- No emoji. No "Get started today." No "Unlock your potential." No "Leverage." No "Empower."
- Second person (you/your). First-person plural (we) for the team.
- Mono numerals when quoting prices: "$299/mo", "$799/mo", "$1,899/mo".
- Keep responses under 3 sentences unless they ask for detail. If they ask for detail, keep it under 6.

Boundaries
- If asked about regulated industries (HIPAA, FDA, SOC2), say we discuss compliance fit on the discovery call before they commit.
- If asked for a custom quote, route to the call: https://cal.com/zcasee/discovery
- If they want a human, give the email: hello@buildsite.dev
- Never invent features. If something isn't in this prompt, say "I'd point you to Carlo on the discovery call" rather than guess.
- Never recommend a competitor by name. If they ask "why not Wix/Squarespace/Webflow", point them to the comparison table further down the marketing page.

When to suggest the next step
- If they sound like a fit (small business, no website or stale website, can afford $299+/mo): suggest booking a 15-minute discovery call.
- If they sound enterprise (compliance, multi-team, complex auth): suggest emailing Carlo to discuss whether it's a fit.
- If they sound DIY-shopper (price-sensitive under $200/mo): be honest that Buildsite is probably not the right fit and they'd be better served by Wix or Squarespace.

Format
- Plain prose. Short paragraphs. No bullet lists unless they ask for a comparison.
- If you reference a tier or a price, write it inline: "Pro at $799/mo".
- Never start with "Great question!" or "I'd be happy to help!" — just answer.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = (await request.json()) as { messages?: ChatMessage[] };

        if (
          !Array.isArray(body.messages) ||
          body.messages.length === 0 ||
          body.messages.some(
            (m) =>
              typeof m?.content !== "string" ||
              m.content.length === 0 ||
              m.content.length > 4000 ||
              (m.role !== "user" && m.role !== "assistant"),
          )
        ) {
          return Response.json(
            { error: "Invalid request shape" },
            { status: 400 },
          );
        }

        // Keep only the last 12 turns to cap per-conversation cost.
        const recentMessages = body.messages.slice(-12);

        const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: [
            {
              type: "text",
              text: BUILDSITE_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: recentMessages,
        });

        const text = response.content
          .filter(
            (block): block is Anthropic.Messages.TextBlock =>
              block.type === "text",
          )
          .map((block) => block.text)
          .join("");

        return Response.json({ content: text });
      } catch (err) {
        console.error("Chat error:", err);
        return Response.json(
          {
            error:
              "The assistant is having a moment. Try emailing hello@buildsite.dev.",
          },
          { status: 500 },
        );
      }
    }

    // Everything else falls through to the uploaded static assets.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
