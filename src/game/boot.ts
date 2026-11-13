import { SPAWN, solidRects } from '../data/game/map';
import { bindControls, type Controls } from './dom/controls';
import { createScene } from './dom/scene';
import { cameraAt, clientToView, viewToWorld, worldToView, type Camera } from './engine/camera';
import { createLoop } from './engine/loop';
import { WORLD, fitScale } from './engine/viewport';
import type { Point } from './world/collision';
import { createHero, stepHero, type HeroState } from './world/hero';

export interface GameHandle {
  dispose(): void;
}

/** What the end-to-end tests may read; exposed only in development builds. */
export interface GameProbe {
  hero(): HeroState;
  /** Page coordinates of a world point, for aiming a tap. */
  toClient(world: Point): Point;
}

type ProbeWindow = Window & { __resumeGame?: GameProbe };

/** Applies a pending tap and the held keys to the hero for one frame. */
function advanceHero(hero: HeroState, controls: Controls, canvas: HTMLCanvasElement, camera: Camera, delta: number): HeroState {
  const tap = controls.takeTap();
  const aimed = tap ? { ...hero, target: viewToWorld(clientToView(tap, canvas.getBoundingClientRect()), camera) } : hero;
  return stepHero(aimed, controls.intent(), delta, solidRects());
}

/**
 * Starts the game on a canvas sized to its host element.
 * The loop runs only while the tab is visible and the stage is on screen.
 * Returns a handle that stops the loop and removes every listener.
 */
export function bootGame(canvas: HTMLCanvasElement, host: HTMLElement): GameHandle {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available in this browser.');

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = createScene();
  const controls = bindControls(host, canvas);
  let hero = createHero(SPAWN);
  let time = 0;
  let onScreen = true;

  const draw = () => scene.draw(ctx, { time, hero, camera: cameraAt(time, still) });
  const resize = () => {
    const scale = fitScale(host.clientWidth);
    canvas.width = WORLD.width * scale;
    canvas.height = WORLD.height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    draw();
  };
  const loop = createLoop((delta, seconds) => {
    hero = advanceHero(hero, controls, canvas, cameraAt(time, still), delta);
    time = seconds;
    draw();
  });
  const syncLoop = () => {
    if (onScreen && !document.hidden) loop.start();
    else loop.stop();
  };
  const probe: GameProbe = {
    hero: () => hero,
    toClient: (world) => {
      const view = worldToView(world, cameraAt(time, still));
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + (view.x / WORLD.width) * rect.width, y: rect.top + (view.y / WORLD.height) * rect.height };
    },
  };

  const resizeObserver = new ResizeObserver(resize);
  const viewObserver = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    syncLoop();
  });
  const dispose = () => {
    loop.stop();
    controls.dispose();
    resizeObserver.disconnect();
    viewObserver.disconnect();
    document.removeEventListener('visibilitychange', syncLoop);
    delete (window as ProbeWindow).__resumeGame;
  };

  try {
    resizeObserver.observe(host);
    viewObserver.observe(host);
    document.addEventListener('visibilitychange', syncLoop);
    if (import.meta.env.DEV) (window as ProbeWindow).__resumeGame = probe;
    resize();
    syncLoop();
  } catch (error) {
    dispose();
    throw error;
  }

  return { dispose };
}
