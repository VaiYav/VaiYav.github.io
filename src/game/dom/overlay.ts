import { FINALE } from '../world/game';
import { PORTRAIT_COLORS, portraitFrameAt, portraitSprite, talkSeconds, type PortraitFrame } from '../render/portrait';
import { paintSprite } from '../render/sprites';

/** What the overlay shows; it only touches the page when one of these changes. */
export interface OverlayView {
  readonly open: string | null;
  readonly near: string | null;
  readonly found: number;
  readonly time: number;
}

export interface Overlay {
  sync(view: OverlayView): void;
  dispose(): void;
}

export interface OverlayHandlers {
  close(): void;
  open(id: string): void;
}

interface Entry {
  readonly room: string;
  readonly title: string;
  readonly body: string;
  readonly links: readonly { label: string; href: string }[];
}

function need<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`The game markup is missing ${selector}.`);
  return node;
}

/** Reads an entry from the text version on the page, so the game and the list can never disagree. */
function readEntry(section: HTMLElement, id: string): Entry {
  const source = id === FINALE ? need<HTMLElement>(section, '[data-game-finale]') : need<HTMLElement>(section, `[data-object="${CSS.escape(id)}"]`);
  const body = need<HTMLElement>(source, '[data-body]').cloneNode(true) as HTMLElement;
  for (const extra of body.querySelectorAll('.game-links')) extra.remove();
  return {
    room: source.closest('section[aria-labelledby]')?.querySelector('h4')?.textContent?.trim() ?? '',
    title: need<HTMLElement>(source, '[data-title]').textContent?.trim() ?? '',
    body: body.textContent?.trim() ?? '',
    links: [...source.querySelectorAll<HTMLAnchorElement>('a')].map((link) => ({ label: link.textContent?.trim() ?? '', href: link.href })),
  };
}

function linkNodes(entry: Entry): HTMLAnchorElement[] {
  return entry.links.map((link) => {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    return anchor;
  });
}

/** Binds the dialogue, the counter, the hint and the object buttons that sit over the canvas. */
export function bindOverlay(section: HTMLElement, stage: HTMLElement, still: boolean, handlers: OverlayHandlers): Overlay {
  const dialog = need<HTMLElement>(stage, '[data-game-dialog]');
  const room = need<HTMLElement>(dialog, '[data-game-dialog-room]');
  const title = need<HTMLElement>(dialog, '[data-game-dialog-title]');
  const body = need<HTMLElement>(dialog, '[data-game-dialog-body]');
  const links = need<HTMLElement>(dialog, '[data-game-dialog-links]');
  const close = need<HTMLButtonElement>(dialog, '[data-game-dialog-close]');
  const count = need<HTMLElement>(stage, '[data-game-count]');
  const hint = need<HTMLElement>(stage, '[data-game-hint]');
  const objects = need<HTMLElement>(stage, '[data-game-objects]');
  const status = need<HTMLElement>(stage, '[data-game-status]');
  // Read once, up front: a gap in the page markup fails here, at start, and not in the middle of a frame.
  const ids = [...objects.querySelectorAll<HTMLElement>('[data-open-object]')].map((button) => button.dataset.openObject ?? '');
  const entries = new Map([...ids, FINALE].map((id) => [id, readEntry(section, id)]));
  const entryFor = (id: string): Entry => {
    const entry = entries.get(id);
    if (!entry) throw new Error(`The game has no text for "${id}".`);
    return entry;
  };
  const portrait = need<HTMLCanvasElement>(dialog, '[data-game-portrait]').getContext('2d');
  if (!portrait) throw new Error('Canvas 2D is not available in this browser.');

  let shown: { open: string | null; near: string | null; found: number } = { open: null, near: null, found: -1 };
  let face: PortraitFrame | null = null;
  let talkUntil = 0;

  const paintFace = (frame: PortraitFrame) => {
    if (frame === face) return;
    face = frame;
    portrait.clearRect(0, 0, portrait.canvas.width, portrait.canvas.height);
    paintSprite(portrait, portraitSprite(frame), PORTRAIT_COLORS);
  };
  const showDialog = (id: string, time: number) => {
    const entry = entryFor(id);
    room.textContent = entry.room;
    title.textContent = entry.title;
    body.textContent = entry.body;
    links.replaceChildren(...linkNodes(entry));
    links.hidden = entry.links.length === 0;
    dialog.scrollTop = 0;
    // The status region is always on the page, so screen readers announce what was opened.
    status.textContent = `${entry.title}. ${entry.body}`;
    talkUntil = time + talkSeconds(entry.body.length);
  };
  const showHint = (near: string | null) => {
    hint.hidden = near === null;
    if (near) hint.textContent = `E or tap · ${entryFor(near).title}`;
  };
  const onObjectClick = (event: MouseEvent) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-open-object]') : null;
    if (button?.dataset.openObject) handlers.open(button.dataset.openObject);
  };

  close.addEventListener('click', handlers.close);
  objects.addEventListener('click', onObjectClick);

  return {
    sync(view) {
      if (view.open !== shown.open) {
        // Closing from a link or button inside the dialogue would drop focus to the page and kill the keys.
        const focusInside = view.open === null && dialog.contains(document.activeElement);
        dialog.hidden = view.open === null;
        if (focusInside) stage.focus({ preventScroll: true });
        if (view.open) showDialog(view.open, view.time);
      }
      if (view.near !== shown.near) showHint(view.near);
      if (view.found !== shown.found) count.textContent = String(view.found);
      shown = { open: view.open, near: view.near, found: view.found };
      if (view.open) paintFace(still ? 'idle' : portraitFrameAt(view.time < talkUntil, view.time));
    },
    dispose() {
      close.removeEventListener('click', handlers.close);
      objects.removeEventListener('click', onObjectClick);
      dialog.hidden = true;
      hint.hidden = true;
    },
  };
}
