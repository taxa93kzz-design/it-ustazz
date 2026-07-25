import assert from "node:assert/strict";
import test from "node:test";
import { chatRequestSchema } from "../chat-schema";

test("чат сұрағын және қысқа тарихты қабылдайды", () => {
  const result = chatRequestSchema.safeParse({
    message: "Python циклін қалай түсіндіремін?",
    history: [{ role: "assistant", content: "Сәлем!" }],
  });
  assert.equal(result.success, true);
});

test("бос, тым ұзын және шектен көп тарихты қабылдамайды", () => {
  assert.equal(chatRequestSchema.safeParse({ message: "", history: [] }).success, false);
  assert.equal(chatRequestSchema.safeParse({ message: "x".repeat(1501), history: [] }).success, false);
  assert.equal(chatRequestSchema.safeParse({
    message: "Сұрақ",
    history: Array.from({ length: 13 }, () => ({ role: "user", content: "мәтін" })),
  }).success, false);
});
