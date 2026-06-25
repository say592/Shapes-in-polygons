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

    // Overall extents: bounding box of the n vertices at this orientation.
    // Vertex k sits at angle alpha + π/n + k·2π/n, at distance circumradius.
    const xs: number[] = [];
    const ys: number[] = [];
    for (let k = 0; k < n; k++) {
      const angle = alpha + Math.PI / n + (k * 2 * Math.PI) / n;
      xs.push(circumradius * Math.cos(angle));
      ys.push(circumradius * Math.sin(angle));
    }
    const boundingWidth = Math.max(...xs) - Math.min(...xs);
    const boundingHeight = Math.max(...ys) - Math.min(...ys);

    return {
      sides: n,
      polygonName: POLYGON_NAMES[n],
      inradius,
      circumradius,
      sideLength,
      boundingWidth,
      boundingHeight,
      alpha,
      translation,
    } satisfies FitResult;
  });
}

