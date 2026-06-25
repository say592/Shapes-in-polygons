export type ShapeType = 'circle' | 'rectangle' | 'triangle';

export interface CircleShape {
  type: 'circle';
  radius: number;
}

export interface RectangleShape {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface TriangleShape {
  type: 'triangle';
  sideA: number;
  sideB: number;
  sideC: number;
}

export type Shape = CircleShape | RectangleShape | TriangleShape;

export interface FitResult {
  sides: number;
  polygonName: string;
  inradius: number;
  circumradius: number;
  sideLength: number;
  /** Overall bounding-box width of the polygon at its computed orientation. */
  boundingWidth: number;
  /** Overall bounding-box height of the polygon at its computed orientation. */
  boundingHeight: number;
  alpha: number;
  translation: [number, number];
}
