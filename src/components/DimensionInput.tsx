import type { ShapeType } from '../types';

interface Props {
  shapeType: ShapeType;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  error?: string | null;
}

function NumericField({
  label,
  field,
  values,
  onChange,
  unit = 'units',
}: {
  label: string;
  field: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  unit?: string;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={field}>
        {label}
      </label>
      <div className="input-row">
        <input
          id={field}
          type="number"
          min="0.01"
          step="any"
          value={values[field] ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
          className="num-input"
          placeholder="0"
        />
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}

export default function DimensionInput({ shapeType, values, onChange, error }: Props) {
  return (
    <div className="dimension-input">
      <label className="field-label">Dimensions</label>

      {shapeType === 'circle' && (
        <NumericField label="Radius" field="radius" values={values} onChange={onChange} />
      )}

      {shapeType === 'rectangle' && (
        <>
          <NumericField label="Width" field="width" values={values} onChange={onChange} />
          <NumericField label="Height" field="height" values={values} onChange={onChange} />
        </>
      )}

      {shapeType === 'triangle' && (
        <>
          <p className="hint">Enter all three side lengths. Any valid triangle is supported.</p>
          <NumericField label="Side A" field="sideA" values={values} onChange={onChange} />
          <NumericField label="Side B" field="sideB" values={values} onChange={onChange} />
          <NumericField label="Side C" field="sideC" values={values} onChange={onChange} />
        </>
      )}

      {error && <p className="input-error">{error}</p>}
    </div>
  );
}
