import { describe, expect, it } from 'vitest';
import { isGameEnabled } from '../../src/data/game/flags';

describe('isGameEnabled', () => {
  it('is on in development', () => {
    expect(isGameEnabled({ DEV: true })).toBe(true);
  });

  it('is off in a production build by default', () => {
    expect(isGameEnabled({ DEV: false })).toBe(false);
    expect(isGameEnabled({})).toBe(false);
  });

  it('turns on in production only for the exact value "on"', () => {
    expect(isGameEnabled({ DEV: false, PUBLIC_RESUME_GAME: 'on' })).toBe(true);
    for (const value of ['', 'off', 'true', '1', 'ON']) {
      expect(isGameEnabled({ DEV: false, PUBLIC_RESUME_GAME: value }), value).toBe(false);
    }
  });
});
