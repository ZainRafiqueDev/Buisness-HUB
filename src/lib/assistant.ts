import type { AssistantAction, Business } from "./businesses";

// Deterministic retrieval so a live walkthrough never goes off-script.
// Production swaps `answer()` for an LLM call that receives the same knowledge
// base as retrieved context and the same actions as tools.

export interface AssistantReply {
  reply: string;
  source: string;
  handoff: boolean;
  actions: AssistantAction[];
}

export function answer(biz: Business, question: string): AssistantReply {
  const q = question.toLowerCase();
  let best: Business["kb"][number] | undefined;
  let bestScore = 0;
  for (const doc of biz.kb) {
    const score = doc.keywords.reduce((s, k) => (q.includes(k) ? s + k.split(" ").length : s), 0);
    if (score > bestScore) {
      best = doc;
      bestScore = score;
    }
  }
  if (!best) {
    return {
      reply:
        "I don't have a confirmed answer for that, and I'd rather not guess. Leave your email and a member of the team will reply within one business day.",
      source: "Passed to the team",
      handoff: true,
      actions: [{ type: "capture_lead", interest: "question" }],
    };
  }
  return { reply: best.answer, source: best.title, handoff: false, actions: best.actions ?? [] };
}
