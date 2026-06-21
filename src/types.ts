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
  alpha: number;
  translation: [number, number];
}
