# Kingdom Frontier 2D

Kingdom Frontier 2D is a browser-based 2D castle defense game built with React, Vite, and Phaser. The game combines exploration, NPC interaction, wave survival, ally support, upgrades, loot, and castle defense mechanics.

## Live Demo

https://kingdom-frontier-2d.netlify.app

## GitHub Repository

https://github.com/abhishekpr-devops/kingdom-frontier-2d

## Features

- Large explorable 2D fantasy map
- Player-controlled knight with movement, sprinting, combat, and potions
- Allied units including knights, archers, castle archers, and healer
- Enemy waves with goblins, orcs, armored orcs, ranged orcs, and troll boss
- Castle defense with repair and damage states
- NPC interaction with merchant, blacksmith, and king
- Shop system for buying, upgrading, repairing, and selling loot
- Inventory, quests, gold, XP, and player progression
- Save, load, and delete-save support using browser localStorage
- Sound effects with sound toggle
- Main menu and Game Over restart flow
- Netlify deployment support

## Controls

| Key | Action |
|---|---|
| WASD / Arrow Keys | Move |
| Shift | Sprint |
| Space | Attack |
| E | Talk to NPC |
| B | Open shop near Merchant or Blacksmith |
| I | Open inventory |
| Q | Open quests |
| O | Open upgrades |
| U | Use potion |
| R | Repair castle near gate / restart after Game Over |
| P | Save game |
| L | Load game |
| X | Delete save |
| M | Toggle sound |
| ESC | Pause |
| H | Show or hide help |

## Tech Stack

- React
- Vite
- Phaser
- JavaScript
- CSS
- Netlify
- GitHub

## Project Structure

~~~txt
2d/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── netlify.toml
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── game/
    │   ├── PhaserGame.jsx
    │   └── scenes/
    │       └── WorldScene.js
    ├── styles/
    │   └── main.css
    └── ui/
        └── HUD.jsx
~~~

## Local Development

Install dependencies:

~~~bash
npm install
~~~

Start the development server:

~~~bash
npm run dev
~~~

Build for production:

~~~bash
npm run build
~~~

Preview the production build:

~~~bash
npm run preview
~~~

## Deployment

The project is configured for Netlify deployment.

Build command:

~~~bash
npm run build
~~~

Publish directory:

~~~txt
dist
~~~

Netlify automatic builds may be disabled to avoid build credit usage. The recommended workflow is to test locally, commit to GitHub, and deploy manually only when required.

Manual deployment:

~~~bash
npx netlify-cli deploy --build --prod
~~~

## Notes

- Save data is stored in the browser using localStorage.
- Saves are browser-specific and domain-specific.
- Localhost saves and Netlify saves are separate.
- The game currently uses Phaser shape-based visuals instead of external sprite assets.
- Netlify builds are intentionally managed carefully to avoid unnecessary credit usage.

## Status

Current project status: playable prototype with working castle defense, waves, allies, enemies, shop, upgrades, save/load, and deployment support.
