import { useEffect, useRef } from "react";
import Phaser from "phaser";
import WorldScene from "./scenes/WorldScene";

export default function PhaserGame() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: "game-container",
      backgroundColor: "#020617",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: [WorldScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="game-container" />;
}
