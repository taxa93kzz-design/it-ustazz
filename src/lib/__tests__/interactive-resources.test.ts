import assert from "node:assert/strict";
import test from "node:test";
import { buildInteractiveSearchQueries } from "../interactive-search-query";
import { mapSearchPage } from "../interactive-resource-mapper";
import { validateResourceUrl } from "../interactive-resource-validator";
import type { InteractiveSearchInput } from "../../types/interactive-resource";

const input: InteractiveSearchInput = {
  topic: "Python шартты операторлары",
  grade: "6",
  learningGoal: "Шартты операторды қолдану",
  purpose: "Білімді бекіту",
  lessonStage: "middle",
  platform: "all",
  activityType: "Код нәтижесін анықтау",
  language: "all",
  durationMinutes: 7,
  keywords: "if else",
};

test("барлық тіл таңдалғанда үш қауіпсіз іздеу сұрауын құрады", () => {
  const queries = buildInteractiveSearchQueries(input);
  assert.deepEqual(queries.map((item) => item.language), ["kk", "ru", "en"]);
  assert.ok(queries.every((item) => item.query.includes("Python")));
});

test("іздеу бетін дайын тапсырма деп көрсетпейді", () => {
  const resource = mapSearchPage("wordwall", input, "kk");
  assert.match(resource.description ?? "", /дайын тапсырма емес/i);
  assert.equal(resource.source, "search");
});

test("рұқсат етілмеген және javascript сілтемелерін қабылдамайды", () => {
  assert.equal(validateResourceUrl("https://evil.example/task").success, false);
  assert.equal(validateResourceUrl("javascript:alert(1)").success, false);
  assert.equal(validateResourceUrl("https://learningapps.org/view123").success, true);
});
