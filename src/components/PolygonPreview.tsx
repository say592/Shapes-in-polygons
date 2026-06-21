import type { Shape, FitResult } from '../types';
import { triangleVertices } from '../lib/geometry';

interface Props {
  shape: Shape;
  result: FitResult;
  size?: number;
}

export default function PolygonPreview({ shape, result, size = 200 }: Props) {
  const { sides: n, circumradius, alpha, translation } = result;
  const [tx, ty] = translation;

  const padding = 10;
  const scale = (size / 2 - padding) / circumradius;

  const cx = size / 2;
  const cy = size / 2;

  // Regular n-gon vertices: vertex k sits between edge normals k and k+1
  // Vertex angle: alpha + pi/n + k*2pi/n
  const polyPoints = Array.from({ length: n }, (_, k) => {
    const angle = alpha + Math.PI / n + (k * 2 * Math.PI) / n;
    return [cx + circumradius * scale * Math.cos(angle), cy + circumradius * scale * Math.sin(angle)];
  });

  const polyStr = polyPoints.map(([x, y]) => `${x},${y}`).join(' ');

  // Shape rendered at its optimal translation (relative to polygon center), scaled
  const sx = cx + tx * scale;
  const sy = cy + ty * scale;

  function renderShape() {
    if (shape.type === 'circle') {
      return (
        <circle
          cx={sx}
          cy={sy}
          r={shape.radius * scale}
          fill="rgba(99,102,241,0.25)"
          stroke="#6366f1"
          strokeWidth="1.5"
        />
      );
    }

    if (shape.type === 'rectangle') {
      const hw = (shape.width / 2) * scale;
      const hh = (shape.height / 2) * scale;
      return (
        <rect
          x={sx - hw}
          y={sy - hh}
          width={shape.width * scale}
          height={shape.height * scale}
          fill="rgba(99,102,241,0.25)"
          stroke="#6366f1"
          strokeWidth="1.5"
        />
      );
    }

    if (shape.type === 'triangle') {
      const verts = triangleVertices(shape.sideA, shape.sideB, shape.sideC);
      const pts = verts.map(([x, y]) => `${sx + x * scale},${sy + y * scale}`).join(' ');
      return (
        <polygon
          points={pts}
          fill="rgba(99,102,241,0.25)"
          stroke="#6366f1"
          strokeWidth="1.5"
        />
      );
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon
        points={polyStr}
        fill="rgba(16,185,129,0.08)"
        stroke="#10b981"
        strokeWidth="1.5"
      />
      {renderShape()}
    </svg>
  );
}
