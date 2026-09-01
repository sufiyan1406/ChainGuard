import assert from "node:assert/strict";
import { test } from "node:test";
import { validateBuy } from "./validateBuy.ts";

test("rejects empty coverage and missing location", () => {
  const result = validateBuy({
    locationId: null,
    coverageInput: "",
    connected: true,
    isCorrectChain: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.location, "Select a location.");
  assert.equal(result.errors.coverage, "Enter a coverage amount.");
});

test("rejects coverage below minimum", () => {
  const result = validateBuy({
    locationId: 1n,
    coverageInput: "0.001",
    connected: true,
    isCorrectChain: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.coverage, "Minimum coverage is 0.01 ETH.");
});

test("rejects coverage above maximum", () => {
  const result = validateBuy({
    locationId: 1n,
    coverageInput: "9",
    connected: true,
    isCorrectChain: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.coverage, "Maximum coverage is 5 ETH.");
});

test("requires a connected wallet on the right chain", () => {
  const disconnected = validateBuy({
    locationId: 1n,
    coverageInput: "0.1",
    connected: false,
    isCorrectChain: true,
  });
  assert.equal(disconnected.ok, false);
  assert.ok(disconnected.errors.wallet);

  const wrongChain = validateBuy({
    locationId: 1n,
    coverageInput: "0.1",
    connected: true,
    isCorrectChain: false,
  });
  assert.equal(wrongChain.ok, false);
  assert.equal(wrongChain.errors.network, "Switch to Arbitrum Sepolia.");
});

test("accepts a valid Jakarta 0.1 ETH quote request", () => {
  const result = validateBuy({
    locationId: 1n,
    coverageInput: "0.10",
    connected: true,
    isCorrectChain: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.coverage, 10n ** 17n);
});
