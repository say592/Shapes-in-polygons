# Shape Polygon Fitter — Claude Notes

## What this project is

A Vite + React + TypeScript single-page app. Users select a shape (circle, rectangle, triangle), enter dimensions, and see the minimum regular polygon (3–12 sides) that can contain it, with SVG previews.

## Development commands

```bash
npm run dev      # start dev server on :5173
npm run build    # TypeScript check + Vite production build
npm run preview  # serve dist/ locally
```

TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`). The build step runs `tsc -b` before Vite, so type errors will fail the build.

## Key files

| File | Role |
|------|------|
| `src/lib/geometry.ts` | Support functions for each shape type; LP-based minimum inradius solver |
| `src/lib/polygonFitter.ts` | Calls `findMinInradius` for n=3..12, returns `FitResult[]` |
| `src/types.ts` | `Shape`, `FitResult` type definitions |
| `src/components/PolygonPreview.tsx` | SVG preview: draws n-gon + shape at optimal position |

## Core algorithm

For a convex shape S and a regular n-gon, the minimum inradius with optimal placement is:

```
a*(α) = max { Σ λ_k h_S(u_k) : Σ λ_k u_k = 0, Σ λ_k = 1, λ ≥ 0 }
```

Solved via LP — enumerate all C(n,3) triples of edge normals as basic feasible solutions,
solve a 3×3 linear system for each, keep the max with all λ_k ≥ 0.
Then sweep α ∈ [0, 2π/n) in 360 steps to find the global minimum.

## Adding a new shape

1. Add the type to `src/types.ts` (`Shape` union)
2. Add a support function to `src/lib/geometry.ts`
3. Wire it up in `src/lib/polygonFitter.ts` → `computeFits()`
4. Add UI inputs in `src/components/DimensionInput.tsx`
5. Add SVG rendering in `src/components/PolygonPreview.tsx`

## SVG coordinate system

The n-gon is drawn centred at `(size/2, size/2)`. The shape's optimal translation `t*`
(in polygon-space) is scaled by `scale = (size/2 - padding) / circumradius` and applied
as an offset from the SVG centre. The polygon's orientation angle `alpha` is the angle of
its *first edge normal*, so vertex k is at angle `alpha + π/n + k·2π/n` from centre.
