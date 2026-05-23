// src/game3d/systems/combat.js
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useCombat(playerRef, enemyRef) {
  const cooldown = 1; // seconds
  const lastAttack = useRef(0);
  const attackRange = 3; // world units

  // initialize health on meshes if not present
  useEffect(() => {
    if (playerRef.current && playerRef.current.userData.health === undefined) {
      playerRef.current.userData.health = 100;
    }
    if (enemyRef.current && enemyRef.current.userData.health === undefined) {
      enemyRef.current.userData.health = 30;
    }
  }, []);

  // simple key handling for attack (Space)
  const keys = {};
  function handleKey(e, down) {
    if (e.code === "Space") keys["space"] = down;
  }
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => handleKey(e, true));
    window.addEventListener("keyup", (e) => handleKey(e, false));
  }

  useFrame((state, delta) => {
    const now = state.clock.getElapsedTime();
    if (!playerRef.current || !enemyRef.current) return;
    // attack logic
    if (keys["space"] && now - lastAttack.current > cooldown) {
      const playerPos = playerRef.current.position;
      const enemyPos = enemyRef.current.position;
      const dist = playerPos.distanceTo(enemyPos);
      if (dist <= attackRange) {
        // apply damage
        enemyRef.current.userData.health -= 10;
        // simple visual feedback: flash enemy color
        enemyRef.current.material.color.setHex(0xff0000);
        setTimeout(() => {
          if (enemyRef.current) enemyRef.current.material.color.setHex(0x8b0000);
        }, 100);
        // TODO: reduce player health if desired (e.g., enemy counterattack)
      }
      // trigger sword swing animation (rotate sword mesh)
      const sword = playerRef.current.getObjectByName("sword");
      if (sword) {
        sword.rotation.z = -Math.PI / 4; // swing forward
        setTimeout(() => {
          if (sword) sword.rotation.z = 0;
        }, 200);
      }
      lastAttack.current = now;
    }

    // hide enemy when dead
    if (enemyRef.current.userData.health <= 0) {
      enemyRef.current.visible = false;
    }
  });
}
