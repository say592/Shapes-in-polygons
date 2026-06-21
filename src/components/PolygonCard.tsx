import type { Shape, FitResult } from '../types';
import PolygonPreview from './PolygonPreview';

interface Props {
  shape: Shape;
  result: FitResult;
}

function fmt(n: number): string {
  return n.toFixed(4);
}

export default function PolygonCard({ shape, result }: Props) {
  const { polygonName, sides, inradius, circumradius, sideLength } = result;

  return (
    <div className="polygon-card">
      <div className="card-header">
        <span className="polygon-name">{polygonName}</span>
        <span className="polygon-sides">{sides} sides</span>
      </div>

      <div className="card-preview">
        <PolygonPreview shape={shape} result={result} size={180} />
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Side length</span>
          <span className="stat-value">{fmt(sideLength)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Inradius</span>
          <span className="stat-value">{fmt(inradius)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Circumradius</span>
          <span className="stat-value">{fmt(circumradius)}</span>
        </div>
      </div>
    </div>
  );
}
