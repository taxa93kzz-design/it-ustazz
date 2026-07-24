import assert from "node:assert/strict";
import test from "node:test";
import { createUserSchema, loginSchema, passwordSchema } from "../auth-schemas";
import { getSafeOrigin } from "../safe-origin";

test("email немесе username логинін қабылдайды", () => {
  assert.equal(loginSchema.safeParse({ identifier: "ustaz", password: "Secret1234", remember: true }).success, true);
  assert.equal(loginSchema.safeParse({ identifier: "ustaz@mektep.kz", password: "Secret1234", remember: false }).success, true);
});

test("бос логин мен парольді қабылдамайды", () => {
  assert.equal(loginSchema.safeParse({ identifier: "", password: "", remember: false }).success, false);
});

test("уақытша пароль саясатын тексереді", () => {
  assert.equal(passwordSchema.safeParse("weakpassword").success, false);
  assert.equal(passwordSchema.safeParse("StrongPass1").success, true);
});

test("жаңа қолданушыда username пішімі мен рөл тексеріледі", () => {
  const base = { fullName: "Тест Мұғалім", username: "test.ustaz", email: "test@example.com", schoolName: "№1 мектеп", role: "teacher", password: "StrongPass1" };
  assert.equal(createUserSchema.safeParse(base).success, true);
  assert.equal(createUserSchema.safeParse({ ...base, role: "owner" }).success, false);
});

test("жергілікті reset redirect origin қауіпсіз сақталады", () => {
  assert.equal(getSafeOrigin("http://localhost:3000/api/auth/forgot-password"), "http://localhost:3000");
});
