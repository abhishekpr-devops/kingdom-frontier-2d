import React, { useState } from "react";
import PhaserGame from "./game/PhaserGame";
import Game3D from "./game3d/Game3D";
import './styles/App.css';

export default function App() {
  const [show3D, setShow3D] = useState(false);

  return (
    <div className="app">
      <button
        className="toggle-btn"
        onClick={() => setShow3D((prev) => !prev)}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}
      >
        {show3D ? "Switch to 2D" : "Switch to 3D"}
      </button>
      {show3D ? <Game3D /> : <PhaserGame />}
    </div>
  );
}
