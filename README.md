# Shape Polygon Fitter

A browser utility that answers one question: **what is the smallest regular polygon that can contain a given shape?**

Select a shape (circle, rectangle, or triangle), enter its dimensions, and instantly see the minimum-size triangle, square, pentagon, hexagon, heptagon, octagon, nonagon, decagon, hendecagon, and dodecagon that fits it — each with an SVG preview showing the shape at its optimal position inside the polygon.

## Math

The problem reduces to finding the **minimum enclosing regular n-gon** for a convex shape. Using LP duality, the minimum inradius (apothem) is:

```
a* = max { Σ λ_k · h_S(u_k) : Σ λ_k · u_k = 0, Σ λ_k = 1, λ ≥ 0 }
```

where `u_k` are the outward edge-normal directions of the n-gon at orientation α, and `h_S` is the support function of the shape. This is solved by enumerating all basic feasible solutions (≤ C(n,3) triples) over a sweep of orientations α.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Stack

- **Vite** + **React** + **TypeScript**
- Pure SVG rendering — no canvas, no charting library
- Zero runtime dependencies beyond React

## Project Structure

```
src/
  lib/
    geometry.ts       # Support functions + LP-based min-inradius solver
    polygonFitter.ts  # Shape → FitResult[] computation
  components/
    ShapeSelector.tsx
    DimensionInput.tsx
    PolygonPreview.tsx  # SVG preview per polygon
    PolygonCard.tsx
    ResultsGrid.tsx
  types.ts
  App.tsx
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```
