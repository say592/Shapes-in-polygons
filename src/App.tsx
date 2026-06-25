import { useState, useMemo, useDeferredValue } from 'react';
import type { Shape, ShapeType, FitResult } from './types';
import { computeFits } from './lib/polygonFitter';
import ShapeSelector from './components/ShapeSelector';
import DimensionInput from './components/DimensionInput';
import ResultsGrid from './components/ResultsGrid';
import './App.css';

function parseNum(v: string | undefined): number {
  const n = parseFloat(v ?? '');
  return isNaN(n) ? 0 : n;
}

function buildShape(type: ShapeType, vals: Record<string, string>): Shape | null {
  if (type === 'circle') {
    const radius = parseNum(vals.radius);
    if (radius <= 0) return null;
    return { type, radius };
  }
  if (type === 'rectangle') {
    const width = parseNum(vals.width);
    const height = parseNum(vals.height);
    if (width <= 0 || height <= 0) return null;
    return { type, width, height };
  }
  if (type === 'triangle') {
    const sideA = parseNum(vals.sideA);
    const sideB = parseNum(vals.sideB);
    const sideC = parseNum(vals.sideC);
    if (sideA <= 0 || sideB <= 0 || sideC <= 0) return null;
    if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) return null;
    return { type, sideA, sideB, sideC };
  }
  return null;
}

function getInputError(type: ShapeType, vals: Record<string, string>): string | null {
  if (type === 'circle') {
    const r = parseNum(vals.radius);
    if (vals.radius && r <= 0) return 'Radius must be greater than zero.';
  }
  if (type === 'rectangle') {
    const w = parseNum(vals.width);
    const h = parseNum(vals.height);
    if (vals.width && w <= 0) return 'Width must be greater than zero.';
    if (vals.height && h <= 0) return 'Height must be greater than zero.';
  }
  if (type === 'triangle') {
    const a = parseNum(vals.sideA);
    const b = parseNum(vals.sideB);
    const c = parseNum(vals.sideC);
    if (a > 0 && b > 0 && c > 0) {
      if (a + b <= c || a + c <= b || b + c <= a) {
        return 'These side lengths do not form a valid triangle.';
      }
    }
  }
  return null;
}

// Shared arrow marker — a single definition used by all PolygonPreview instances
function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <marker id="dim-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M5,0 L0,2.5 L5,5" fill="none" stroke="#475569" strokeWidth="0.8" />
        </marker>
      </defs>
    </svg>
  );
}

export default function App() {
  const [shapeType, setShapeType] = useState<ShapeType>('circle');
  const [values, setValues] = useState<Record<string, string>>({ radius: '5' });

  const handleShapeChange = (type: ShapeType) => {
    setShapeType(type);
    if (type === 'circle') setValues({ radius: '5' });
    else if (type === 'rectangle') setValues({ width: '8', height: '5' });
    else setValues({ sideA: '5', sideB: '6', sideC: '7' });
  };

  const handleValueChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const shape = useMemo(() => buildShape(shapeType, values), [shapeType, values]);
  const error = useMemo(() => getInputError(shapeType, values), [shapeType, values]);

  // Defer the expensive LP computation so keystrokes stay responsive
  const deferredShape = useDeferredValue(shape);
  const results = useMemo<FitResult[] | null>(() => {
    if (!deferredShape) return null;
    return computeFits(deferredShape);
  }, [deferredShape]);

  return (
    <div className="app">
      <SvgDefs />
      <header className="app-header">
        <h1 className="app-title">Shape Polygon Fitter</h1>
        <p className="app-subtitle">
          Find the smallest regular polygon that can contain your shape, from triangle to dodecagon.
        </p>
      </header>

      <main className="app-body">
        <aside className="controls-panel">
          <ShapeSelector value={shapeType} onChange={handleShapeChange} />
          <DimensionInput
            shapeType={shapeType}
            values={values}
            onChange={handleValueChange}
            error={error}
          />

          {shape && (
            <div className="shape-summary">
              <label className="field-label">Shape summary</label>
              {shape.type === 'circle' && <p>Circle with radius {shape.radius}</p>}
              {shape.type === 'rectangle' && (
                <p>{shape.width} × {shape.height} rectangle</p>
              )}
              {shape.type === 'triangle' && (
                <p>Triangle with sides {shape.sideA}, {shape.sideB}, {shape.sideC}</p>
              )}
            </div>
          )}
        </aside>

        <section className="results-panel">
          {results && shape ? (
            <ResultsGrid shape={shape} results={results} />
          ) : (
            <div className="empty-state">
              <p>Enter valid dimensions to see results.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
