import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/game/**/*.ts', 'src/data/game/**/*.ts'],
      // boot.ts only wires the DOM together; the end-to-end tests cover it.
      exclude: ['src/game/boot.ts', 'src/data/game/flags.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
