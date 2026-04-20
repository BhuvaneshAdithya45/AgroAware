/**
 * Unit tests for auth routes (/api/auth)
 *
 * These tests validate the input validation logic added to
 * the /register and /login routes without requiring a live MongoDB instance.
 *
 * Run: node --experimental-vm-modules server/src/tests/auth.test.js
 *
 * For a real test suite, install Jest or Vitest and mock MongoDB.
 * This file serves as a lightweight validation script.
 */

import assert from "assert";

// ─── Test helpers ────────────────────────────────────────
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
    } catch (e) {
        console.log(`  ❌ ${name}`);
        console.log(`     ${e.message}`);
        process.exitCode = 1;
    }
}

// ─── Validation functions (extracted from auth.js for testing) ───
function validateRegistration({ name, email, password }) {
    if (!name || !email || !password) {
        return "Name, email, and password are required";
    }
    if (name.trim().length < 2) {
        return "Name must be at least 2 characters";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters";
    }
    return null; // valid
}

function validateLogin({ email, password }) {
    if (!email || !password) {
        return "Email and password are required";
    }
    return null;
}

// ─── Registration Tests ──────────────────────────────────
console.log("\n📋 Registration Validation Tests:");

test("rejects empty body", () => {
    assert.strictEqual(
        validateRegistration({}),
        "Name, email, and password are required"
    );
});

test("rejects missing name", () => {
    assert.strictEqual(
        validateRegistration({ email: "test@x.com", password: "123456" }),
        "Name, email, and password are required"
    );
});

test("rejects short name (1 char)", () => {
    assert.strictEqual(
        validateRegistration({ name: "A", email: "test@x.com", password: "123456" }),
        "Name must be at least 2 characters"
    );
});

test("rejects whitespace-only name", () => {
    assert.strictEqual(
        validateRegistration({ name: "  ", email: "test@x.com", password: "123456" }),
        "Name must be at least 2 characters"
    );
});

test("rejects invalid email (no @)", () => {
    assert.strictEqual(
        validateRegistration({ name: "Farmer", email: "test", password: "123456" }),
        "Please enter a valid email address"
    );
});

test("rejects invalid email (no domain)", () => {
    assert.strictEqual(
        validateRegistration({ name: "Farmer", email: "test@", password: "123456" }),
        "Please enter a valid email address"
    );
});

test("rejects short password (5 chars)", () => {
    assert.strictEqual(
        validateRegistration({ name: "Farmer", email: "test@x.com", password: "12345" }),
        "Password must be at least 6 characters"
    );
});

test("accepts valid registration", () => {
    assert.strictEqual(
        validateRegistration({ name: "Farmer Raju", email: "raju@farm.in", password: "securepass" }),
        null
    );
});

test("accepts 2-char name", () => {
    assert.strictEqual(
        validateRegistration({ name: "AB", email: "ab@x.com", password: "123456" }),
        null
    );
});

test("accepts 6-char password", () => {
    assert.strictEqual(
        validateRegistration({ name: "Test", email: "t@x.com", password: "123456" }),
        null
    );
});

// ─── Login Tests ─────────────────────────────────────────
console.log("\n📋 Login Validation Tests:");

test("rejects empty body", () => {
    assert.strictEqual(validateLogin({}), "Email and password are required");
});

test("rejects missing email", () => {
    assert.strictEqual(
        validateLogin({ password: "123456" }),
        "Email and password are required"
    );
});

test("rejects missing password", () => {
    assert.strictEqual(
        validateLogin({ email: "test@x.com" }),
        "Email and password are required"
    );
});

test("accepts valid login input", () => {
    assert.strictEqual(
        validateLogin({ email: "test@x.com", password: "123456" }),
        null
    );
});

console.log("\n✅ All auth validation tests completed!\n");
