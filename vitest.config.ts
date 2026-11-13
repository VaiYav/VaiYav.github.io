import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/game/**/*.ts', 'src/data/game/**/*.ts'],
      // boot.ts and dom/ need a real browser; the end-to-end tests cover them.
      exclude: ['src/game/boot.ts', 'src/game/dom/**'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
