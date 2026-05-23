// src/game3d/systems/enemyAI.js
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useEnemyAI(enemyRef, playerRef) {
  const speed = 0.05; // slower than player
  const chaseRadius = 50;

  useFrame(() => {
    if (!enemyRef.current || !playerRef.current) return;
    const enemyPos = enemyRef.current.position;
    const playerPos = playerRef.current.position;
    const distance = enemyPos.distanceTo(playerPos);
    if (distance < chaseRadius) {
      // move towards player
      const direction = new THREE.Vector3()
        .subVectors(playerPos, enemyPos)
        .normalize()
        .multiplyScalar(speed);
      enemyPos.add(direction);
      // rotate to face player
      const angle = Math.atan2(direction.x, direction.z);
      enemyRef.current.rotation.y = angle;
    }
  });
}
