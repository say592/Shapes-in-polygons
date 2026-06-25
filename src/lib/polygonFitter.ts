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

