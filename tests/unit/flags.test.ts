import { describe, expect, it } from 'vitest';
import { isGameEnabled } from '../../src/data/game/flags';

describe('isGameEnabled', () => {
  it('is on in development', () => {
    expect(isGameEnabled({ DEV: true })).toBe(true);
  });

  it('is on in a production build by default, whatever host builds it', () => {
    expect(isGameEnabled({ DEV: false })).toBe(true);
    expect(isGameEnabled({})).toBe(true);
    expect(isGameEnabled({ DEV: false, PUBLIC_RESUME_GAME: 'on' })).toBe(true);
  });

  it('can be switched off for a production build with the exact value "off"', () => {
    expect(isGameEnabled({ DEV: false, PUBLIC_RESUME_GAME: 'off' })).toBe(false);
    for (const value of ['', 'OFF', 'false', '0']) {
      expect(isGameEnabled({ DEV: false, PUBLIC_RESUME_GAME: value }), value).toBe(true);
    }
  });

  it('stays on in development even when switched off', () => {
    expect(isGameEnabled({ DEV: true, PUBLIC_RESUME_GAME: 'off' })).toBe(true);
  });
});
