import {
  circleSupport,
  rectangleSupport,
  triangleSupport,
  triangleVertices,
  findMinInradius,
} from './geometry';
import type { Shape, FitResult } from '../types';

const POLYGON_NAMES: Record<number, string> = {
  3: 'Triangle',
  4: 'Square',
  5: 'Pentagon',
  6: 'Hexagon',
  7: 'Heptagon',
  8: 'Octagon',
  9: 'Nonagon',
  10: 'Decagon',
  11: 'Hendecagon',
  12: 'Dodecagon',
};

export function computeFits(shape: Shape): FitResult[] {
  let supportFn: (theta: number) => number;

  if (shape.type === 'circle') {
    supportFn = (theta) => circleSupport(shape.radius, theta);
  } else if (shape.type === 'rectangle') {
    supportFn = (theta) => rectangleSupport(shape.width, shape.height, theta);
  } else {
    const verts = triangleVertices(shape.sideA, shape.sideB, shape.sideC);
    supportFn = (theta) => triangleSupport(verts, theta);
  }

  return Array.from({ length: 10 }, (_, i) => {
    const n = i + 3;
    const { inradius, alpha, translation } = findMinInradius(supportFn, n);
    const circumradius = inradius / Math.cos(Math.PI / n);
    const sideLength = 2 * circumradius * Math.sin(Math.PI / n);
    return {
      sides: n,
      polygonName: POLYGON_NAMES[n],
      inradius,
      circumradius,
      sideLength,
      alpha,
      translation,
    } satisfies FitResult;
  });
}

export function isValidShape(shape: Partial<Shape>): boolean {
  if (!shape.type) return false;
  if (shape.type === 'circle') {
    return typeof (shape as CirclePartial).radius === 'number' && (shape as CirclePartial).radius > 0;
  }
  if (shape.type === 'rectangle') {
    const r = shape as RectPartial;
    return typeof r.width === 'number' && r.width > 0 && typeof r.height === 'number' && r.height > 0;
  }
  if (shape.type === 'triangle') {
    const t = shape as TriPartial;
    const { sideA: a, sideB: b, sideC: c } = t;
    if (typeof a !== 'number' || typeof b !== 'number' || typeof c !== 'number') return false;
    if (a <= 0 || b <= 0 || c <= 0) return false;
    return a + b > c && a + c > b && b + c > a;
  }
  return false;
}

type CirclePartial = { type: 'circle'; radius: number };
type RectPartial = { type: 'rectangle'; width: number; height: number };
type TriPartial = { type: 'triangle'; sideA: number; sideB: number; sideC: number };
