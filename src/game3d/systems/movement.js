// src/game3d/systems/movement.js
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { isOutsideBoundary, isInWater } from "./collision";
import { mapZones } from "../data/mapZones";

// Simple keyboard state singleton
const keys = {};
function handleKey(e, down) {
  keys[e.key.toLowerCase()] = down;
}
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => handleKey(e, true));
  window.addEventListener("keyup", (e) => handleKey(e, false));
}

export function usePlayerMovement(playerRef) {
  const speed = 0.1;
  const sprintMultiplier = 2;

  useFrame(() => {
    if (!playerRef.current) return;
    const direction = new THREE.Vector3();
    if (keys["w"]) direction.z -= 1;
    if (keys["s"]) direction.z += 1;
    if (keys["a"]) direction.x -= 1;
    if (keys["d"]) direction.x += 1;
    if (direction.lengthSq() === 0) return;

    direction.normalize();
    const isSprinting = keys["shift"]; // Shift key for sprint
    const moveDist = speed * (isSprinting ? sprintMultiplier : 1);
    const delta = direction.clone().multiplyScalar(moveDist);

    const prevPos = playerRef.current.position.clone();
    const nextPos = prevPos.clone().add(delta);

    // Collision checks: water and map boundaries
    if (isInWater(nextPos) || isOutsideBoundary(nextPos)) {
      // cancel movement
    } else {
      playerRef.current.position.copy(nextPos);
      // rotate player to face movement direction (y axis up)
      const angle = Math.atan2(delta.x, delta.z);
      playerRef.current.rotation.y = angle;
    }
  });
}

export function useCameraFollow(playerRef) {
  const { camera } = useThree();
  const offset = new THREE.Vector3(0, 10, 10); // camera offset behind player

  useFrame(() => {
    if (!playerRef.current) return;
    const playerPos = playerRef.current.position.clone();
    const desiredPos = playerPos.clone().add(offset);
    // Simple lerp for smooth motion
    camera.position.lerp(desiredPos, 0.1);
    camera.lookAt(playerPos);
  });
}
