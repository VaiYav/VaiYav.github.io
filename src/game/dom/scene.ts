import { COUCH, OUTER, PLACEMENTS } from '../../data/game/map';
import type { Camera } from '../engine/camera';
import { WORLD } from '../engine/viewport';
import { drawBackdrop } from '../render/background';
import { drawFloors, drawWalls } from '../render/floor';
import { heroFrame, type HeroAnim } from '../render/hero';
import { OBJECT_ART, couch } from '../render/objects';
import { fillOn, frameAt, offset } from '../render/painter';
import { HERO_PALETTE, NEON, SHADOW } from '../render/palette';
import { outlined, paintSprite, type Sprite } from '../render/sprites';
import { walkFrame, type HeroState } from '../world/hero';

export interface SceneFrame {
  readonly time: number;
  readonly hero: HeroState;
  readonly camera: Camera;
}

export interface Scene {
  /** Paints one frame. The context is expected to be scaled to world pixels. */
  draw(ctx: CanvasRenderingContext2D, frame: SceneFrame): void;
}

interface HeroArt {
  readonly body: HTMLCanvasElement;
  readonly shadow: HTMLCanvasElement;
}

const WALK_FRAMES = 8;
const IDLE_FRAMES = 2;
const IDLE_FPS = 2;
const SHADOW_OFFSET = { x: 2, y: 3 } as const;
/** The sway never moves the building's edge further than this, so the backdrop is skipped deeper inside. */
const SWAY_MARGIN = 8;
const COVERED = { x: OUTER.x + SWAY_MARGIN, y: OUTER.y + SWAY_MARGIN, w: OUTER.w - SWAY_MARGIN * 2, h: OUTER.h - SWAY_MARGIN * 2 } as const;

function createLayer(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available in this browser.');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

function spriteCanvas(sprite: Sprite, tint?: string): HTMLCanvasElement {
  const layer = createLayer(sprite.w, sprite.h);
  paintSprite(layer.ctx, sprite, HERO_PALETTE, tint);
  return layer.canvas;
}

function heroArt(anim: HeroAnim, frames: number): readonly HeroArt[] {
  return Array.from({ length: frames }, (_, f) => {
    const sprite = outlined(heroFrame(anim, f), 'K');
    return { body: spriteCanvas(sprite), shadow: spriteCanvas(sprite, SHADOW) };
  });
}

/** Floors and walls never change, so they are painted once. */
function staticLayer(): HTMLCanvasElement {
  const layer = createLayer(WORLD.width, WORLD.height);
  const fill = fillOn(layer.ctx);
  drawFloors(fill);
  drawWalls(fill);
  return layer.canvas;
}

function drawTurned(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number, angle: number): void {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angle);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
}

/** Builds the sprite caches and returns a painter for whole frames. */
export function createScene(): Scene {
  const ground = staticLayer();
  const world = createLayer(WORLD.width, WORLD.height);
  const walk = heroArt('walk', WALK_FRAMES);
  const idle = heroArt('idle', IDLE_FRAMES);
  const fill = fillOn(world.ctx);

  const drawWorld = ({ time, hero }: SceneFrame) => {
    world.ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    world.ctx.drawImage(ground, 0, 0);
    couch(offset(fill, COUCH.x, COUCH.y), time);
    for (const placement of PLACEMENTS) OBJECT_ART[placement.id]?.(offset(fill, placement.x, placement.y), time);
    const art = hero.moving ? walk[walkFrame(hero.distance)] : idle[frameAt(time, IDLE_FPS) % IDLE_FRAMES];
    drawTurned(world.ctx, art.shadow, hero.x + SHADOW_OFFSET.x, hero.y + SHADOW_OFFSET.y, hero.angle);
    drawTurned(world.ctx, art.body, hero.x, hero.y, hero.angle);
  };

  return {
    draw(ctx, frame) {
      drawWorld(frame);
      if (frame.camera.angle === 0) { ctx.fillStyle = NEON.bg; ctx.fillRect(0, 0, WORLD.width, WORLD.height); }
      else drawBackdrop(ctx, frame.time, COVERED);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(WORLD.width / 2, WORLD.height / 2);
      ctx.rotate(frame.camera.angle);
      ctx.scale(frame.camera.scale, frame.camera.scale);
      ctx.drawImage(world.canvas, -WORLD.width / 2, -WORLD.height / 2);
      ctx.restore();
    },
  };
}
