// src/game3d/World3D.jsx
import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayerMovement } from "./systems/movement";
import { useCameraFollow } from "./systems/movement";
import { useEnemyAI } from "./systems/enemyAI";
import { useCombat } from "./systems/combat";
import { isInWater, isOutsideBoundary } from "./systems/collision";
import { mapZones } from "./data/mapZones";

export default function World3D() {
  // refs for player and enemy meshes
  const playerRef = useRef();
  const enemyRef = useRef();

  // custom hooks for movement, camera, combat, AI
  usePlayerMovement(playerRef);
  useCameraFollow(playerRef);
  useCombat(playerRef, enemyRef);
  useEnemyAI(enemyRef, playerRef);

  // Simple ground
  const groundSize = 200;
  const waterY = 0.1; // slight elevation for water plane

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#6c9a8b" />
      </mesh>

      {/* Water */}
      <mesh position={[0, waterY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} />
      </mesh>

      {/* Castle (simple box) */}
      <mesh position={[0, 1, -30]} castShadow>
        <boxGeometry args={[20, 10, 20]} />
        <meshStandardMaterial color="#8b7d6b" />
      </mesh>

      {/* Bridge over water */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[30, 5]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>

      {/* Trees (cones) */}
      {[...Array(10)].map((_, i) => (
        <mesh
          key={i}
          position={[
            THREE.MathUtils.randFloatSpread(groundSize / 2),
            0,
            THREE.MathUtils.randFloatSpread(groundSize / 2),
          ]}
          castShadow>
          <coneGeometry args={[1, 4, 8]} />
          <meshStandardMaterial color="#2e7d32" />
        </mesh>
      ))}

      {/* Player (simple box as placeholder) */}
      <mesh ref={playerRef} position={[0, 1, 20]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#ffffff" />
        {/* Sword for attack animation */}
        <mesh name="sword" position={[0, 1, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 1, 0.2]} />
          <meshStandardMaterial color="#c1c1c1" />
        </mesh>
      </mesh>

      {/* Enemy goblin (box) */}
      <mesh ref={enemyRef} position={[0, 1, -10]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#8b0000" />
      </mesh>
    </group>
  );
}
