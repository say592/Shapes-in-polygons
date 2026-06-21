// Support function: farthest projection of shape onto direction theta
export function circleSupport(r: number, _theta: number): number {
  return r;
}

export function rectangleSupport(w: number, h: number, theta: number): number {
  return (w / 2) * Math.abs(Math.cos(theta)) + (h / 2) * Math.abs(Math.sin(theta));
}

// Triangle defined by side lengths; vertices computed relative to centroid
export function triangleVertices(sideA: number, sideB: number, sideC: number): [number, number][] {
  // Place V0 at origin, V1 at (sideC, 0); angle at V0 gives V2
  const cosA = (sideB ** 2 + sideC ** 2 - sideA ** 2) / (2 * sideB * sideC);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA ** 2));
  const v0: [number, number] = [0, 0];
  const v1: [number, number] = [sideC, 0];
  const v2: [number, number] = [sideB * cosA, sideB * sinA];
  const cx = (v0[0] + v1[0] + v2[0]) / 3;
  const cy = (v0[1] + v1[1] + v2[1]) / 3;
  return [
    [v0[0] - cx, v0[1] - cy],
    [v1[0] - cx, v1[1] - cy],
    [v2[0] - cx, v2[1] - cy],
  ];
}

export function triangleSupport(verts: [number, number][], theta: number): number {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return Math.max(...verts.map(([x, y]) => x * cos + y * sin));
}

// Solve 3x3 linear system Ax = b via Gaussian elimination with partial pivoting
function solve3x3(A: number[][], b: number[]): number[] | null {
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < 3; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivotRow][col])) pivotRow = row;
    }
    if (Math.abs(M[pivotRow][col]) < 1e-12) return null;
    [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    for (let row = 0; row < 3; row++) {
      if (row !== col) {
        const f = M[row][col] / M[col][col];
        for (let c = col; c <= 3; c++) M[row][c] -= f * M[col][c];
      }
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}

// Minimum inradius of a regular n-gon (edge normals at alpha + k*2π/n) containing the shape.
// Uses LP duality: a* = max { Σ λ_k·h(u_k) : Σ λ_k·u_k = 0, Σ λ_k = 1, λ ≥ 0 }
// Solved by enumerating basic feasible solutions (at most C(n,3) triples to check).
export function minInradiusForOrientation(
  supportFn: (theta: number) => number,
  n: number,
  alpha: number
): { inradius: number; translation: [number, number] } {
  const thetas = Array.from({ length: n }, (_, k) => alpha + (k * 2 * Math.PI) / n);
  const c = thetas.map((t) => supportFn(t));
  const U = thetas.map((t) => [Math.cos(t), Math.sin(t)] as [number, number]);

  let maxObj = -Infinity;
  let bestIndices: number[] = [];

  // Enumerate triples of active constraints
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const A = [
          [U[i][0], U[j][0], U[k][0]],
          [U[i][1], U[j][1], U[k][1]],
          [1, 1, 1],
        ];
        const lambda = solve3x3(A, [0, 0, 1]);
        if (lambda && lambda.every((l) => l >= -1e-9)) {
          const obj = lambda[0] * c[i] + lambda[1] * c[j] + lambda[2] * c[k];
          if (obj > maxObj) {
            maxObj = obj;
            bestIndices = [i, j, k];
          }
        }
      }
    }
  }

  // For even n, also check anti-parallel pairs (degenerate BFS with 2 variables)
  if (n % 2 === 0) {
    const half = n / 2;
    for (let i = 0; i < half; i++) {
      const j = i + half;
      const obj = (c[i] + c[j]) / 2;
      if (obj > maxObj) {
        maxObj = obj;
        bestIndices = [i, j];
      }
    }
  }

  // Recover optimal translation: u_i · t* = a* - c_i for the two tightest constraints
  let tx = 0;
  let ty = 0;
  if (bestIndices.length >= 2) {
    const i = bestIndices[0];
    const j = bestIndices[1];
    const rhs0 = maxObj - c[i];
    const rhs1 = maxObj - c[j];
    const det = U[i][0] * U[j][1] - U[i][1] * U[j][0];
    if (Math.abs(det) > 1e-10) {
      tx = (rhs0 * U[j][1] - rhs1 * U[i][1]) / det;
      ty = (U[i][0] * rhs1 - U[j][0] * rhs0) / det;
    }
  }

  return { inradius: maxObj, translation: [tx, ty] };
}

// Scan all polygon orientations in [0, 2π/n) to find the minimum enclosing inradius
export function findMinInradius(
  supportFn: (theta: number) => number,
  n: number,
  steps = 360
): { inradius: number; alpha: number; translation: [number, number] } {
  const period = (2 * Math.PI) / n;
  let best = { inradius: Infinity, alpha: 0, translation: [0, 0] as [number, number] };

  for (let i = 0; i < steps; i++) {
    const alpha = (i / steps) * period;
    const result = minInradiusForOrientation(supportFn, n, alpha);
    if (result.inradius < best.inradius) {
      best = { inradius: result.inradius, alpha, translation: result.translation };
    }
  }

  return best;
}
