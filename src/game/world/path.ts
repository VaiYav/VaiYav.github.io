import { distanceToRect, isBlocked, type Point, type Rect } from './collision';

export interface Nav {
  /** Points to walk through to get as close to a spot as the walls allow. */
  pathTo(from: Point, to: Point): readonly Point[];
  /** Points to walk through to stand within a radius of a rectangle; empty if already there or unreachable. */
  pathNear(from: Point, rect: Rect, radius: number): readonly Point[];
}

export interface Bounds {
  readonly width: number;
  readonly height: number;
}

/** Spacing of the walking grid in world pixels. */
const CELL = 2;
/** Extra clearance a shortcut needs, so the hero does not graze a corner on the way. */
const CLEARANCE = 0.5;
/** Stay this far inside the radius, so the last step does not end right on its edge. */
const RADIUS_MARGIN = 1;
const SAMPLE = 1;
const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

interface Grid {
  readonly cols: number;
  readonly rows: number;
  readonly free: readonly boolean[];
}

interface Search {
  /** Reached cells in the order they were found: nearest first. */
  readonly order: readonly number[];
  readonly parent: ReadonlyMap<number, number>;
}

const centre = (grid: Grid, index: number): Point => ({ x: (index % grid.cols) * CELL, y: Math.floor(index / grid.cols) * CELL });

function buildGrid(solids: readonly Rect[], half: number, bounds: Bounds): Grid {
  const cols = Math.floor(bounds.width / CELL) + 1;
  const rows = Math.floor(bounds.height / CELL) + 1;
  const free = Array.from({ length: cols * rows }, (_, index) => !isBlocked({ x: (index % cols) * CELL, y: Math.floor(index / cols) * CELL }, half, solids));
  return { cols, rows, free };
}

/** The free cell closest to a point, looking a couple of cells around it. */
function startCell(grid: Grid, from: Point): number | null {
  const cx = Math.round(from.x / CELL);
  const cy = Math.round(from.y / CELL);
  let best: number | null = null;
  let bestGap = Number.POSITIVE_INFINITY;
  for (let y = Math.max(cy - 2, 0); y <= Math.min(cy + 2, grid.rows - 1); y++) {
    for (let x = Math.max(cx - 2, 0); x <= Math.min(cx + 2, grid.cols - 1); x++) {
      const gap = Math.hypot(x * CELL - from.x, y * CELL - from.y);
      if (grid.free[y * grid.cols + x] && gap < bestGap) { best = y * grid.cols + x; bestGap = gap; }
    }
  }
  return best;
}

/** Breadth-first flood over the free cells from a starting cell. */
function flood(grid: Grid, start: number): Search {
  const parent = new Map<number, number>([[start, start]]);
  const order = [start];
  for (let head = 0; head < order.length; head++) {
    const index = order[head];
    const x = index % grid.cols;
    const y = Math.floor(index / grid.cols);
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = x + dx;
      const ny = y + dy;
      const next = ny * grid.cols + nx;
      if (nx < 0 || ny < 0 || nx >= grid.cols || ny >= grid.rows || !grid.free[next] || parent.has(next)) continue;
      parent.set(next, index);
      order.push(next);
    }
  }
  return { order, parent };
}

function trail(grid: Grid, search: Search, goal: number): Point[] {
  const cells: number[] = [];
  for (let index = goal; ; index = search.parent.get(index) as number) {
    cells.push(index);
    if (search.parent.get(index) === index) break;
  }
  return cells.reverse().map((index) => centre(grid, index));
}

/** Builds a route finder for a body of the given half-size among fixed solids. */
export function createNav(solids: readonly Rect[], half: number, bounds: Bounds): Nav {
  const grid = buildGrid(solids, half, bounds);

  const clear = (a: Point, b: Point): boolean => {
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / SAMPLE));
    for (let i = 0; i <= steps; i++) {
      const point = { x: a.x + ((b.x - a.x) * i) / steps, y: a.y + ((b.y - a.y) * i) / steps };
      if (isBlocked(point, half + CLEARANCE, solids)) return false;
    }
    return true;
  };

  /** Keeps only the corners: from each point, jump to the furthest later point in plain sight. */
  const straighten = (from: Point, points: readonly Point[]): Point[] => {
    const kept: Point[] = [];
    let at = from;
    let index = 0;
    while (index < points.length) {
      let next = index;
      for (let probe = points.length - 1; probe > index; probe--) {
        if (clear(at, points[probe])) { next = probe; break; }
      }
      kept.push(points[next]);
      at = points[next];
      index = next + 1;
    }
    return kept;
  };

  const route = (from: Point, pick: (search: Search) => number | null, finish?: Point): readonly Point[] => {
    const start = startCell(grid, from);
    if (start === null) return [];
    const search = flood(grid, start);
    const goal = pick(search);
    if (goal === null) return [];
    const cells = trail(grid, search, goal);
    const last = cells[cells.length - 1];
    const exact = finish && !isBlocked(finish, half, solids) && clear(last, finish) ? [finish] : [];
    return straighten(from, [...cells, ...exact]);
  };

  return {
    pathTo: (from, to) => route(from, (search) => {
      let best: number | null = null;
      let bestGap = Number.POSITIVE_INFINITY;
      for (const index of search.order) {
        const point = centre(grid, index);
        const gap = Math.hypot(point.x - to.x, point.y - to.y);
        if (gap < bestGap) { best = index; bestGap = gap; }
      }
      return best;
    }, to),
    pathNear: (from, rect, radius) => {
      if (distanceToRect(from, rect) <= radius - RADIUS_MARGIN) return [];
      return route(from, (search) => search.order.find((index) => distanceToRect(centre(grid, index), rect) <= radius - RADIUS_MARGIN) ?? null);
    },
  };
}
