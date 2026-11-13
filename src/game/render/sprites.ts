/** A sprite is a grid of palette keys; null cells are transparent. */
export interface Sprite {
  readonly w: number;
  readonly h: number;
  readonly cells: readonly (string | null)[];
}

/** Fills a rectangle of the sprite with a palette key; '.' erases. */
export type SpriteRect = (x: number, y: number, w: number, h: number, key: string) => void;

export type Palette = Readonly<Record<string, string>>;

/** The part of a canvas context the painters need; easy to fake in tests. */
export interface FillTarget {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
}

/** Builds a sprite from rectangle calls; anything outside the grid is clipped. */
export function makeSprite(w: number, h: number, draw: (rect: SpriteRect) => void): Sprite {
  const cells: (string | null)[] = new Array(w * h).fill(null);
  draw((x, y, width, height, key) => {
    for (let j = Math.max(y, 0); j < Math.min(y + height, h); j++) {
      for (let i = Math.max(x, 0); i < Math.min(x + width, w); i++) cells[j * w + i] = key === '.' ? null : key;
    }
  });
  return { w, h, cells };
}

/** Returns a copy with a one-pixel outline around the shape; it is two pixels wider and taller. */
export function outlined(sprite: Sprite, key: string): Sprite {
  const w = sprite.w + 2;
  const h = sprite.h + 2;
  const at = (x: number, y: number): string | null =>
    x >= 1 && y >= 1 && x <= sprite.w && y <= sprite.h ? sprite.cells[(y - 1) * sprite.w + x - 1] : null;
  const cells = Array.from({ length: w * h }, (_, index) => {
    const x = index % w;
    const y = Math.floor(index / w);
    const own = at(x, y);
    if (own) return own;
    return at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1) ? key : null;
  });
  return { w, h, cells };
}

/** Paints a sprite pixel by pixel. With a tint, every pixel takes that one colour. */
export function paintSprite(target: FillTarget, sprite: Sprite, palette: Palette, tint?: string): void {
  sprite.cells.forEach((key, index) => {
    if (!key) return;
    target.fillStyle = tint ?? palette[key] ?? key;
    target.fillRect(index % sprite.w, Math.floor(index / sprite.w), 1, 1);
  });
}
