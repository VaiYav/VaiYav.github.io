import type { GameHandle } from '../boot';
import { PORTRAIT_COLORS, portraitSprite } from '../render/portrait';
import { paintSprite } from '../render/sprites';

type State = 'idle' | 'running' | 'paused' | 'error';

interface Parts {
  readonly root: HTMLElement;
  readonly stage: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly start: HTMLButtonElement;
  readonly subtitle: HTMLElement;
  readonly status: HTMLElement;
  readonly error: HTMLElement;
  readonly menu: HTMLButtonElement;
  readonly music: HTMLButtonElement;
  readonly fullscreen: HTMLButtonElement;
  readonly face: HTMLCanvasElement;
}

const SELECTORS: Readonly<Record<Exclude<keyof Parts, 'root'>, string>> = {
  stage: '[data-game-stage]', canvas: '[data-game-canvas]', start: '[data-game-start]', subtitle: '[data-game-subtitle]',
  status: '[data-game-status]', error: '[data-game-error]', menu: '[data-game-menu]', music: '[data-game-music]',
  fullscreen: '[data-game-fullscreen]', face: '[data-game-title-face]',
};

const TEXT = {
  started: 'Game started. Walk with WASD or the arrow keys, or tap the floor. Press E next to an object to open it, or tap the object. Escape opens the menu.',
  paused: 'Game paused.',
  resumed: 'Game resumed.',
  noMusic: 'Music is not available in this browser.',
  start: 'Start',
  resume: 'Resume',
  subtitle: 'A playable résumé',
  pausedTitle: 'Paused',
} as const;

function findParts(root: HTMLElement): Parts | null {
  const found = Object.fromEntries(Object.entries(SELECTORS).map(([key, selector]) => [key, root.querySelector(selector)]));
  return Object.values(found).every(Boolean) ? ({ root, ...found } as unknown as Parts) : null;
}

/** The title screen shows the same baked portrait as the dialogues. */
function paintTitleFace(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) paintSprite(ctx, portraitSprite('idle'), PORTRAIT_COLORS);
}

/** Full screen is a bonus: every call here is allowed to fail, and the game then plays inside the page. */
function fullscreenFor(stage: HTMLElement) {
  const supported = document.fullscreenEnabled && typeof stage.requestFullscreen === 'function';
  const active = () => document.fullscreenElement === stage;
  const leave = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined); };
  /* Must run inside the click itself: browsers refuse full screen once the gesture is over. */
  const enter = () => { if (supported && !document.fullscreenElement) stage.requestFullscreen().catch(() => undefined); };
  return { supported, active, enter, leave };
}

/**
 * Runs the section around the game: title screen, start, pause menu, music and full-screen buttons.
 * The game itself is loaded on the first Start. Returns a function that shuts everything down.
 */
export function mountShell(root: HTMLElement): () => void {
  const parts = findParts(root);
  if (!parts) return () => undefined;
  const { stage, start, status } = parts;
  const listeners = new AbortController();
  const on = { signal: listeners.signal };
  const screen = fullscreenFor(stage);
  let handle: GameHandle | null = null;
  /* Cleared on shutdown so a game that finishes loading after navigation is discarded. */
  let alive = true;
  root.dataset.bound = 'true';
  paintTitleFace(parts.face);

  const setState = (state: State) => {
    root.dataset.state = state;
    start.textContent = state === 'paused' ? TEXT.resume : TEXT.start;
    parts.subtitle.textContent = state === 'paused' ? TEXT.pausedTitle : TEXT.subtitle;
  };
  const showStage = () => {
    if (!document.fullscreenElement) stage.scrollIntoView({ block: 'center' });
    stage.focus({ preventScroll: true });
  };
  const pause = () => {
    handle?.pause();
    setState('paused');
    status.textContent = TEXT.paused;
    start.focus({ preventScroll: true });
  };
  const resume = () => {
    handle?.resume();
    setState('running');
    status.textContent = TEXT.resumed;
    showStage();
  };
  const toggleMenu = () => {
    if (root.dataset.state === 'running') pause();
    else if (root.dataset.state === 'paused') resume();
  };
  const fail = (cause: unknown) => {
    // The text version below carries the same content; the reason stays on the element for debugging.
    setState('error');
    root.dataset.error = cause instanceof Error ? cause.message : String(cause);
    if (screen.active()) screen.leave();
    parts.error.hidden = false;
    start.disabled = false;
    start.focus();
  };
  const boot = async () => {
    start.disabled = true;
    parts.error.hidden = true;
    delete root.dataset.error;
    try {
      const { bootGame } = await import('../boot');
      if (!alive || !root.isConnected) return;
      handle = bootGame(parts.canvas, stage, root, { onMenu: toggleMenu });
      setState('running');
      status.textContent = TEXT.started;
      // A tab stop, so keyboard players can come back to the game after leaving it.
      stage.tabIndex = 0;
      parts.fullscreen.hidden = !screen.supported;
      start.disabled = false;
      showStage();
    } catch (cause) {
      fail(cause);
    }
  };
  /** Start, Resume and every launch button on the page lead here. */
  const launch = () => {
    screen.enter();
    if (root.dataset.state === 'running') showStage();
    else if (root.dataset.state === 'paused') resume();
    else if (!start.disabled) void boot();
  };
  const toggleMusic = () => {
    try {
      const playing = handle?.toggleMusic() ?? false;
      parts.music.setAttribute('aria-pressed', String(playing));
      parts.music.textContent = playing ? 'Music: on' : 'Music: off';
    } catch {
      parts.music.hidden = true;
      status.textContent = TEXT.noMusic;
    }
    stage.focus({ preventScroll: true });
  };

  start.addEventListener('click', launch, on);
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-game-launch]')) {
    button.hidden = false;
    button.addEventListener('click', launch, on);
  }
  parts.menu.addEventListener('click', toggleMenu, on);
  parts.music.addEventListener('click', toggleMusic, on);
  parts.fullscreen.addEventListener('click', () => {
    if (screen.active()) screen.leave();
    else screen.enter();
    stage.focus({ preventScroll: true });
  }, on);
  stage.addEventListener('fullscreenchange', () => {
    parts.fullscreen.textContent = screen.active() ? 'Exit full screen' : 'Full screen';
  }, on);

  return () => {
    alive = false;
    listeners.abort();
    screen.leave();
    handle?.dispose();
    handle = null;
  };
}
