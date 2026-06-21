import type { Shape, FitResult } from '../types';
import PolygonCard from './PolygonCard';

interface Props {
  shape: Shape;
  results: FitResult[];
}

export default function ResultsGrid({ shape, results }: Props) {
  return (
    <div className="results-section">
      <h2 className="results-title">Minimum enclosing polygons</h2>
      <p className="results-subtitle">
        The smallest regular polygon of each type that contains your shape, with the shape at its
        optimal position.
      </p>
      <div className="results-grid">
        {results.map((result) => (
          <PolygonCard key={result.sides} shape={shape} result={result} />
        ))}
      </div>
    </div>
  );
}
