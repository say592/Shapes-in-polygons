import { useMemo } from 'react';
import type { Shape, FitResult } from '../types';
import { triangleVertices } from '../lib/geometry';
import { fmt } from '../lib/format';

interface Props {
  shape: Shape;
  result: FitResult;
  size?: number;
}

export default function PolygonPreview({ shape, result, size = 180 }: Props) {
  const { sides: n, inradius, circumradius, sideLength, boundingWidth, boundingHeight, alpha, translation } = result;
  const [tx, ty] = translation;

  // Extra padding to leave room for dimension annotations outside the polygon
  const padding = 28;
  const scale = (size / 2 - padding) / circumradius;

  const cx = size / 2;
  const cy = size / 2;

  // Vertex k sits between edge normals k and k+1; angle = alpha + π/n + k·2π/n
  const polyPoints = useMemo(() =>
    Array.from({ length: n }, (_, k) => {
      const angle = alpha + Math.PI / n + (k * 2 * Math.PI) / n;
      return [cx + circumradius * scale * Math.cos(angle), cy + circumradius * scale * Math.sin(angle)] as [number, number];
    }),
    [n, alpha, cx, cy, circumradius, scale]
  );

  const polyStr = polyPoints.map(([x, y]) => `${x},${y}`).join(' ');

  const sx = cx + tx * scale;
  const sy = cy + ty * scale;

  // Triangle vertices computed once per shape identity, not per render
  const triangleVerts = useMemo(
    () => shape.type === 'triangle' ? triangleVertices(shape.sideA, shape.sideB, shape.sideC) : null,
    [shape]
  );

  // ── Pick the bottom-most edge for dimension annotations (most visual space) ──
  let annotEdge = 0;
  let maxMidY = -Infinity;
  for (let k = 0; k < n; k++) {
    const [, y0] = polyPoints[k];
    const [, y1] = polyPoints[(k + 1) % n];
    if ((y0 + y1) / 2 > maxMidY) { maxMidY = (y0 + y1) / 2; annotEdge = k; }
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
  const rLabelX = (cx + rimx) / 2 + (-outY) * 9;
  const rLabelY = (cy + rimy) / 2 + outX * 9;

  // ── Side-length annotation: offset line just outside the bottom edge ──
  const tickGap = 5;
  const tickLen = 8;
  const aLx0 = ev0[0] + outX * (tickGap + tickLen);
  const aLy0 = ev0[1] + outY * (tickGap + tickLen);
  const aLx1 = ev1[0] + outX * (tickGap + tickLen);
  const aLy1 = ev1[1] + outY * (tickGap + tickLen);
  const sLabelX = (aLx0 + aLx1) / 2 + outX * 9;
  const sLabelY = (aLy0 + aLy1) / 2 + outY * 9;

  // ── Overall bounding-box extents (width across the top, height down the right) ──
  const bbMinX = Math.min(...polyPoints.map((p) => p[0]));
  const bbMaxX = Math.max(...polyPoints.map((p) => p[0]));
  const bbMinY = Math.min(...polyPoints.map((p) => p[1]));
  const bbMaxY = Math.max(...polyPoints.map((p) => p[1]));
  const bbGap = 12;
  const wLineY = bbMinY - bbGap; // overall-width dimension line, above the polygon
  const hLineX = bbMaxX + bbGap; // overall-height dimension line, right of the polygon

  const annotColor = '#475569';
  const annotTextColor = '#94a3b8';
  const shapeProps = { fill: 'rgba(99,102,241,0.25)', stroke: '#6366f1', strokeWidth: '1.5' };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      {/* Polygon */}
      <polygon points={polyStr} fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="1.5" />

      {/* Shape at optimal position */}
      {shape.type === 'circle' && (
        <circle cx={sx} cy={sy} r={shape.radius * scale} {...shapeProps} />
      )}
      {shape.type === 'rectangle' && (
        <rect
          x={sx - (shape.width / 2) * scale} y={sy - (shape.height / 2) * scale}
          width={shape.width * scale} height={shape.height * scale}
          {...shapeProps}
        />
      )}
      {triangleVerts && (
        <polygon
          points={triangleVerts.map(([x, y]) => `${sx + x * scale},${sy + y * scale}`).join(' ')}
          {...shapeProps}
        />
      )}

      {/* Inradius: dashed line + label */}
      <line x1={cx} y1={cy} x2={rimx} y2={rimy}
        stroke={annotColor} strokeWidth="1" strokeDasharray="3,2" />
      <text x={rLabelX} y={rLabelY} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fill={annotTextColor} fontFamily="monospace">
        r={fmt(inradius)}
      </text>

      {/* Overall width: dimension line across the top with extension ticks + label */}
      <line x1={bbMinX} y1={bbMinY} x2={bbMinX} y2={wLineY - 3} stroke={annotColor} strokeWidth="0.8" />
      <line x1={bbMaxX} y1={bbMinY} x2={bbMaxX} y2={wLineY - 3} stroke={annotColor} strokeWidth="0.8" />
      <line x1={bbMinX} y1={wLineY} x2={bbMaxX} y2={wLineY} stroke={annotColor} strokeWidth="0.8"
        markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
      <text x={(bbMinX + bbMaxX) / 2} y={wLineY - 5} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fill={annotTextColor} fontFamily="monospace">
        w={fmt(boundingWidth)}
      </text>

      {/* Overall height: dimension line down the right with extension ticks + label */}
      <line x1={bbMaxX} y1={bbMinY} x2={hLineX + 3} y2={bbMinY} stroke={annotColor} strokeWidth="0.8" />
      <line x1={bbMaxX} y1={bbMaxY} x2={hLineX + 3} y2={bbMaxY} stroke={annotColor} strokeWidth="0.8" />
      <line x1={hLineX} y1={bbMinY} x2={hLineX} y2={bbMaxY} stroke={annotColor} strokeWidth="0.8"
        markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
      <text x={hLineX + 4} y={(bbMinY + bbMaxY) / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fill={annotTextColor} fontFamily="monospace"
        transform={`rotate(90 ${hLineX + 4} ${(bbMinY + bbMaxY) / 2})`}>
        h={fmt(boundingHeight)}
      </text>

      {/* Side length: extension lines + annotation line + label */}
      <line x1={ev0[0]} y1={ev0[1]} x2={aLx0} y2={aLy0} stroke={annotColor} strokeWidth="0.8" />
      <line x1={ev1[0]} y1={ev1[1]} x2={aLx1} y2={aLy1} stroke={annotColor} strokeWidth="0.8" />
      <line x1={aLx0} y1={aLy0} x2={aLx1} y2={aLy1} stroke={annotColor} strokeWidth="0.8"
        markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
      <text x={sLabelX} y={sLabelY} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fill={annotTextColor} fontFamily="monospace">
        s={fmt(sideLength)}
      </text>
    </svg>
  );
}
