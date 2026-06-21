import type { ShapeType } from '../types';

interface Props {
  value: ShapeType;
  onChange: (shape: ShapeType) => void;
}

const SHAPES: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'circle', label: 'Circle', icon: '○' },
  { type: 'rectangle', label: 'Rectangle', icon: '▭' },
  { type: 'triangle', label: 'Triangle', icon: '△' },
];

export default function ShapeSelector({ value, onChange }: Props) {
  return (
    <div className="shape-selector">
      <label className="field-label">Select shape</label>
      <div className="shape-buttons">
        {SHAPES.map(({ type, label, icon }) => (
          <button
            key={type}
            className={`shape-btn${value === type ? ' active' : ''}`}
            onClick={() => onChange(type)}
          >
            <span className="shape-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
