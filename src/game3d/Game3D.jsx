// src/game3d/Game3D.jsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import World3D from "./World3D";
import GameUI from "./GameUI";

// Canvas styling for full-screen display
const canvasStyle = {
  width: "100vw",
  height: "100vh",
  display: "block",
};

export default function Game3D() {
  return (
    <>
      <Canvas style={canvasStyle} camera={{ position: [0, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <World3D />
      </Canvas>
      <GameUI />
    </>
  );
}
