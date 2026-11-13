import { SPAWN } from '../data/game/map';
import { bindControls, type Controls } from './dom/controls';
import { createMusic } from './dom/music';
import { bindOverlay } from './dom/overlay';
import { createScene } from './dom/scene';
import { cameraAt, clientToView, viewToWorld, worldToView, type Camera } from './engine/camera';
import { createLoop } from './engine/loop';
import { WORLD, fitScale } from './engine/viewport';
import type { Point } from './world/collision';
import { closeDialog, createGame, interact, nearId, openObject, stepGame, tapWorld, type GameState, type World } from './world/game';
import type { HeroState } from './world/hero';
import { createOffice } from './world/office';

export interface GameHandle {
  /** Freezes the world and holds the music, for the menu. */
  pause(): void;
  resume(): void;
  /** Turns the music on or off; must be called from a click. Returns whether it is now on. */
  toggleMusic(): boolean;
  dispose(): void;
}

export interface GameOptions {
  /** Escape was pressed with no dialogue to close: the page should show or hide its menu. */
  onMenu(): void;
}

/** What the end-to-end tests may read; exposed only in development builds. */
export interface GameProbe {
  hero(): HeroState;
  open(): string | null;
  found(): number;
  music(): string;
  /** Page coordinates of a world point, for aiming a tap. */
  toClient(world: Point): Point;
}

type ProbeWindow = Window & { __resumeGame?: GameProbe };

/** Publishes the probe on window and returns a function that removes it. */
function installProbe(canvas: HTMLCanvasElement, read: () => { game: GameState; camera: Camera; music: string }): () => void {
  const host = window as ProbeWindow;
  host.__resumeGame = {
    hero: () => read().game.hero,
    open: () => read().game.open,
    found: () => read().game.found.size,
    music: () => read().music,
    toClient: (world) => {
      const view = worldToView(world, read().camera);
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + (view.x / WORLD.width) * rect.width, y: rect.top + (view.y / WORLD.height) * rect.height };
    },
  };
  return () => { delete host.__resumeGame; };
}

/** Applies a tap made since the last frame and the held keys, then moves the world on by one frame. */
function advance(game: GameState, controls: Controls, world: World, toWorld: (client: Point) => Point, delta: number): GameState {
  const tap = controls.takeTap();
  const aimed = tap ? tapWorld(game, toWorld(tap), world) : game;
  return stepGame(aimed, controls.intent(), delta, world);
}

/**
 * Starts the game on a canvas sized to its host element.
 * The loop runs only while the tab is visible and the stage is on screen.
 * Returns a handle that stops the loop and removes every listener.
 */
export function bootGame(canvas: HTMLCanvasElement, host: HTMLElement, section: HTMLElement, options: GameOptions): GameHandle {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available in this browser.');

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = createScene();
  const world = createOffice();
  let game = createGame(SPAWN);
  let time = 0;
  let onScreen = true;
  let paused = false;
  const music = createMusic();

  const camera = () => cameraAt(time, still);
  const toWorld = (client: Point) => viewToWorld(clientToView(client, canvas.getBoundingClientRect()), camera());
  // With reduced motion the scenery holds still; only the hero moves, and only on the visitor's input.
  const draw = () => {
    const near = nearId(game, world);
    scene.draw(ctx, { time: still ? 0 : time, hero: game.hero, camera: camera(), near, found: game.found });
    overlay.sync({ open: game.open, near, found: game.found.size, time });
  };
  /** For changes that come from the page rather than the loop, which may be paused. */
  const change = (next: GameState) => { game = next; draw(); };
  const overlay = bindOverlay(section, host, still, {
    close: () => { change(closeDialog(game, world)); host.focus({ preventScroll: true }); },
    open: (id) => change(openObject(game, id)),
  });
  const resize = () => {
    // In full screen the stage has a height of its own, so the world must fit that too.
    const scale = document.fullscreenElement === host ? fitScale(host.clientWidth, host.clientHeight) : fitScale(host.clientWidth);
    canvas.width = WORLD.width * scale;
    canvas.height = WORLD.height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    draw();
  };
  const loop = createLoop((delta, seconds) => {
    game = advance(game, controls, world, toWorld, delta);
    time = seconds;
    draw();
  });
  const syncLoop = () => {
    const running = onScreen && !document.hidden && !paused;
    music.setPaused(!running);
    if (running) { loop.start(); return; }
    loop.stop();
    // A tap made while paused must not fire when the game comes back.
    controls.takeTap();
  };
  const removeProbe = import.meta.env.DEV ? installProbe(canvas, () => ({ game, camera: camera(), music: music.state() })) : () => undefined;

  const resizeObserver = new ResizeObserver(resize);
  const viewObserver = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    syncLoop();
  });
  // Bound last, so nothing above can throw and leave its listeners behind.
  const controls = bindControls(host, canvas, (action) => {
    if (action === 'close' && !game.open) { options.onMenu(); return; }
    if (!paused) change(action === 'close' ? closeDialog(game, world) : interact(game, world));
  });
  const setPaused = (next: boolean) => {
    paused = next;
    syncLoop();
  };
  const dispose = () => {
    loop.stop();
    controls.dispose();
    overlay.dispose();
    music.dispose();
    resizeObserver.disconnect();
    viewObserver.disconnect();
    document.removeEventListener('visibilitychange', syncLoop);
    removeProbe();
  };

  try {
    resizeObserver.observe(host);
    viewObserver.observe(host);
    document.addEventListener('visibilitychange', syncLoop);
    resize();
    syncLoop();
  } catch (error) {
    dispose();
    throw error;
  }

  return { pause: () => setPaused(true), resume: () => setPaused(false), toggleMusic: () => music.toggle(), dispose };
}
