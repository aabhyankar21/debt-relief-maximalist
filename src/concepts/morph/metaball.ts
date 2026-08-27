/**
 * Implicit-surface plumbing for the morph blob.
 *
 * The blob is not a shape, it is a scalar field. A handful of soft "lobes"
 * each contribute influence to every point in the plane, and wherever the
 * sum crosses `iso` there is surface. Two blobs drifting together therefore
 * fuse on their own — the merge at step 9 is a consequence of the maths, not
 * a keyframe — and a single blob made of three overlapping lobes reads as one
 * organic mass rather than three circles.
 *
 * Marching squares walks the grid and returns closed contours, so the same
 * code handles one blob, two separate blobs and one merged blob without
 * knowing which case it is in.
 */

export interface Lobe {
  x: number;
  y: number;
  /** Radius of the surface this lobe would produce on its own. */
  r: number;
  /** Relative influence. Defaults to 1. */
  weight?: number;
}

export interface TraceOptions {
  /**
   * Surface threshold, 0-1 exclusive. Lower values pull each lobe's
   * influence in tighter, which is what stops two nearby blobs from
   * bridging before we want them to.
   */
  iso: number;
  /** Grid cells across the longest side of the field. Higher is smoother. */
  cells: number;
  /** Contour points kept before the curve is smoothed. */
  smoothPoints: number;
  /**
   * Optional anisotropic scale applied to the traced contour, about
   * (`originX`, `originY`).
   *
   * Elongating the field instead — by pulling the lobes apart — pinches the
   * blob into a dumbbell, because the lobes stop overlapping. Stretching the
   * finished outline keeps it one smooth mass.
   */
  scaleX?: number;
  scaleY?: number;
  originX?: number;
  originY?: number;
}

interface Point {
  x: number;
  y: number;
}

/** Guards against a pathological grid if a caller passes odd numbers. */
const MAX_GRID = 240;

/* Reused across frames: the grid is the only large allocation here. */
let grid = new Float32Array(0);

/**
 * The Wyvill kernel `(1 - (d/R)^2)^3` has compact support, so a lobe's
 * influence stops dead at R instead of trailing to infinity like `1/d^2`.
 * That keeps the grid cheap and, more usefully, makes "how gooey is this"
 * a single tunable rather than an emergent surprise.
 */
function influenceRatio(iso: number) {
  return 1 / Math.sqrt(1 - Math.cbrt(iso));
}

/**
 * Traces `lobes` into an SVG path with one closed subpath per contour.
 * Coordinates are in the caller's own space; nothing is normalised.
 */
