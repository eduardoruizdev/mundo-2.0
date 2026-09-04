// Calcula, para cada país, um ponto (lng/lat) garantidamente dentro
// do seu maior território — usado para posicionar bandeiras e para
// o "voo" da câmera.
//
// Por que não usar geoCentroid direto na geometria?
// - Países com MultiPolygon cujas partes ficam muito distantes
//   (ex.: França + Guiana Francesa) têm o centróide "puxado" para
//   o meio do oceano, entre as partes.
// - Formatos côncavos (Chile, Noruega, Filipinas...) podem ter
//   centróide geométrico fora do próprio polígono.
//
// Estratégia:
// 1. Escolhe o polígono de MAIOR ÁREA dentro do país (ignora ilhas
//    e territórios ultramarinos menores).
// 2. Dentro desse polígono, encontra o "polo de inacessibilidade"
//    (ponto mais distante das bordas) — mesma técnica usada pelo
//    polylabel do Mapbox para posicionar labels em mapas.
// 3. Trata corretamente polígonos que cruzam o antimeridiano
//    (180°/-180°), como partes da Rússia, Fiji, Nova Zelândia etc.

type LngLat = [number, number];
type Ring = LngLat[];
type PolygonCoords = Ring[]; // [0] = anel externo, [1..] = buracos

function ringArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function polygonArea(polygon: PolygonCoords): number {
  if (!polygon.length) return 0;
  let area = ringArea(polygon[0]);
  for (let i = 1; i < polygon.length; i++) area -= ringArea(polygon[i]);
  return Math.max(area, 0);
}

function pointInRing(point: LngLat, ring: Ring): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point: LngLat, polygon: PolygonCoords): boolean {
  if (!pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false; // caiu num buraco
  }
  return true;
}

function distToSegment(p: LngLat, a: LngLat, b: LngLat): number {
  const [x, y] = p;
  let [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx !== 0 || dy !== 0) {
    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x1 = x2;
      y1 = y2;
    } else if (t > 0) {
      x1 += dx * t;
      y1 += dy * t;
    }
  }

  const ddx = x - x1;
  const ddy = y - y1;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

function distToRing(point: LngLat, ring: Ring): number {
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const d = distToSegment(point, ring[j], ring[i]);
    if (d < min) min = d;
  }
  return min;
}

function distToPolygon(point: LngLat, polygon: PolygonCoords): number {
  const inside = pointInPolygon(point, polygon);
  let dist = distToRing(point, polygon[0]);
  for (let i = 1; i < polygon.length; i++) {
    dist = Math.min(dist, distToRing(point, polygon[i]));
  }
  return inside ? dist : -dist;
}

function bbox(polygon: PolygonCoords) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of polygon[0]) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

type Cell = { x: number; y: number; h: number; d: number; max: number };

function makeCell(
  x: number,
  y: number,
  h: number,
  polygon: PolygonCoords,
): Cell {
  const d = distToPolygon([x, y], polygon);
  return { x, y, h, d, max: d + h * Math.SQRT2 };
}

function getCentroidCell(polygon: PolygonCoords): Cell {
  let area = 0;
  let x = 0;
  let y = 0;
  const ring = polygon[0];
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const a = ring[i];
    const b = ring[j];
    const f = a[0] * b[1] - b[0] * a[1];
    x += (a[0] + b[0]) * f;
    y += (a[1] + b[1]) * f;
    area += f * 3;
  }
  if (area === 0) return makeCell(ring[0][0], ring[0][1], 0, polygon);
  return makeCell(x / area, y / area, 0, polygon);
}

// Versão simplificada do algoritmo "polylabel" (Mapbox).
function visualCenter(polygon: PolygonCoords, precision = 0.02): LngLat {
  const { minX, minY, maxX, maxY } = bbox(polygon);
  const width = maxX - minX;
  const height = maxY - minY;
  if (width === 0 || height === 0) return [minX, minY];

  const cellSize = Math.min(width, height);
  let h = cellSize / 2;
  if (h === 0) return [minX, minY];

  let cellQueue: Cell[] = [];
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      cellQueue.push(makeCell(x + h, y + h, h, polygon));
    }
  }

  let best = makeCell(minX + width / 2, minY + height / 2, 0, polygon);
  const centroidCell = getCentroidCell(polygon);
  if (centroidCell.d > best.d) best = centroidCell;

  while (cellQueue.length) {
    cellQueue.sort((a, b) => a.max - b.max);
    const cell = cellQueue.pop()!;
    if (cell.d > best.d) best = cell;
    if (cell.max - best.d <= precision) continue;

    h = cell.h / 2;
    cellQueue.push(makeCell(cell.x - h, cell.y - h, h, polygon));
    cellQueue.push(makeCell(cell.x + h, cell.y - h, h, polygon));
    cellQueue.push(makeCell(cell.x - h, cell.y + h, h, polygon));
    cellQueue.push(makeCell(cell.x + h, cell.y + h, h, polygon));
  }

  return [best.x, best.y];
}

function extractPolygons(geometry: any): PolygonCoords[] {
  if (!geometry) return [];
  if (geometry.type === "Polygon")
    return [geometry.coordinates as PolygonCoords];
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates as PolygonCoords[];
  return [];
}

// Corrige polígonos que cruzam o antimeridiano (ex.: parte da Rússia,
// Fiji, Nova Zelândia), "desenrolando" as longitudes negativas.
function normalizePolygon(polygon: PolygonCoords): PolygonCoords {
  const outer = polygon[0];
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const [lng] of outer) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  if (maxLng - minLng <= 180) return polygon;

  return polygon.map((ring) =>
    ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat] as LngLat),
  );
}

export function getCountryPlacement(
  geometry: any,
): { lng: number; lat: number; bboxWidth: number; bboxHeight: number } | null {
  const rawPolygons = extractPolygons(geometry);
  if (!rawPolygons.length) return null;

  let bestPolygon: PolygonCoords | null = null;
  let bestArea = -1;

  for (const raw of rawPolygons) {
    const polygon = normalizePolygon(raw);
    const area = polygonArea(polygon);
    if (area > bestArea) {
      bestArea = area;
      bestPolygon = polygon;
    }
  }

  if (!bestPolygon) return null;

  const [x, y] = visualCenter(bestPolygon);
  const lng = x > 180 ? x - 360 : x;
  const lat = y;

  const { minX, minY, maxX, maxY } = bbox(bestPolygon);

  return { lng, lat, bboxWidth: maxX - minX, bboxHeight: maxY - minY };
}
