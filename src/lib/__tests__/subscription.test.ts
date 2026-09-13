import assert from "node:assert/strict";
import test from "node:test";
import {
  FREE_AI_GENERATIONS,
  SUBSCRIPTION_PRICE,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
} from "@/constants/subscription";

test("жазылым бағасы мен пробный лимиті дұрыс", () => {
  assert.equal(FREE_AI_GENERATIONS, 2);
  assert.equal(SUBSCRIPTION_PRICE, 5_000);
});

test("WhatsApp сілтемесі дұрыс нөмір мен дайын хабарламаны қамтиды", () => {
  assert.equal(WHATSAPP_NUMBER, "77479522024");
  assert.match(WHATSAPP_URL, /^https:\/\/wa\.me\/77479522024\?text=/);
  assert.match(decodeURIComponent(WHATSAPP_URL), /5000 ₸/);
});
