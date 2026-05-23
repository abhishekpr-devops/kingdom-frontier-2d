// src/game3d/systems/collision.js
import { mapZones } from "../data/mapZones";

export function isInWater(pos) {
  const w = mapZones.water;
  return (
    pos.x > w.minX &&
    pos.x < w.maxX &&
    pos.z > w.minZ &&
    pos.z < w.maxZ &&
    pos.y <= w.y + 0.5 // allow small tolerance
  );
}

export function isOutsideBoundary(pos) {
  const b = mapZones.boundary;
  return (
    pos.x < b.minX ||
    pos.x > b.maxX ||
    pos.z < b.minZ ||
    pos.z > b.maxZ
  );
}
