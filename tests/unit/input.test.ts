import { describe, expect, it } from 'vitest';
import { intentFromKeys, isMoveKey } from '../../src/game/engine/input';

describe('intentFromKeys', () => {
  it('is zero with nothing pressed', () => {
    expect(intentFromKeys(new Set())).toEqual({ x: 0, y: 0 });
  });

  it('reads WASD by physical key and the arrow keys', () => {
    expect(intentFromKeys(new Set(['KeyD']))).toEqual({ x: 1, y: 0 });
    expect(intentFromKeys(new Set(['ArrowLeft']))).toEqual({ x: -1, y: 0 });
    expect(intentFromKeys(new Set(['KeyW']))).toEqual({ x: 0, y: -1 });
    expect(intentFromKeys(new Set(['ArrowDown']))).toEqual({ x: 0, y: 1 });
  });

  it('cancels opposite keys and combines axes', () => {
    expect(intentFromKeys(new Set(['KeyA', 'KeyD']))).toEqual({ x: 0, y: 0 });
    expect(intentFromKeys(new Set(['KeyD', 'ArrowUp']))).toEqual({ x: 1, y: -1 });
  });
});

describe('isMoveKey', () => {
  it('recognises only movement keys', () => {
    expect(isMoveKey('KeyW')).toBe(true);
    expect(isMoveKey('ArrowRight')).toBe(true);
    expect(isMoveKey('KeyE')).toBe(false);
    expect(isMoveKey('Tab')).toBe(false);
  });
});
