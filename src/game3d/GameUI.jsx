// src/game3d/GameUI.jsx
import React from "react";
import './GameUI.css';

export default function GameUI({ playerHp = 100, wave = 1, gold = 0 }) {
  return (
    <div className="game-ui">
      <div className="ui-bar">HP: {playerHp}</div>
      <div className="ui-bar">Wave: {wave}</div>
      <div className="ui-bar">Gold: {gold}</div>
    </div>
  );
}