export function traceMetaballs(lobes: Lobe[], options: TraceOptions): string {
  const { iso, cells, smoothPoints } = options;
  if (lobes.length === 0 || !(iso > 0) || !(iso < 1)) return '';

  const ratio = influenceRatio(iso);

  /* Bounding box of everything that can possibly reach the threshold. */
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const reach: number[] = [];
  for (let i = 0; i < lobes.length; i += 1) {
    const lobe = lobes[i];
    const R = lobe.r * ratio;
    reach.push(R);
    if (!(lobe.r > 0)) continue;
    if (lobe.x - R < minX) minX = lobe.x - R;
    if (lobe.y - R < minY) minY = lobe.y - R;
    if (lobe.x + R > maxX) maxX = lobe.x + R;
    if (lobe.y + R > maxY) maxY = lobe.y + R;
  }
  if (!Number.isFinite(minX)) return '';

  const span = Math.max(maxX - minX, maxY - minY);
  if (!(span > 0)) return '';

  const cell = span / Math.max(8, cells);

  /* One ring of guaranteed-outside corners, so every contour closes and the
     walk below never has to cope with an open chain. */
  minX -= cell;
  minY -= cell;
  const nx = Math.min(MAX_GRID, Math.ceil((maxX + cell - minX) / cell) + 1);
  const ny = Math.min(MAX_GRID, Math.ceil((maxY + cell - minY) / cell) + 1);
  if (nx < 3 || ny < 3) return '';

  if (grid.length < nx * ny) grid = new Float32Array(nx * ny);
  const values = grid;

  for (let iy = 0; iy < ny; iy += 1) {
    const py = minY + iy * cell;
    const row = iy * nx;
    for (let ix = 0; ix < nx; ix += 1) {
      const px = minX + ix * cell;
      let sum = 0;
      for (let k = 0; k < lobes.length; k += 1) {
        const R = reach[k];
        if (R <= 0) continue;
        const lobe = lobes[k];
        const dx = px - lobe.x;
        const dy = py - lobe.y;
        const d2 = dx * dx + dy * dy;
        const R2 = R * R;
        if (d2 >= R2) continue;
        const t = 1 - d2 / R2;
        sum += (lobe.weight ?? 1) * t * t * t;
      }
      values[row + ix] = sum;
    }
  }

  /* --------------------------- marching squares ---------------------------
     Crossings are keyed by grid edge rather than by coordinate, so the two
     cells either side of an edge resolve to the identical point and the
     contour links up exactly, with no epsilon matching. */

  const hCount = (nx - 1) * ny;
  const points = new Map<number, Point>();
  const links = new Map<number, number[]>();

  /* The field is sampled unstretched; the scale lands on the way out. */
  const sx = options.scaleX ?? 1;
  const sy = options.scaleY ?? 1;
  const ox = options.originX ?? 0;
  const oy = options.originY ?? 0;
  const scaled = sx !== 1 || sy !== 1;

  const place = (x: number, y: number): Point =>
    scaled ? { x: ox + (x - ox) * sx, y: oy + (y - oy) * sy } : { x, y };

  const onHorizontal = (ix: number, iy: number) => {
    const id = iy * (nx - 1) + ix;
    if (!points.has(id)) {
      const base = iy * nx + ix;
      const v0 = values[base];
      const v1 = values[base + 1];
      const delta = v1 - v0;
      const t = Math.abs(delta) < 1e-9 ? 0.5 : (iso - v0) / delta;
      points.set(id, place(minX + (ix + t) * cell, minY + iy * cell));
    }
    return id;
  };

  const onVertical = (ix: number, iy: number) => {
    const id = hCount + iy * nx + ix;
    if (!points.has(id)) {
      const base = iy * nx + ix;
      const v0 = values[base];
      const v1 = values[base + nx];
      const delta = v1 - v0;
      const t = Math.abs(delta) < 1e-9 ? 0.5 : (iso - v0) / delta;
      points.set(id, place(minX + ix * cell, minY + (iy + t) * cell));
    }
    return id;
  };

  const connect = (a: number, b: number) => {
    const la = links.get(a);
    if (la) la.push(b);
    else links.set(a, [b]);
    const lb = links.get(b);
    if (lb) lb.push(a);
    else links.set(b, [a]);
  };

  for (let iy = 0; iy < ny - 1; iy += 1) {
    for (let ix = 0; ix < nx - 1; ix += 1) {
      const top = iy * nx + ix;
      const bottom = top + nx;
      const v00 = values[top];
      const v10 = values[top + 1];
      const v01 = values[bottom];
      const v11 = values[bottom + 1];

      let code = 0;
      if (v00 >= iso) code |= 1;
      if (v10 >= iso) code |= 2;
      if (v11 >= iso) code |= 4;
      if (v01 >= iso) code |= 8;
      if (code === 0 || code === 15) continue;

      switch (code) {
        case 1:
        case 14:
          connect(onVertical(ix, iy), onHorizontal(ix, iy));
          break;
        case 2:
        case 13:
          connect(onHorizontal(ix, iy), onVertical(ix + 1, iy));
          break;
        case 3:
        case 12:
          connect(onVertical(ix, iy), onVertical(ix + 1, iy));
          break;
        case 4:
        case 11:
          connect(onVertical(ix + 1, iy), onHorizontal(ix, iy + 1));
          break;
        case 6:
        case 9:
          connect(onHorizontal(ix, iy), onHorizontal(ix, iy + 1));
          break;
        case 7:
        case 8:
          connect(onVertical(ix, iy), onHorizontal(ix, iy + 1));
          break;
        default: {
          /* Saddles: the corners alone cannot say whether the two inside
             regions touch, so the cell centre casts the deciding vote. */
          const inside = (v00 + v10 + v01 + v11) / 4 >= iso;
          const joinDiagonal = code === 5 ? inside : !inside;
          if (joinDiagonal) {
            connect(onVertical(ix, iy), onHorizontal(ix, iy + 1));
            connect(onHorizontal(ix, iy), onVertical(ix + 1, iy));
          } else {
            connect(onVertical(ix, iy), onHorizontal(ix, iy));
            connect(onVertical(ix + 1, iy), onHorizontal(ix, iy + 1));
          }
          break;
        }
      }
    }
  }

  /* ------------------------------- walk -------------------------------- */

  const visited = new Set<number>();
  let d = '';

  for (const start of links.keys()) {
    if (visited.has(start)) continue;

    const ring: Point[] = [];
    let previous = -1;
    let current = start;

    while (current !== -1 && !visited.has(current)) {
      visited.add(current);
      const point = points.get(current);
      if (point) ring.push(point);

      const neighbours = links.get(current);
      let next = -1;
      if (neighbours) {
        for (let i = 0; i < neighbours.length; i += 1) {
          const candidate = neighbours[i];
          if (candidate !== previous && !visited.has(candidate)) {
            next = candidate;
            break;
          }
        }
      }
      previous = current;
      current = next;
    }

    if (ring.length >= 4) d += smoothClosed(ring, smoothPoints);
  }

  return d;
}

/**
 * Marching squares returns a polygon; at the sizes this scene draws at, the
 * facets are visible on the blob's silhouette. A closed Catmull-Rom spline
 * through a subsample of the contour removes them and costs less than
 * running the grid at four times the resolution.
 */
function smoothClosed(ring: Point[], target: number): string {
  const source = ring.length;
  const count = Math.max(3, Math.min(source, target));

  let pts = ring;
  if (count < source) {
    pts = [];
    for (let i = 0; i < count; i += 1) {
      pts.push(ring[Math.round((i * source) / count) % source]);
    }
  }

  const n = pts.length;
  let d = `M${round(pts[0].x)} ${round(pts[0].y)}`;

  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`;
  }

  return `${d}Z`;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
