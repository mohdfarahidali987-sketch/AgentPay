# Unit Testing Guide

This directory contains unit tests for the AgentPay AI backend.

## Setup

Tests use **Vitest** - a lightning-fast unit test framework built on Vite.

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI dashboard
npm run test:ui
```

## Test Coverage

### ✅ Implemented Tests

1. **Auth Tests** (`src/lib/__tests__/auth.test.ts`)
   - JWT token signing and verification
   - Authorization header parsing
   - Token validation and error handling
   - Invalid/tampered token detection

2. **Guardrail Tests** (`src/guardrails/__tests__/guardrail.test.ts`)
   - Spending limit enforcement
   - Valid and blocked purchases
   - Edge cases (large amounts, decimals)
   - Remaining limit calculations

3. **Logger Tests** (`src/lib/__tests__/logger.test.ts`)
   - Log formatting with timestamps
   - Context injection in logs
   - Error logging with stack traces
   - Multiple log levels

4. **Environment Validation Tests** (`src/config/__tests__/env.test.ts`)
   - Required environment variables
   - Default value handling
   - Invalid variable detection
   - Type conversion (e.g., PORT to number)

5. **Validation Schema Tests** (`src/middleware/__tests__/validation.test.ts`)
   - User creation validation
   - Email format validation
   - Amount validation (positive numbers)
   - Payment verification schemas
   - Edge cases (null, undefined, extra properties)

## Test Structure

```
src/
├── lib/
│   ├── auth.ts
│   └── __tests__/
│       └── auth.test.ts
├── guardrails/
│   ├── guardrail.service.ts
│   └── __tests__/
│       └── guardrail.test.ts
├── middleware/
│   ├── validation.middleware.ts
│   └── __tests__/
│       └── validation.test.ts
└── config/
    ├── env.ts
    └── __tests__/
        └── env.test.ts
```

## Writing New Tests

### Example Test File Structure

```typescript
import { describe, it, expect } from "vitest";

describe("Feature Name", () => {
  describe("Subfeature", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test";

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe("expected");
    });
  });
});
```

### Best Practices

1. **Test Names** - Use clear, descriptive test names that explain what is being tested
2. **Arrange-Act-Assert** - Follow the AAA pattern
3. **One Assertion Focus** - Each test should verify one specific behavior
4. **Edge Cases** - Test boundary conditions, null values, empty strings
5. **Error Cases** - Test expected errors and error messages

## Continuous Integration

Tests are ready to integrate with CI/CD:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:run
```

## Next Steps

- [ ] Add integration tests for API routes
- [ ] Add E2E tests with Playwright
- [ ] Setup code coverage reporting
- [ ] Add database tests with test fixtures
- [ ] Add payment webhook tests

## Debugging Tests

```bash
# Run specific test file
npm run test -- src/lib/__tests__/auth.test.ts

# Run tests matching pattern
npm run test -- --grep "JWT"

# Run with verbose output
npm run test -- --reporter=verbose
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers Compatibility](https://vitest.dev/api/expect.html)
