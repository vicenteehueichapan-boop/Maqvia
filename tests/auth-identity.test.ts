import test from "node:test";
import assert from "node:assert/strict";
import { identityFromTrustedHeaders, platformIdentityEnabled } from "../lib/auth-identity.ts";

function claims(values: Record<string, string>) {
  return identityFromTrustedHeaders(new Headers(values));
}

test("only accepts a complete, bounded identity from the trusted boundary", () => {
  assert.equal(claims({ "oai-authenticated-user-id": "alice" }), null);
  assert.equal(claims({ "oai-authenticated-user-email": "alice@example.com" }), null);
  assert.equal(
    claims({
      "oai-authenticated-user-id": "  ",
      "oai-authenticated-user-email": "alice@example.com",
    }),
    null,
  );
  assert.equal(
    claims({
      "oai-authenticated-user-id": "alice",
      "oai-authenticated-user-email": "not-an-email",
    }),
    null,
  );
  assert.equal(
    claims({
      "oai-authenticated-user-id": "x".repeat(257),
      "oai-authenticated-user-email": "alice@example.com",
    }),
    null,
  );
});

test("uses the stable subject as owner key and safely decodes an optional name", () => {
  const identity = claims({
    "oai-authenticated-user-id": " user-123 ",
    "oai-authenticated-user-email": " alice@example.com ",
    "oai-authenticated-user-full-name": "Mar%C3%ADa%20P%C3%A9rez",
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  });
  assert.deepEqual(identity, {
    userId: "user-123",
    email: "alice@example.com",
    fullName: "María Pérez",
    displayName: "María Pérez",
  });
  assert.equal(
    claims({
      "oai-authenticated-user-id": "user-123",
      "oai-authenticated-user-email": "alice@example.com",
      "oai-authenticated-user-full-name": "%ZZ",
      "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
    })?.displayName,
    "alice@example.com",
  );
});

test("production fails closed without an explicitly trusted auth boundary", () => {
  assert.equal(platformIdentityEnabled("production", undefined), false);
  assert.equal(platformIdentityEnabled("production", ""), false);
  assert.equal(platformIdentityEnabled("production", "independent"), false);
  assert.equal(platformIdentityEnabled("production", "sites"), true);
  assert.equal(platformIdentityEnabled("development", undefined), true);
});
