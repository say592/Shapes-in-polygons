import type { Shape, FitResult } from '../types';
import { triangleVertices } from '../lib/geometry';

interface Props {
  shape: Shape;
  result: FitResult;
  size?: number;
}

function fmt(n: number): string {
  return n.toFixed(3);
}

export default function PolygonPreview({ shape, result, size = 180 }: Props) {
  const { sides: n, inradius, circumradius, sideLength, alpha, translation } = result;
  const [tx, ty] = translation;

  // Extra padding to leave room for dimension annotations outside the polygon
  const padding = 28;
  const scale = (size / 2 - padding) / circumradius;

  const cx = size / 2;
  const cy = size / 2;

  // Vertex k sits between edge normals k and k+1; angle = alpha + π/n + k·2π/n
  const polyPoints = Array.from({ length: n }, (_, k) => {
    const angle = alpha + Math.PI / n + (k * 2 * Math.PI) / n;
    return [cx + circumradius * scale * Math.cos(angle), cy + circumradius * scale * Math.sin(angle)] as [number, number];
  });

  const polyStr = polyPoints.map(([x, y]) => `${x},${y}`).join(' ');

  const sx = cx + tx * scale;
  const sy = cy + ty * scale;

  // ── Pick the bottom-most edge for dimension annotations (most visual space) ──
  let annotEdge = 0;
  let maxMidY = -Infinity;
  for (let k = 0; k < n; k++) {
    const [, y0] = polyPoints[k];
    const [, y1] = polyPoints[(k + 1) % n];
    const midY = (y0 + y1) / 2;
    if (midY > maxMidY) { maxMidY = midY; annotEdge = k; }
  }

  const ev0 = polyPoints[annotEdge];
  const ev1 = polyPoints[(annotEdge + 1) % n];
  const edgeMidX = (ev0[0] + ev1[0]) / 2;
  const edgeMidY = (ev0[1] + ev1[1]) / 2;

  // Outward unit vector from polygon centre to edge midpoint
  const dx = edgeMidX - cx;
  const dy = edgeMidY - cy;
  const dlen = Math.sqrt(dx * dx + dy * dy);
  const outX = dx / dlen;
  const outY = dy / dlen;

  // ── Inradius annotation: dashed line from centre to edge midpoint ──
  const rimx = cx + inradius * scale * outX;
  const rimy = cy + inradius * scale * outY;
  // Label: perpendicular offset from line midpoint
  const perpX = -outY;
  const perpY = outX;
  const rLabelX = (cx + rimx) / 2 + perpX * 9;
  const rLabelY = (cy + rimy) / 2 + perpY * 9;

  // ── Side-length annotation: offset line just outside the bottom edge ──
  const tickGap = 5;   // gap between polygon edge and annotation line
  const tickLen = 8;   // how far the extension lines protrude
  // Start/end of the offset annotation line
  const aLx0 = ev0[0] + outX * (tickGap + tickLen);
  const aLy0 = ev0[1] + outY * (tickGap + tickLen);
  const aLx1 = ev1[0] + outX * (tickGap + tickLen);
  const aLy1 = ev1[1] + outY * (tickGap + tickLen);
  // Label: further outward from the annotation line midpoint
  const sLabelX = (aLx0 + aLx1) / 2 + outX * 9;
  const sLabelY = (aLy0 + aLy1) / 2 + outY * 9;

  const annotColor = '#475569';
  const annotTextColor = '#94a3b8';
  const fontSize = 9;

  function renderShape() {
    if (shape.type === 'circle') {
      return (
        <circle cx={sx} cy={sy} r={shape.radius * scale}
          fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="1.5" />
      );
    }
    if (shape.type === 'rectangle') {
      return (
        <rect x={sx - (shape.width / 2) * scale} y={sy - (shape.height / 2) * scale}
          width={shape.width * scale} height={shape.height * scale}
          fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="1.5" />
      );
    }
    if (shape.type === 'triangle') {
      const verts = triangleVertices(shape.sideA, shape.sideB, shape.sideC);
      const pts = verts.map(([x, y]) => `${sx + x * scale},${sy + y * scale}`).join(' ');
      return (
        <polygon points={pts} fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="1.5" />
      );
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      {/* Polygon */}
      <polygon points={polyStr} fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="1.5" />

      {/* Shape at optimal position */}
      {renderShape()}

      {/* Inradius: dashed line + "r" label */}
      <line x1={cx} y1={cy} x2={rimx} y2={rimy}
        stroke={annotColor} strokeWidth="1" strokeDasharray="3,2" />
      <text x={rLabelX} y={rLabelY} textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={annotTextColor} fontFamily="monospace">
        r={fmt(inradius)}
      </text>

      {/* Side length: offset line + tick extensions + label */}
      {/* Extension lines from each vertex outward */}
      <line x1={ev0[0]} y1={ev0[1]} x2={aLx0} y2={aLy0} stroke={annotColor} strokeWidth="0.8" />
      <line x1={ev1[0]} y1={ev1[1]} x2={aLx1} y2={aLy1} stroke={annotColor} strokeWidth="0.8" />
      {/* Arrow / annotation line between the extensions */}
      <line x1={aLx0} y1={aLy0} x2={aLx1} y2={aLy1} stroke={annotColor} strokeWidth="0.8"
        markerStart={`url(#arrow-${n})`} markerEnd={`url(#arrow-${n})`} />
      <text x={sLabelX} y={sLabelY} textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize} fill={annotTextColor} fontFamily="monospace">
        s={fmt(sideLength)}
      </text>

      {/* Arrow marker definition */}
      <defs>
        <marker id={`arrow-${n}`} markerWidth="5" markerHeight="5"
          refX="2.5" refY="2.5" orient="auto">
          <path d="M5,0 L0,2.5 L5,5" fill="none" stroke={annotColor} strokeWidth="0.8" />
        </marker>
      </defs>
    </svg>
  );
}
