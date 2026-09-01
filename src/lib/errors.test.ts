import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeContractError } from "./errors.ts";

test("maps custom solidity errors to copy", () => {
  assert.equal(
    decodeContractError(new Error("execution reverted: PolicyNotFound")).message,
    "This policy does not exist.",
  );
  assert.equal(
    decodeContractError(new Error("AlreadyClaimed()")).code,
    "AlreadyClaimed",
  );
  assert.equal(
    decodeContractError(new Error("InsufficientPremium")).message,
    "Premium sent is below the quoted amount.",
  );
});

test("maps wallet rejection", () => {
  const result = decodeContractError(new Error("User rejected the request"));
  assert.equal(result.code, "UserRejected");
});
