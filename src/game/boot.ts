import { createLoop } from './engine/loop';
import { WORLD, fitScale } from './engine/viewport';
import { drawBackdrop } from './render/background';

export interface GameHandle {
  dispose(): void;
}

const SHELL = { x: 18, y: 13, width: 244, height: 164, wall: 3 } as const;

/** Empty office shell: the world itself arrives in the next milestone. */
function drawShell(ctx: CanvasRenderingContext2D): void {
  const { x, y, width, height, wall } = SHELL;
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(x + 1, y + 1, width, height);
  ctx.fillStyle = '#fdf6ff';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#1a0b2e';
  ctx.fillRect(x + wall, y + wall, width - wall * 2, height - wall * 2);
}

/**
 * Starts the game on a canvas sized to its host element.
 * Returns a handle that stops the loop and removes every listener.
 */
export function bootGame(canvas: HTMLCanvasElement, host: HTMLElement): GameHandle {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available in this browser.');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time = 0;

  const draw = () => {
    drawBackdrop(ctx, time);
    drawShell(ctx);
  };
  const resize = () => {
    const scale = fitScale(host.clientWidth);
    canvas.width = WORLD.width * scale;
    canvas.height = WORLD.height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    draw();
  };
  const loop = createLoop((_delta, seconds) => {
    time = seconds;
    draw();
  });
  const onVisibility = () => {
    if (document.hidden) loop.stop();
    else if (!reducedMotion) loop.start();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  if (!reducedMotion) loop.start();

  return {
    dispose() {
      loop.stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
