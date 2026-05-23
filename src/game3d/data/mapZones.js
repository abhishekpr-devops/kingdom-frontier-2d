// src/game3d/data/mapZones.js
// Define simple map boundaries and water area
// All coordinates are in world units (same as Three.js scene)

export const mapZones = {
  // Square ground area (centered at 0,0)
  boundary: {
    minX: -100,
    maxX: 100,
    minZ: -100,
    maxZ: 100,
  },
  // Water rectangle (centered at 0,0, shallow Y = 0.1)
  water: {
    minX: -30,
    maxX: 30,
    minZ: -30,
    maxZ: 30,
    y: 0.1,
  },
};
