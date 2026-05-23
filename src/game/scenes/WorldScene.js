import Phaser from "phaser";

const SAVE_KEY = "kingdom-frontier-2d-save-v04";

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  init(data) {
    this.skipMainMenuOnStart = Boolean(data?.skipMainMenu);
  }

  create() {
    this.worldW = 2400;
    this.worldH = 1500;

    this.enemyLanes = [
      { name: "north road", x: 1480, y: 250 },
      { name: "main road", x: 1320, y: 560 },
      { name: "south road", x: 1240, y: 940 },
      { name: "forest path", x: 1680, y: 430 },
      { name: "mountain pass", x: 1980, y: 250 },
      { name: "swamp trail", x: 1900, y: 1180 },
    ];

    this.castleAttackPoints = [
      { x: 235, y: 455 },
      { x: 235, y: 515 },
      { x: 235, y: 575 },
      { x: 205, y: 520 },
    ];

    this.wave = 1;
    this.waveCooldown = false;
    this.castleHealth = 500;
    this.maxCastleHealth = 500;

    this.lastPlayerAttack = 0;
    this.helpVisible = true;
    this.shopOpen = false;
    this.inventoryOpen = false;
    this.questOpen = false;
    this.upgradeOpen = false;
    this.upgradeCardOpen = false;
    this.formationMode = "follow";
    this.waveActive = false;
    this.currentUpgradeCards = [];
    this.isPaused = false;
    this.gameEnded = false;
    this.mainMenuOpen = !this.skipMainMenuOnStart;
    this.soundEnabled = true;
    this.lastSavedText = "Never";

    this.playerStats = {
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      gold: 80,
      xp: 0,
      level: 1,
      damage: 28,
      potions: 2,
      swordLevel: 1,
      allyUpgradeLevel: 1,
      castleArcherLevel: 1,
      kills: 0,
      bossKills: 0,
      loot: {
        goblinCoin: 0,
        wolfFur: 0,
        orcTooth: 0,
        trollBone: 0,
        magicCrystal: 0,
      },
    };

    this.quests = [
      {
        id: "kill5",
        title: "Kill 5 enemies",
        target: 5,
        progress: 0,
        done: false,
        rewardGold: 40,
        rewardXp: 40,
      },
      {
        id: "survive3",
        title: "Reach Wave 3",
        target: 3,
        progress: 1,
        done: false,
        rewardGold: 70,
        rewardXp: 60,
      },
      {
        id: "repair1",
        title: "Repair castle once",
        target: 1,
        progress: 0,
        done: false,
        rewardGold: 50,
        rewardXp: 40,
      },
      {
        id: "upgrade1",
        title: "Upgrade sword once",
        target: 1,
        progress: 0,
        done: false,
        rewardGold: 30,
        rewardXp: 40,
      },
      {
        id: "boss1",
        title: "Defeat 1 boss",
        target: 1,
        progress: 0,
        done: false,
        rewardGold: 150,
        rewardXp: 120,
      },
    ];

    this.createWorld();
    this.createBattlefieldPolish();
    this.drawEnemyLaneMarkers();
    this.createBeautifulMapExpansion();
    this.createCastle();
    this.createCastleDamageVisuals();
    this.createPlayer();
    this.createNPCs();
    this.createAllies();
    this.createGroups();
    this.createInput();
    this.registerRestartKeys();
    this.createCamera();
    this.createCombat();
    this.createFixedUI();
    this.createMainMenu();
    this.spawnWave();

    if (this.skipMainMenuOnStart) {
      this.hideMainMenu();
      this.showMessage("New game started.");
    } else {
      this.physics.world.pause();
      this.showMessage("Main menu open. Press N for new game or L to load.");
    }
  }

  createWorld() {
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    this.add.rectangle(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, 0x3f7d20);

    for (let i = 0; i < 130; i++) {
      const x = Phaser.Math.Between(30, this.worldW - 30);
      const y = Phaser.Math.Between(30, this.worldH - 30);
      const color = Phaser.Math.RND.pick([0x4d8f27, 0x34701d, 0x5a9b32, 0x2f6b1c]);
      this.add.ellipse(x, y, Phaser.Math.Between(20, 60), Phaser.Math.Between(8, 24), color, 0.32);
    }

    this.add.rectangle(1370, 530, 740, 980, 0x14532d, 0.86);
    this.add.text(1120, 75, "Forest", {
      fontSize: "30px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

    this.add.rectangle(470, 830, 520, 260, 0x92400e, 0.88);
    this.add.text(270, 720, "Village Market", {
      fontSize: "28px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

    this.add.rectangle(900, 210, 470, 170, 0x2563eb, 0.6);
    this.add.text(770, 155, "River Area", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

    const road = this.add.graphics();
    road.fillStyle(0x7c4a18, 0.65);
    road.fillRoundedRect(190, 500, 650, 80, 24);
    road.fillRoundedRect(720, 500, 420, 70, 22);
    road.fillRoundedRect(440, 570, 90, 230, 22);

    this.add.rectangle(150, 530, 280, 460, 0x64748b, 0.35);

    for (let i = 0; i < 85; i++) {
      this.drawTree(Phaser.Math.Between(1050, 1740), Phaser.Math.Between(130, 1040));
    }

    for (let i = 0; i < 36; i++) {
      this.drawRock(Phaser.Math.Between(700, 1650), Phaser.Math.Between(260, 1000));
    }

    this.drawStall(320, 830, 0x22c55e);
    this.drawStall(480, 830, 0xf97316);
    this.drawStall(640, 830, 0x38bdf8);
  }

  createBattlefieldPolish() {
    // Small visual details that make the map feel less empty.

    // Flowers and grass details
    for (let i = 0; i < 160; i++) {
      const x = Phaser.Math.Between(60, this.worldW - 60);
      const y = Phaser.Math.Between(80, this.worldH - 60);

      // Avoid too many flowers inside dense forest, keep them mostly visible
      const color = Phaser.Math.RND.pick([0xfacc15, 0xf472b6, 0xffffff, 0xa7f3d0]);
      this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.75);
    }

    // Road stones
    for (let i = 0; i < 45; i++) {
      const x = Phaser.Math.Between(220, 1120);
      const y = Phaser.Math.Between(505, 565);
      this.add.ellipse(x, y, Phaser.Math.Between(10, 20), Phaser.Math.Between(5, 10), 0x9ca3af, 0.45);
    }

    // River highlights
    for (let i = 0; i < 18; i++) {
      this.add.ellipse(
        Phaser.Math.Between(690, 1110),
        Phaser.Math.Between(160, 255),
        Phaser.Math.Between(50, 100),
        Phaser.Math.Between(6, 12),
        0x93c5fd,
        0.35
      );
    }

    // Castle flags
    this.add.rectangle(45, 245, 6, 70, 0x1f2937);
    this.add.triangle(70, 230, 48, 210, 48, 250, 0xef4444);

    this.add.rectangle(195, 245, 6, 70, 0x1f2937);
    this.add.triangle(220, 230, 198, 210, 198, 250, 0x2563eb);

    // Campfires near village
    this.drawCampfire(705, 815);
    this.drawCampfire(245, 730);

    // Subtle map border
    const border = this.add.graphics();
    border.lineStyle(10, 0x0f172a, 0.35);
    border.strokeRect(5, 5, this.worldW - 10, this.worldH - 10);
  }

  drawCampfire(x, y) {
    this.add.ellipse(x, y + 12, 46, 16, 0x000000, 0.25);
    this.add.rectangle(x - 10, y + 8, 26, 7, 0x78350f).setRotation(0.4);
    this.add.rectangle(x + 10, y + 8, 26, 7, 0x78350f).setRotation(-0.4);
    this.add.circle(x, y, 16, 0xf97316, 0.85);
    this.add.circle(x, y - 7, 10, 0xfacc15, 0.9);
  }

  drawEnemyLaneMarkers() {
    if (!this.enemyLanes) return;

    this.enemyLanes.forEach((lane) => {
      const marker = this.add.graphics();
      marker.lineStyle(3, 0xfacc15, 0.18);
      marker.strokeCircle(lane.x, lane.y, 28);

      this.add.text(lane.x - 34, lane.y - 46, lane.name, {
        fontSize: "10px",
        color: "#facc15",
        fontFamily: "monospace",
        stroke: "#000000",
        strokeThickness: 2,
      }).setAlpha(0.5);
    });
  }

  createBeautifulMapExpansion() {
    // V0.20 map polish: bigger world with readable fantasy regions.
    // Pure visual upgrade. Does not change combat, save, shop, or quests.

    this.createMountainRegion();
    this.createSwampRegion();
    this.createLakeAndBridge();
    this.createRuinsArea();
    this.createFarmAndVillageHouses();
    this.createLongRoadNetwork();
    this.createExtraForestDepth();
    this.createAmbientDetails();
  }

  createMountainRegion() {
    // Northern mountain pass.
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(1500, 2320);
      const y = Phaser.Math.Between(40, 240);
      const w = Phaser.Math.Between(90, 180);
      const h = Phaser.Math.Between(90, 170);

      this.add.triangle(
        x,
        y,
        x - w / 2,
        y + h,
        x + w / 2,
        y + h,
        0x475569,
        0.95
      );

      this.add.triangle(
        x,
        y + 8,
        x - w / 5,
        y + h / 3,
        x + w / 5,
        y + h / 3,
        0xe5e7eb,
        0.85
      );
    }

    this.add.text(1760, 70, "Mountain Pass", {
      fontSize: "26px",
      color: "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });
  }

  createSwampRegion() {
    // South-east swamp.
    this.add.rectangle(1900, 1180, 760, 420, 0x064e3b, 0.72);
    this.add.text(1710, 1010, "Old Swamp", {
      fontSize: "26px",
      color: "#d1fae5",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });

    for (let i = 0; i < 42; i++) {
      const x = Phaser.Math.Between(1550, 2320);
      const y = Phaser.Math.Between(1020, 1430);

      this.add.ellipse(
        x,
        y,
        Phaser.Math.Between(44, 105),
        Phaser.Math.Between(16, 38),
        Phaser.Math.RND.pick([0x0f766e, 0x115e59, 0x134e4a]),
        0.45
      );

      if (i % 3 === 0) {
        this.add.circle(x + Phaser.Math.Between(-25, 25), y - 6, 4, 0xa7f3d0, 0.65);
      }
    }
  }

  createLakeAndBridge() {
    // Larger lake connected to the older river.
    this.add.ellipse(1180, 260, 520, 240, 0x1d4ed8, 0.58);
    this.add.ellipse(1180, 238, 420, 70, 0x93c5fd, 0.25);

    for (let i = 0; i < 20; i++) {
      this.add.ellipse(
        Phaser.Math.Between(950, 1410),
        Phaser.Math.Between(190, 330),
        Phaser.Math.Between(40, 100),
        Phaser.Math.Between(5, 12),
        0xbfdbfe,
        0.28
      );
    }

    // Wooden bridge.
    this.add.rectangle(1180, 382, 270, 42, 0x78350f, 0.92);
    for (let i = 0; i < 9; i++) {
      this.add.rectangle(1065 + i * 28, 382, 8, 48, 0x451a03, 0.9);
    }

    this.add.text(1080, 125, "Silver Lake", {
      fontSize: "24px",
      color: "#dbeafe",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });
  }

  createRuinsArea() {
    // Ancient ruins near the east forest.
    this.add.text(1840, 620, "Ancient Ruins", {
      fontSize: "25px",
      color: "#e5e7eb",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });

    for (let i = 0; i < 12; i++) {
      this.drawBrokenPillar(
        Phaser.Math.Between(1750, 2260),
        Phaser.Math.Between(680, 890)
      );
    }

    for (let i = 0; i < 22; i++) {
      this.drawRuinsStone(
        Phaser.Math.Between(1710, 2290),
        Phaser.Math.Between(650, 930)
      );
    }
  }

  drawBrokenPillar(x, y) {
    const h = Phaser.Math.Between(42, 95);
    this.add.rectangle(x, y, 26, h, 0x94a3b8, 0.95);
    this.add.rectangle(x, y - h / 2 - 8, 36, 12, 0xcbd5e1, 0.85);
    this.add.rectangle(x + 3, y, 5, h - 8, 0x64748b, 0.55);
    this.add.ellipse(x, y + h / 2 + 6, 44, 12, 0x000000, 0.18);
  }

  drawRuinsStone(x, y) {
    this.add.ellipse(x, y + 7, 36, 10, 0x000000, 0.15);
    this.add.rectangle(x, y, Phaser.Math.Between(18, 44), Phaser.Math.Between(10, 22), 0x94a3b8, 0.9);
  }

  createFarmAndVillageHouses() {
    // Farm fields below market.
    for (let i = 0; i < 6; i++) {
      const x = 310 + i * 105;
      this.add.rectangle(x, 1160, 85, 160, 0x854d0e, 0.7);

      for (let row = 0; row < 7; row++) {
        this.add.rectangle(x, 1090 + row * 22, 78, 3, 0xfacc15, 0.35);
      }
    }

    this.add.text(300, 1040, "Farmlands", {
      fontSize: "25px",
      color: "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 4,
    });

    this.drawHouse(700, 1080, 0x1d4ed8);
    this.drawHouse(820, 1145, 0xb91c1c);
    this.drawHouse(610, 1250, 0x15803d);
    this.drawHouse(910, 1280, 0x7c3aed);
  }

  drawHouse(x, y, roofColor) {
    this.add.ellipse(x, y + 48, 100, 24, 0x000000, 0.18);
    this.add.rectangle(x, y + 25, 78, 62, 0xfacc15, 0.8);
    this.add.triangle(x, y - 38, x - 55, y + 5, x + 55, y + 5, roofColor, 0.95);
    this.add.rectangle(x - 18, y + 38, 16, 36, 0x78350f);
    this.add.rectangle(x + 22, y + 25, 18, 18, 0x93c5fd, 0.9);
  }

  createLongRoadNetwork() {
    const road = this.add.graphics();
    road.fillStyle(0x7c4a18, 0.46);

    // Main road from castle to east map.
    road.fillRoundedRect(780, 510, 960, 74, 22);

    // Road to mountains.
    road.fillRoundedRect(1500, 245, 360, 60, 22);

    // Road to swamp.
    road.fillRoundedRect(1340, 850, 580, 65, 22);

    // Road to farms.
    road.fillRoundedRect(500, 880, 86, 380, 22);

    // Stone highlights.
    for (let i = 0; i < 75; i++) {
      this.add.ellipse(
        Phaser.Math.Between(760, 1760),
        Phaser.Math.Between(520, 575),
        Phaser.Math.Between(8, 20),
        Phaser.Math.Between(4, 9),
        0xa16207,
        0.28
      );
    }
  }

  createExtraForestDepth() {
    for (let i = 0; i < 95; i++) {
      this.drawPineTree(
        Phaser.Math.Between(1280, 2350),
        Phaser.Math.Between(300, 1020)
      );
    }

    for (let i = 0; i < 40; i++) {
      this.drawBush(
        Phaser.Math.Between(1120, 2300),
        Phaser.Math.Between(300, 1400)
      );
    }
  }

  drawPineTree(x, y) {
    this.add.ellipse(x, y + 32, 34, 12, 0x000000, 0.18);
    this.add.rectangle(x, y + 20, 9, 42, 0x78350f);
    this.add.triangle(x, y - 30, x - 32, y + 30, x + 32, y + 30, 0x065f46, 0.95);
    this.add.triangle(x, y - 55, x - 25, y, x + 25, y, 0x047857, 0.95);
    this.add.triangle(x, y - 76, x - 18, y - 28, x + 18, y - 28, 0x064e3b, 0.95);
  }

  drawBush(x, y) {
    this.add.ellipse(x, y + 10, 42, 12, 0x000000, 0.12);
    this.add.circle(x - 16, y, 16, 0x15803d, 0.85);
    this.add.circle(x, y - 6, 20, 0x16a34a, 0.85);
    this.add.circle(x + 18, y, 15, 0x166534, 0.85);
  }

  createAmbientDetails() {
    // Flowers, mushrooms, torches, fireflies.
    for (let i = 0; i < 240; i++) {
      const x = Phaser.Math.Between(70, this.worldW - 70);
      const y = Phaser.Math.Between(90, this.worldH - 70);

      this.add.circle(
        x,
        y,
        Phaser.Math.Between(2, 4),
        Phaser.Math.RND.pick([0xfacc15, 0xf472b6, 0xffffff, 0xa7f3d0, 0x93c5fd]),
        0.72
      );
    }

    for (let i = 0; i < 28; i++) {
      this.drawMushroom(
        Phaser.Math.Between(1250, 2300),
        Phaser.Math.Between(430, 1350)
      );
    }

    this.drawTorch(260, 515);
    this.drawTorch(260, 585);
    this.drawTorch(460, 830);
    this.drawTorch(700, 830);
    this.drawTorch(1165, 410);
    this.drawTorch(1195, 410);

    for (let i = 0; i < 30; i++) {
      const glow = this.add.circle(
        Phaser.Math.Between(1120, 2320),
        Phaser.Math.Between(340, 1250),
        3,
        0xfacc15,
        0.45
      );

      this.tweens.add({
        targets: glow,
        alpha: 0.08,
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(800, 1800),
      });
    }
  }

  drawMushroom(x, y) {
    this.add.rectangle(x, y + 7, 5, 12, 0xf8fafc, 0.9);
    this.add.ellipse(x, y, 18, 12, 0xef4444, 0.85);
    this.add.circle(x - 4, y - 2, 2, 0xffffff, 0.85);
    this.add.circle(x + 4, y, 2, 0xffffff, 0.85);
  }

  drawTorch(x, y) {
    this.add.rectangle(x, y + 15, 6, 34, 0x78350f);
    const flame = this.add.circle(x, y - 5, 12, 0xf97316, 0.85);
    const core = this.add.circle(x, y - 8, 7, 0xfacc15, 0.95);

    this.tweens.add({
      targets: [flame, core],
      scale: 1.18,
      alpha: 0.75,
      yoyo: true,
      repeat: -1,
      duration: 320,
    });
  }

  drawTree(x, y) {
    this.add.ellipse(x + 5, y + 18, 22, 10, 0x000000, 0.18);
    this.add.rectangle(x, y + 16, 9, 35, 0x78350f);
    this.add.circle(x, y, 24, 0x064e3b);
    this.add.circle(x - 13, y + 8, 18, 0x065f46);
    this.add.circle(x + 13, y + 8, 18, 0x047857);
  }

  drawRock(x, y) {
    this.add.ellipse(x, y + 8, 34, 12, 0x000000, 0.15);
    this.add.ellipse(x, y, 34, 22, 0x94a3b8);
    this.add.ellipse(x - 7, y - 3, 12, 7, 0xcbd5e1, 0.45);
  }

  drawStall(x, y, color) {
    this.add.rectangle(x, y + 18, 72, 50, 0x5b3410);
    this.add.triangle(x, y - 22, x - 48, y + 6, x + 48, y + 6, color);
    this.add.rectangle(x, y + 48, 84, 12, 0x3f250d);
  }

  createCastle() {
    this.castle = this.add.rectangle(120, 520, 170, 420, 0x94a3b8);
    this.physics.add.existing(this.castle, true);

    this.castleGatePoint = { x: 230, y: 520 };

    this.add.rectangle(120, 315, 190, 45, 0xcbd5e1);
    this.add.rectangle(60, 290, 45, 70, 0xcbd5e1);
    this.add.rectangle(180, 290, 45, 70, 0xcbd5e1);
    this.add.rectangle(205, 520, 32, 130, 0x78350f);
    this.add.rectangle(205, 520, 10, 100, 0x451a03);

    this.add.circle(this.castleGatePoint.x, this.castleGatePoint.y, 9, 0xfacc15, 0.85);
    this.add.text(this.castleGatePoint.x - 55, this.castleGatePoint.y + 74, "Repair point", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

    for (let i = 0; i < 6; i++) {
      this.add.rectangle(45 + i * 30, 310, 18, 30, 0x475569);
    }

    this.add.text(55, 260, "CASTLE", {
      fontSize: "24px",
      color: "#111827",
      fontStyle: "bold",
      fontFamily: "monospace",
    });
  }

  createPlayer() {
    this.player = this.add.container(520, 545);

    // V0.22 Player Knight model: clearer heroic silhouette.
    this.player.shadow = this.add.ellipse(0, 30, 52, 16, 0x000000, 0.34);

    // Cape behind body
    this.player.capeBack = this.add.rectangle(-15, 5, 24, 50, 0x1d4ed8, 0.9);
    this.player.capeBack.setAngle(-5);

    // Shield behind front arm
    this.player.shieldOuter = this.add.rectangle(-27, 3, 20, 36, 0x0f172a);
    this.player.shieldInner = this.add.rectangle(-27, 3, 15, 31, 0x2563eb);
    this.player.shieldGem = this.add.circle(-27, 0, 4, 0xfacc15);

    // Armor
    this.player.bodyOutline = this.add.rectangle(0, 0, 40, 50, 0x0f172a);
    this.player.bodyShape = this.add.rectangle(0, 0, 32, 42, 0xcbd5e1);
    this.player.chestPlate = this.add.rectangle(0, -6, 24, 25, 0xe5e7eb);
    this.player.blueTabard = this.add.rectangle(0, 12, 20, 22, 0x2563eb);
    this.player.goldEmblem = this.add.circle(0, -3, 4, 0xfacc15);

    // Shoulders and arms
    this.player.leftShoulder = this.add.circle(-18, -13, 9, 0x94a3b8);
    this.player.rightShoulder = this.add.circle(18, -13, 9, 0x94a3b8);
    this.player.leftBoot = this.add.rectangle(-8, 27, 9, 13, 0x334155);
    this.player.rightBoot = this.add.rectangle(8, 27, 9, 13, 0x334155);

    // Helmet
    this.player.headOutline = this.add.circle(0, -31, 19, 0x0f172a);
    this.player.helmet = this.add.circle(0, -31, 16, 0x94a3b8);
    this.player.helmetTop = this.add.rectangle(0, -45, 25, 5, 0xfacc15);
    this.player.eyeSlot = this.add.rectangle(2, -32, 18, 4, 0x020617);
    this.player.facePixel = this.add.rectangle(0, -23, 12, 5, 0xfde68a);

    // Sword
    this.player.swordBlade = this.add.rectangle(28, -3, 7, 42, 0xf8fafc);
    this.player.swordEdge = this.add.rectangle(31, -3, 2, 40, 0x93c5fd);
    this.player.swordGuard = this.add.rectangle(28, 18, 18, 5, 0xfacc15);
    this.player.swordHandle = this.add.rectangle(28, 26, 7, 13, 0x78350f);

    this.player.add([
      this.player.shadow,
      this.player.capeBack,
      this.player.shieldOuter,
      this.player.shieldInner,
      this.player.shieldGem,
      this.player.bodyOutline,
      this.player.bodyShape,
      this.player.chestPlate,
      this.player.blueTabard,
      this.player.goldEmblem,
      this.player.leftShoulder,
      this.player.rightShoulder,
      this.player.leftBoot,
      this.player.rightBoot,
      this.player.headOutline,
      this.player.helmet,
      this.player.helmetTop,
      this.player.eyeSlot,
      this.player.facePixel,
      this.player.swordBlade,
      this.player.swordEdge,
      this.player.swordGuard,
      this.player.swordHandle,
    ]);

    // Keep backward compatibility with existing attack/flash code.
    this.player.sword = this.player.swordBlade;

    this.physics.add.existing(this.player);
    this.player.body.setSize(34, 44);
    this.player.body.setOffset(-17, -22);
    this.player.body.setCollideWorldBounds(true);

    this.playerLabel = this.add.text(this.player.x - 43, this.player.y - 74, "Player Knight", {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    });
  }


  createNPCs() {
    this.npcs = [
      {
        name: "King",
        x: 260,
        y: 480,
        color: 0xfacc15,
        dialogue: "King: Defend the castle. Check quests with Q.",
      },
      {
        name: "Merchant",
        x: 330,
        y: 845,
        color: 0x22c55e,
        dialogue: "Merchant: Stand near me and press B for shop.",
      },
      {
        name: "Blacksmith",
        x: 500,
        y: 845,
        color: 0xf97316,
        dialogue: "Blacksmith: Stand near me and press B to upgrade sword.",
      },
    ];

    this.npcs.forEach((npc) => {
      this.add.ellipse(npc.x, npc.y + 22, 30, 10, 0x000000, 0.2);
      this.add.rectangle(npc.x, npc.y, 30, 40, npc.color);
      this.add.circle(npc.x, npc.y - 25, 13, 0xfde68a);

      this.add.text(npc.x - 34, npc.y - 52, npc.name, {
        fontSize: "13px",
        color: "#ffffff",
        fontFamily: "monospace",
      });
    });
  }

  createAllies() {
    this.allies = this.physics.add.group();

    this.spawnAlly("Player Knight", 250, 565);
    this.spawnAlly("Ally Knight", 315, 510);
    this.spawnAlly("Ally Archer", 170, 355);
    this.spawnAlly("Castle Archer", 85, 350);
    this.spawnAlly("Healer", 365, 600);
  }


  spawnAlly(type, x, y) {
    const config = {
      "Player Knight": {
        color: 0x2563eb,
        hp: 165,
        damage: 15,
        range: 95,
        speed: 78,
        role: "knight",
      },
      "Ally Knight": {
        color: 0x3b82f6,
        hp: 140,
        damage: 13,
        range: 92,
        speed: 72,
        role: "knight",
      },
      "Ally Archer": {
        color: 0x16a34a,
        hp: 95,
        damage: 13,
        range: 620,
        speed: 52,
        role: "archer",
      },
      "Castle Archer": {
        color: 0xf59e0b,
        hp: 120,
        damage: 16,
        range: 850,
        speed: 0,
        role: "castleArcher",
      },
      "Healer": {
        color: 0xf8fafc,
        hp: 120,
        damage: 0,
        range: 500,
        speed: 58,
        role: "healer",
      },
    }[type];

    const ally = this.add.container(x, y);

    ally.shadow = this.add.ellipse(0, 28, 46, 14, 0x000000, 0.28);
    ally.add([ally.shadow]);

    if (config.role === "knight") {
      // Ally Knight: compact frontline soldier.
      ally.cape = this.add.rectangle(-10, 6, 16, 38, 0x1e40af, 0.55);
      ally.bodyOutline = this.add.rectangle(0, 0, 36, 45, 0x0f172a);
      ally.armor = this.add.rectangle(0, 0, 30, 39, 0x94a3b8);
      ally.chest = this.add.rectangle(0, -4, 22, 23, 0xcbd5e1);
      ally.blueBand = this.add.rectangle(0, 13, 22, 9, 0x2563eb);
      ally.shoulderL = this.add.circle(-17, -12, 8, 0x64748b);
      ally.shoulderR = this.add.circle(17, -12, 8, 0x64748b);
      ally.bootL = this.add.rectangle(-7, 25, 8, 12, 0x334155);
      ally.bootR = this.add.rectangle(7, 25, 8, 12, 0x334155);
      ally.headOutline = this.add.circle(0, -27, 16, 0x0f172a);
      ally.helmet = this.add.circle(0, -27, 13, 0x64748b);
      ally.eye = this.add.rectangle(2, -28, 14, 3, 0x020617);
      ally.shield = this.add.rectangle(-24, 4, 13, 28, 0x78350f);
      ally.shieldRim = this.add.rectangle(-24, 4, 16, 31, 0xcbd5e1);
      ally.weapon = this.add.rectangle(23, 1, 7, 32, 0xe5e7eb);

      ally.add([
        ally.cape,
        ally.shieldRim,
        ally.shield,
        ally.bodyOutline,
        ally.armor,
        ally.chest,
        ally.blueBand,
        ally.shoulderL,
        ally.shoulderR,
        ally.bootL,
        ally.bootR,
        ally.headOutline,
        ally.helmet,
        ally.eye,
        ally.weapon,
      ]);
    }

    if (config.role === "archer") {
      // Ally Archer: readable bow + quiver silhouette.
      ally.bodyOutline = this.add.rectangle(0, 3, 34, 42, 0x0f172a);
      ally.leather = this.add.rectangle(0, 3, 28, 36, 0x92400e);
      ally.greenCloak = this.add.rectangle(-6, 5, 24, 39, 0x166534, 0.85);
      ally.belt = this.add.rectangle(0, 11, 30, 4, 0xfacc15);
      ally.bootL = this.add.rectangle(-7, 26, 7, 11, 0x451a03);
      ally.bootR = this.add.rectangle(7, 26, 7, 11, 0x451a03);
      ally.quiver = this.add.rectangle(-20, -2, 8, 31, 0x7c2d12);
      ally.arrowTips = this.add.rectangle(-20, -20, 12, 5, 0xe5e7eb);
      ally.headOutline = this.add.circle(0, -27, 17, 0x0f172a);
      ally.hood = this.add.circle(0, -27, 14, 0x15803d);
      ally.face = this.add.circle(3, -25, 8, 0xfde68a);
      ally.weapon = this.add.arc(25, 1, 26, 250, 110, false, 0x7c2d12);
      ally.arrow = this.add.rectangle(24, -2, 30, 2, 0xf8fafc);

      ally.add([
        ally.bodyOutline,
        ally.greenCloak,
        ally.leather,
        ally.belt,
        ally.bootL,
        ally.bootR,
        ally.quiver,
        ally.arrowTips,
        ally.headOutline,
        ally.hood,
        ally.face,
        ally.weapon,
        ally.arrow,
      ]);
    }

    if (config.role === "castleArcher") {
      // Castle Archer: tower-defense look, partly behind battlement.
      ally.wallShadow = this.add.ellipse(0, 25, 58, 13, 0x000000, 0.15);
      ally.wall = this.add.rectangle(0, 15, 54, 34, 0x94a3b8);
      ally.wallTop = this.add.rectangle(0, -4, 60, 14, 0xcbd5e1);
      ally.brick1 = this.add.rectangle(-15, 13, 20, 5, 0x64748b, 0.5);
      ally.brick2 = this.add.rectangle(16, 25, 22, 5, 0x64748b, 0.5);
      ally.headOutline = this.add.circle(0, -25, 15, 0x0f172a);
      ally.helmet = this.add.circle(0, -25, 12, 0x475569);
      ally.face = this.add.circle(3, -23, 8, 0xfde68a);
      ally.weapon = this.add.arc(25, -7, 24, 250, 110, false, 0x7c2d12);
      ally.arrow = this.add.rectangle(25, -9, 28, 2, 0xf8fafc);
      ally.flagPole = this.add.rectangle(-29, -28, 4, 36, 0x111827);
      ally.flag = this.add.triangle(-11, -33, -27, -43, -27, -23, 0x2563eb);

      ally.add([
        ally.wallShadow,
        ally.wall,
        ally.wallTop,
        ally.brick1,
        ally.brick2,
        ally.headOutline,
        ally.helmet,
        ally.face,
        ally.weapon,
        ally.arrow,
        ally.flagPole,
        ally.flag,
      ]);
    }

    if (config.role === "healer") {
      // Healer: robe + staff + glow, easy to identify as support.
      ally.robeOutline = this.add.rectangle(0, 5, 38, 48, 0x0f172a);
      ally.robe = this.add.rectangle(0, 5, 31, 43, 0xf8fafc);
      ally.robeShade = this.add.rectangle(-8, 6, 8, 38, 0xe5e7eb);
      ally.blueScarf = this.add.rectangle(0, -7, 27, 6, 0x2563eb);
      ally.goldBelt = this.add.rectangle(0, 11, 27, 4, 0xfacc15);
      ally.headOutline = this.add.circle(0, -28, 17, 0x0f172a);
      ally.hood = this.add.circle(0, -28, 14, 0xfef3c7);
      ally.face = this.add.circle(2, -26, 8, 0xfde68a);
      ally.weapon = this.add.rectangle(25, -2, 5, 52, 0x78350f);
      ally.staffTop = this.add.circle(25, -34, 11, 0x22c55e);
      ally.staffCore = this.add.circle(25, -34, 5, 0xf0fdf4);
      ally.glow = this.add.circle(25, -34, 20, 0x22c55e, 0.16);

      ally.add([
        ally.robeOutline,
        ally.robe,
        ally.robeShade,
        ally.blueScarf,
        ally.goldBelt,
        ally.headOutline,
        ally.hood,
        ally.face,
        ally.weapon,
        ally.glow,
        ally.staffTop,
        ally.staffCore,
      ]);
    }

    this.physics.add.existing(ally);
    ally.body.setSize(32, 40);
    ally.body.setOffset(-16, -20);
    ally.body.setCollideWorldBounds(true);

    ally.type = type;
    ally.role = config.role;
    ally.damage = config.damage;
    ally.range = config.range;
    ally.speed = config.speed;
    ally.maxHp = config.hp;
    ally.hp = ally.maxHp;

    ally.lastAttack = 0;
    ally.lastHeal = 0;
    ally.currentTarget = null;
    ally.nextTargetCheck = 0;
    ally.nextMoveDecision = 0;
    ally.homeX = x;
    ally.homeY = y;
    ally.wanderX = x;
    ally.wanderY = y;
    ally.nextWander = 0;

    ally.nameLabel = this.add.text(x - 42, y - 68, type, {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    });

    ally.hpBack = this.add.rectangle(x, y - 50, 50, 8, 0x7f1d1d);
    ally.hpBar = this.add.rectangle(x, y - 50, 48, 6, 0x22c55e);

    this.allies.add(ally);
  }


  createGroups() {
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.lootDrops = this.physics.add.group();
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      B: Phaser.Input.Keyboard.KeyCodes.B,
      I: Phaser.Input.Keyboard.KeyCodes.I,
      U: Phaser.Input.Keyboard.KeyCodes.U,
      R: Phaser.Input.Keyboard.KeyCodes.R,
      P: Phaser.Input.Keyboard.KeyCodes.P,
      L: Phaser.Input.Keyboard.KeyCodes.L,
      H: Phaser.Input.Keyboard.KeyCodes.H,
      F: Phaser.Input.Keyboard.KeyCodes.F,
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
      THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
      FOUR: Phaser.Input.Keyboard.KeyCodes.FOUR,
      FIVE: Phaser.Input.Keyboard.KeyCodes.FIVE,
      O: Phaser.Input.Keyboard.KeyCodes.O,
      N: Phaser.Input.Keyboard.KeyCodes.N,
      M: Phaser.Input.Keyboard.KeyCodes.M,
      ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
  }

  registerRestartKeys() {
    // These listeners work even after Game Over because they do not depend on update().
    this.input.keyboard.on("keydown-ENTER", () => {
      if (this.gameEnded) {
        this.restartGame();
      }
    });

    this.input.keyboard.on("keydown-R", () => {
      if (this.gameEnded) {
        this.restartGame();
      }
    });
  }

  createCamera() {
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1);
  }

  createCombat() {
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => {
      if (!projectile.active || !enemy.active) return;

      enemy.hp -= projectile.damage;
      this.showDamage(enemy.x, enemy.y, projectile.damage, "#ffffff");
      projectile.destroy();

      if (enemy.hp <= 0) {
        this.killEnemy(enemy);
      }
    });

    this.physics.add.overlap(this.enemyProjectiles, this.player, (player, projectile) => {
      if (!projectile.active) return;

      this.playerStats.hp -= projectile.damage;
      this.showDamage(this.player.x, this.player.y, projectile.damage, "#ef4444");
      projectile.destroy();

      if (this.playerStats.hp <= 0) {
        this.respawnPlayer();
      }
    });

    this.physics.add.overlap(this.enemyProjectiles, this.allies, (ally, projectile) => {
      if (!projectile.active || !ally.active) return;

      this.damageAlly(ally, projectile.damage);
      projectile.destroy();
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!enemy.active) return;
      this.damagePlayer(enemy);
    });

    this.physics.add.overlap(this.player, this.lootDrops, (player, loot) => {
      this.collectLoot(loot);
    });
  }

  createFixedUI() {
    this.goldText = this.add.text(20, 16, "", {
      fontSize: "16px",
      color: "#facc15",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 8, y: 4 },
    });

    this.castleHpText = this.add.text(20, 50, "", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 8, y: 4 },
    });

    this.saveInfoText = this.add.text(20, 84, "", {
      fontSize: "13px",
      color: "#cbd5e1",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 8, y: 4 },
    });

    this.messageText = this.add.text(170, 485, "", {
      fontSize: "15px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 12, y: 8 },
      wordWrap: { width: 660 },
    });

    this.helpPanel = this.add.text(785, 16, "", {
      fontSize: "10px",
      color: "#e5e7eb",
      fontFamily: "monospace",
      backgroundColor: "#020617",
      padding: { x: 8, y: 6 },
      lineSpacing: 2,
    });

    this.shopPanel = this.add.text(20, 120, "", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 10, y: 8 },
      lineSpacing: 5,
    });

    this.inventoryPanel = this.add.text(20, 250, "", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 10, y: 8 },
      lineSpacing: 5,
    });

    this.questPanel = this.add.text(360, 100, "", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 12, y: 10 },
      lineSpacing: 5,
    });

    this.upgradePanel = this.add.text(600, 110, "", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 12, y: 10 },
      lineSpacing: 5,
    });

    this.pausePanel = this.add.text(330, 170, "", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#020617",
      padding: { x: 24, y: 18 },
      align: "center",
      lineSpacing: 8,
    });

    this.minimap = this.add.graphics();

    for (const item of [
      this.goldText,
      this.castleHpText,
      this.saveInfoText,
      this.messageText,
      this.helpPanel,
      this.shopPanel,
      this.inventoryPanel,
      this.questPanel,
      this.upgradePanel,
      this.pausePanel,
      this.minimap,
    ]) {
      item.setScrollFactor(0);
      item.setDepth(9999);
    }

    this.shopPanel.setVisible(false);
    this.inventoryPanel.setVisible(false);
    this.questPanel.setVisible(false);
    this.upgradePanel.setVisible(false);
    this.pausePanel.setVisible(false);

    this.updateHelpPanel();
    this.updatePanels();
    this.updatePausePanel();
  }

  createMainMenu() {
    this.menuOverlay = this.add.rectangle(480, 270, 960, 540, 0x020617, 0.86);
    this.menuOverlay.setScrollFactor(0);
    this.menuOverlay.setDepth(20000);

    this.menuPanel = this.add.rectangle(480, 270, 620, 320, 0x111827, 0.96);
    this.menuPanel.setScrollFactor(0);
    this.menuPanel.setDepth(20001);

    this.menuTitle = this.add.text(480, 165, "KINGDOM FRONTIER 2D", {
      fontSize: "34px",
      color: "#facc15",
      fontFamily: "monospace",
      fontStyle: "bold",
      align: "center",
    });
    this.menuTitle.setOrigin(0.5);
    this.menuTitle.setScrollFactor(0);
    this.menuTitle.setDepth(20002);

    this.menuText = this.add.text(480, 280, "", {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "monospace",
      align: "center",
      lineSpacing: 10,
    });
    this.menuText.setOrigin(0.5);
    this.menuText.setScrollFactor(0);
    this.menuText.setDepth(20002);

    this.updateMainMenuText();
  }

  updateMainMenuText() {
    if (!this.menuText) return;

    this.menuText.setText(
      [
        "N  New Game",
        "L  Load Game",
        `M  Sound: ${this.soundEnabled ? "ON" : "OFF"}`,
        "",
        "Goal: defend the castle and survive waves.",
      ].join("\n")
    );
  }

  hideMainMenu() {
    this.mainMenuOpen = false;

    for (const item of [
      this.menuOverlay,
      this.menuPanel,
      this.menuTitle,
      this.menuText,
    ]) {
      if (item) item.setVisible(false);
    }

    this.isPaused = false;
    this.physics.world.resume();
    this.showMessage("Game started. Press H for controls.");
  }

  handleWaveClearUpgradeCards(time) {
    if (!this.waveActive || this.upgradeCardOpen || this.gameEnded || this.mainMenuOpen) return;
    if (!this.enemies || this.enemies.countActive(true) > 0) return;

    this.waveActive = false;
    this.upgradeCardOpen = true;
    this.waveCooldown = true;

    this.showWaveUpgradeCards();
  }

  showWaveUpgradeCards() {
    const pool = [
      {
        title: "Knight Vanguard",
        desc: "All knights: +4 damage, +25 HP",
        rarity: "COMMON",
        apply: () => {
          this.allies.children.iterate((ally) => {
            if (!ally || !ally.active) return;
            if (ally.role === "knight") {
              ally.damage += 4;
              ally.maxHp += 25;
              ally.hp = Math.min(ally.maxHp, ally.hp + 25);
            }
          });
        },
      },
      {
        title: "Archer Volley",
        desc: "Archers: +4 damage, +160 range",
        rarity: "COMMON",
        apply: () => {
          this.allies.children.iterate((ally) => {
            if (!ally || !ally.active) return;
            if (ally.role === "archer" || ally.role === "castleArcher") {
              ally.damage += 4;
              ally.range += 160;
            }
          });

          this.applyCastleArcherVisualUpgrade();
        },
      },
      {
        title: "Healer Blessing",
        desc: "Healer: faster movement, stronger healing",
        rarity: "COMMON",
        apply: () => {
          this.allies.children.iterate((ally) => {
            if (!ally || !ally.active) return;
            if (ally.role === "healer") {
              ally.speed += 10;
              ally.maxHp += 30;
              ally.hp = ally.maxHp;
            }
          });

          this.playerStats.maxHp += 10;
          this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 25);
        },
      },
      {
        title: "Castle Guard",
        desc: "Castle: +120 HP and repair 120",
        rarity: "COMMON",
        apply: () => {
          this.maxCastleHealth += 120;
          this.castleHealth = Math.min(this.maxCastleHealth, this.castleHealth + 120);
          this.updateCastleDamageVisuals?.();
        },
      },
      {
        title: "Hero Training",
        desc: "Player: +6 damage, +20 max HP",
        rarity: "COMMON",
        apply: () => {
          this.playerStats.damage += 6;
          this.playerStats.maxHp += 20;
          this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 20);
        },
      },
      {
        title: "Battle Supplies",
        desc: "+90 gold and +2 potions",
        rarity: "COMMON",
        apply: () => {
          this.playerStats.gold += 90;
          this.playerStats.potions += 2;
        },
      },
      {
        title: "Tower Mastery",
        desc: "Castle Archer: stronger tower and faster shots",
        rarity: "RARE",
        apply: () => {
          this.allies.children.iterate((ally) => {
            if (!ally || !ally.active) return;
            if (ally.role === "castleArcher") {
              ally.damage += 8;
              ally.range += 220;
              ally.maxHp += 40;
              ally.hp = ally.maxHp;
            }
          });

          this.playerStats.castleArcherLevel = (this.playerStats.castleArcherLevel || 1) + 1;
          this.applyCastleArcherVisualUpgrade();
        },
      },
    ];

    this.currentUpgradeCards = Phaser.Utils.Array.Shuffle([...pool]).slice(0, 3);

    this.upgradeCardObjects = [];

    const overlay = this.add.rectangle(480, 270, 960, 540, 0x020617, 0.78);
    overlay.setScrollFactor(0);
    overlay.setDepth(30000);

    const title = this.add.text(480, 100, `Wave ${this.wave} cleared. Choose one upgrade`, {
      fontSize: "24px",
      color: "#facc15",
      fontFamily: "monospace",
      fontStyle: "bold",
      align: "center",
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(30001);

    this.upgradeCardObjects.push(overlay, title);

    this.currentUpgradeCards.forEach((card, index) => {
      const x = 245 + index * 235;

      const panel = this.add.rectangle(x, 285, 205, 235, 0x111827, 0.97);
      panel.setStrokeStyle(3, card.rarity === "RARE" ? 0xfacc15 : 0x93c5fd, 0.9);
      panel.setScrollFactor(0);
      panel.setDepth(30001);
      panel.setInteractive({ useHandCursor: true });

      const cardText = this.add.text(x, 285, [
        `${index + 1}`,
        card.rarity,
        "",
        card.title,
        "",
        card.desc,
        "",
        "Click or press key",
      ].join("\n"), {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: "monospace",
        align: "center",
        lineSpacing: 5,
        wordWrap: { width: 175 },
      });
      cardText.setOrigin(0.5);
      cardText.setScrollFactor(0);
      cardText.setDepth(30002);

      panel.on("pointerover", () => {
        panel.setFillStyle(0x1e293b, 0.98);
        panel.setScale(1.04);
      });

      panel.on("pointerout", () => {
        panel.setFillStyle(0x111827, 0.97);
        panel.setScale(1);
      });

      panel.on("pointerdown", () => {
        this.chooseWaveUpgrade(index);
      });

      cardText.setInteractive({ useHandCursor: true });
      cardText.on("pointerdown", () => {
        this.chooseWaveUpgrade(index);
      });

      this.upgradeCardObjects.push(panel, cardText);
    });

    const help = this.add.text(480, 445, "Click a card or press 1, 2, or 3", {
      fontSize: "16px",
      color: "#93c5fd",
      fontFamily: "monospace",
      align: "center",
    });
    help.setOrigin(0.5);
    help.setScrollFactor(0);
    help.setDepth(30002);

    this.upgradeCardObjects.push(help);
  }


  chooseWaveUpgrade(index) {
    if (!this.upgradeCardOpen) return;

    const card = this.currentUpgradeCards[index];
    if (!card) return;

    card.apply();

    this.showMessage(`Upgrade chosen: ${card.title}`);
    this.playSound?.("upgrade");

    if (this.upgradeCardObjects) {
      this.upgradeCardObjects.forEach((obj) => {
        if (obj && obj.destroy) obj.destroy();
      });
    }

    this.upgradeCardObjects = [];
    this.currentUpgradeCards = [];
    this.upgradeCardOpen = false;

    this.wave += 1;
    this.updateQuestProgress?.("survive3", this.wave);
    this.updateUI?.();

    this.showWavePreview();

    this.time.delayedCall(1900, () => {
      this.hideWavePreview();
      this.waveCooldown = false;
      this.spawnWave();
    });
  }

  showWavePreview() {
    this.hideWavePreview();

    const nextWave = this.wave;
    const isBossWave = nextWave % 5 === 0;

    const enemies = isBossWave
      ? ["Troll Boss", "Orc Warrior", "Orc Archer"]
      : nextWave >= 4
        ? ["Goblin", "Orc Warrior", "Orc Archer", "Armored Orc"]
        : ["Goblin", "Orc Warrior", "Orc Archer"];

    this.wavePreviewObjects = [];

    const panel = this.add.rectangle(480, 92, 560, 96, 0x111827, 0.94);
    panel.setScrollFactor(0);
    panel.setDepth(31000);

    const text = this.add.text(480, 92, [
      `NEXT WAVE ${nextWave}`,
      isBossWave ? "Boss wave incoming" : "Enemy types incoming",
      enemies.join("  |  "),
    ].join("\n"), {
      fontSize: "16px",
      color: isBossWave ? "#f87171" : "#facc15",
      fontFamily: "monospace",
      align: "center",
      lineSpacing: 5,
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(31001);

    this.wavePreviewObjects.push(panel, text);
    this.playSound?.(isBossWave ? "boss" : "wave");
  }

  hideWavePreview() {
    if (!this.wavePreviewObjects) return;

    this.wavePreviewObjects.forEach((obj) => {
      if (obj && obj.destroy) obj.destroy();
    });

    this.wavePreviewObjects = [];
  }

  applyCastleArcherVisualUpgrade() {
    const level = this.playerStats.castleArcherLevel || 1;

    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;
      if (ally.role !== "castleArcher") return;

      const gold = 0xfacc15;
      const blue = 0x2563eb;

      if (ally.wallTop) {
        ally.wallTop.setFillStyle(level >= 3 ? gold : 0xcbd5e1);
      }

      if (ally.wall) {
        ally.wall.setFillStyle(level >= 2 ? 0x64748b : 0x94a3b8);
      }

      if (ally.flag) {
        ally.flag.setFillStyle(level >= 2 ? gold : blue);
      }

      if (!ally.upgradeStar) {
        ally.upgradeStar = this.add.star(0, -48, 5, 5, 11, gold, 0.95);
        ally.add(ally.upgradeStar);
      }

      ally.upgradeStar.setVisible(level >= 2);
      ally.upgradeStar.setScale(level >= 4 ? 1.35 : 1);
    });
  }


  spawnWave() {
    if (this.upgradeCardOpen) return;
    if (this.waveCooldown) return;

    this.waveCooldown = true;

    let countDown = 3;
    this.showMessage(`Next wave in ${countDown}...`);

    const countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        countDown -= 1;

        if (countDown > 0) {
          this.showMessage(`Next wave in ${countDown}...`);
          this.playSound("tick");
          return;
        }

        countdownEvent.remove(false);
        this.startWaveNow();
      },
    });
  }

  startWaveNow() {
    this.waveActive = true;
    const isBossWave = this.wave % 5 === 0;
    const count = isBossWave ? 8 + this.wave : 5 + this.wave * 2;

    for (let i = 0; i < count; i++) {
      const { x, y, lane } = this.getSpawnPoint();
      this.spawnEnemy(x, y, false, lane);
    }

    if (isBossWave) {
      const bossSpawn = this.getSpawnPoint();
      this.spawnEnemy(bossSpawn.x, bossSpawn.y, true, bossSpawn.lane);
      this.showMessage(`Boss wave ${this.wave}. Boss Orc has appeared.`);
      this.playSound("boss");
    } else {
      this.showMessage(`Wave ${this.wave} started.`);
      this.playSound("wave");
    }

    this.waveCooldown = false;
  }

  getSpawnPoint() {
    const lane = Phaser.Math.RND.pick(this.enemyLanes ?? []);

    if (lane.name === "north road" || lane.name === "mountain pass") {
      return {
        x: Phaser.Math.Between(1850, 2350),
        y: Phaser.Math.Between(90, 260),
        lane,
      };
    }

    if (lane.name === "main road") {
      return {
        x: Phaser.Math.Between(1900, 2350),
        y: Phaser.Math.Between(480, 610),
        lane,
      };
    }

    if (lane.name === "south road" || lane.name === "swamp trail") {
      return {
        x: Phaser.Math.Between(1700, 2350),
        y: Phaser.Math.Between(920, 1370),
        lane,
      };
    }

    return {
      x: Phaser.Math.Between(1950, 2350),
      y: Phaser.Math.Between(320, 560),
      lane,
    };
  }


  spawnEnemy(x, y, isBoss = false, lane = null) {
    const availableTypes = this.wave >= 4
      ? ["Goblin", "Orc Warrior", "Orc Archer", "Armored Orc"]
      : ["Goblin", "Orc Warrior", "Orc Archer"];

    const enemyType = isBoss ? "Troll Boss" : Phaser.Math.RND.pick(availableTypes);

    const enemy = this.add.container(x, y);
    enemy.shadow = this.add.ellipse(0, 30, 48, 16, 0x000000, 0.36);

    const stats = this.getEnemyStats(enemyType);

    enemy.add([enemy.shadow]);

    if (enemyType === "Goblin") {
      // Goblin: small, hunched, pointy ears.
      enemy.earL = this.add.triangle(-16, -25, -33, -33, -18, -15, 0x365314);
      enemy.earR = this.add.triangle(16, -25, 33, -33, 18, -15, 0x365314);
      enemy.bodyOutline = this.add.rectangle(0, 5, 34, 36, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 5, 28, 30, 0x84cc16);
      enemy.hunch = this.add.rectangle(-4, -2, 25, 15, 0x65a30d);
      enemy.headOutline = this.add.circle(0, -24, 19, 0x0f172a);
      enemy.head = this.add.circle(0, -24, 16, 0x65a30d);
      enemy.eyeL = this.add.circle(-6, -27, 2, 0xfacc15);
      enemy.eyeR = this.add.circle(6, -27, 2, 0xfacc15);
      enemy.mouth = this.add.rectangle(0, -17, 10, 2, 0x111827);
      enemy.weapon = this.add.rectangle(21, 7, 5, 24, 0x9ca3af);
      enemy.rag = this.add.rectangle(0, 18, 21, 7, 0x78350f);

      enemy.add([
        enemy.earL,
        enemy.earR,
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.hunch,
        enemy.rag,
        enemy.headOutline,
        enemy.head,
        enemy.eyeL,
        enemy.eyeR,
        enemy.mouth,
        enemy.weapon,
      ]);
    }

    if (enemyType === "Orc Warrior") {
      // Orc Warrior: strong melee enemy, red cloth and large weapon.
      enemy.bodyOutline = this.add.rectangle(0, 2, 46, 52, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 2, 38, 44, 0x166534);
      enemy.armor = this.add.rectangle(0, 1, 34, 26, 0x78350f);
      enemy.armorPlate = this.add.rectangle(0, -5, 25, 14, 0x64748b);
      enemy.redCloth = this.add.rectangle(0, 20, 30, 7, 0xb91c1c);
      enemy.shoulderL = this.add.circle(-21, -11, 10, 0x451a03);
      enemy.shoulderR = this.add.circle(21, -11, 10, 0x451a03);
      enemy.headOutline = this.add.circle(0, -32, 20, 0x0f172a);
      enemy.head = this.add.circle(0, -32, 16, 0x365314);
      enemy.brow = this.add.rectangle(0, -37, 22, 5, 0x111827);
      enemy.tuskL = this.add.rectangle(-8, -20, 4, 8, 0xf8fafc);
      enemy.tuskR = this.add.rectangle(8, -20, 4, 8, 0xf8fafc);
      enemy.weapon = this.add.rectangle(29, 0, 10, 42, 0xcbd5e1);
      enemy.weaponHead = this.add.rectangle(29, -24, 22, 12, 0x9ca3af);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.armor,
        enemy.armorPlate,
        enemy.redCloth,
        enemy.shoulderL,
        enemy.shoulderR,
        enemy.headOutline,
        enemy.head,
        enemy.brow,
        enemy.tuskL,
        enemy.tuskR,
        enemy.weapon,
        enemy.weaponHead,
      ]);
    }

    if (enemyType === "Orc Archer") {
      // Orc Archer: hunched ranged enemy, crude bow and quiver.
      enemy.bodyOutline = this.add.rectangle(0, 3, 38, 45, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 3, 32, 39, 0x7c2d12);
      enemy.leather = this.add.rectangle(0, 5, 28, 25, 0x92400e);
      enemy.redBand = this.add.rectangle(0, 17, 27, 5, 0xb91c1c);
      enemy.quiver = this.add.rectangle(-19, 0, 8, 32, 0x451a03);
      enemy.arrowTips = this.add.rectangle(-19, -20, 13, 5, 0x111827);
      enemy.headOutline = this.add.circle(0, -29, 17, 0x0f172a);
      enemy.head = this.add.circle(0, -29, 14, 0x365314);
      enemy.eye = this.add.rectangle(3, -31, 12, 3, 0xef4444);
      enemy.tusk = this.add.rectangle(7, -18, 4, 6, 0xf8fafc);
      enemy.weapon = this.add.arc(26, 0, 27, 250, 110, false, 0x451a03);
      enemy.arrow = this.add.rectangle(26, -3, 31, 3, 0x111827);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.leather,
        enemy.redBand,
        enemy.quiver,
        enemy.arrowTips,
        enemy.headOutline,
        enemy.head,
        enemy.eye,
        enemy.tusk,
        enemy.weapon,
        enemy.arrow,
      ]);
    }

    if (enemyType === "Armored Orc") {
      // Armored Orc: tank silhouette, shield, helmet, heavy blade.
      enemy.bodyOutline = this.add.rectangle(0, 4, 56, 62, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 4, 48, 55, 0x64748b);
      enemy.armorHighlight = this.add.rectangle(0, -8, 38, 21, 0x94a3b8);
      enemy.rust1 = this.add.rectangle(-11, 3, 7, 20, 0x92400e, 0.7);
      enemy.rust2 = this.add.rectangle(12, 12, 8, 17, 0x92400e, 0.6);
      enemy.headOutline = this.add.circle(0, -39, 21, 0x0f172a);
      enemy.helmet = this.add.circle(0, -39, 17, 0x475569);
      enemy.spikeL = this.add.triangle(-16, -50, -27, -61, -12, -54, 0xcbd5e1);
      enemy.spikeR = this.add.triangle(16, -50, 27, -61, 12, -54, 0xcbd5e1);
      enemy.jaw = this.add.rectangle(0, -25, 22, 9, 0x365314);
      enemy.eye = this.add.rectangle(2, -41, 16, 3, 0xef4444);
      enemy.shield = this.add.rectangle(-31, 5, 16, 40, 0x334155);
      enemy.shieldMark = this.add.rectangle(-31, 5, 7, 30, 0x94a3b8);
      enemy.weapon = this.add.rectangle(34, 3, 11, 48, 0xe5e7eb);
      enemy.weaponHead = this.add.rectangle(34, -24, 20, 15, 0xcbd5e1);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.armorHighlight,
        enemy.rust1,
        enemy.rust2,
        enemy.headOutline,
        enemy.helmet,
        enemy.spikeL,
        enemy.spikeR,
        enemy.jaw,
        enemy.eye,
        enemy.shield,
        enemy.shieldMark,
        enemy.weapon,
        enemy.weaponHead,
      ]);
    }

    if (enemyType === "Troll Boss") {
      // Troll Boss: huge, readable, dangerous.
      enemy.bodyOutline = this.add.rectangle(0, 8, 86, 98, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 8, 76, 88, 0x166534);
      enemy.belly = this.add.ellipse(0, 21, 54, 48, 0x14532d);
      enemy.backSpikes1 = this.add.triangle(-30, -20, -48, -32, -31, -3, 0x64748b);
      enemy.backSpikes2 = this.add.triangle(-35, 6, -56, -3, -36, 25, 0x64748b);
      enemy.headOutline = this.add.circle(0, -52, 34, 0x0f172a);
      enemy.head = this.add.circle(0, -52, 29, 0x365314);
      enemy.brow = this.add.rectangle(0, -63, 42, 7, 0x111827);
      enemy.eyeL = this.add.circle(-11, -54, 4, 0xef4444);
      enemy.eyeR = this.add.circle(11, -54, 4, 0xef4444);
      enemy.nose = this.add.rectangle(0, -45, 9, 11, 0x14532d);
      enemy.tuskL = this.add.rectangle(-11, -32, 5, 13, 0xf8fafc);
      enemy.tuskR = this.add.rectangle(11, -32, 5, 13, 0xf8fafc);
      enemy.chain = this.add.rectangle(0, -11, 56, 6, 0x64748b);
      enemy.club = this.add.rectangle(47, 3, 17, 70, 0x78350f);
      enemy.clubHead = this.add.rectangle(47, -37, 32, 26, 0x451a03);
      enemy.clubSpike1 = this.add.circle(35, -43, 3, 0xe5e7eb);
      enemy.clubSpike2 = this.add.circle(58, -43, 3, 0xe5e7eb);

      enemy.add([
        enemy.backSpikes1,
        enemy.backSpikes2,
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.belly,
        enemy.headOutline,
        enemy.head,
        enemy.brow,
        enemy.eyeL,
        enemy.eyeR,
        enemy.nose,
        enemy.tuskL,
        enemy.tuskR,
        enemy.chain,
        enemy.club,
        enemy.clubHead,
        enemy.clubSpike1,
        enemy.clubSpike2,
      ]);
    }

    this.physics.add.existing(enemy);
    enemy.body.setSize(stats.sizeW, stats.sizeH);
    enemy.body.setOffset(-stats.sizeW / 2, -stats.sizeH / 2);

    enemy.enemyType = enemyType;
    enemy.hp = stats.hp;
    enemy.maxHp = stats.hp;
    enemy.speed = stats.speed;
    enemy.damage = stats.damage;
    enemy.gold = stats.gold;
    enemy.isRanged = stats.isRanged;
    enemy.isBoss = isBoss;

    enemy.lastAttack = 0;
    enemy.nextBossStomp = 0;
    enemy.nextBossSummon = 0;
    enemy.currentTargetKind = "castle";
    enemy.currentTargetRef = null;
    enemy.nextTargetCheck = 0;
    enemy.nextMoveDecision = 0;
    enemy.nextWander = 0;
    enemy.wanderX = 0;
    enemy.wanderY = 0;
    enemy.lane = lane ?? Phaser.Math.RND.pick(this.enemyLanes ?? []);
    enemy.laneReached = false;
    enemy.castleAttackPoint = Phaser.Math.RND.pick(this.castleAttackPoints ?? [this.castleGatePoint]);

    enemy.nameLabel = this.add.text(enemy.x - 45, enemy.y - 76, enemyType, {
      fontSize: enemy.isBoss ? "13px" : "10px",
      color: enemy.isBoss ? "#facc15" : "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    });

    enemy.hpBack = this.add.rectangle(enemy.x, enemy.y - 58, 56, 8, 0x7f1d1d);
    enemy.hpBar = this.add.rectangle(enemy.x, enemy.y - 58, 54, 6, 0x22c55e);

    this.enemies.add(enemy);
  }


  getEnemyStats(type) {
    const base = {
      Goblin: {
        color: 0x84cc16,
        headColor: 0x365314,
        hp: 90 + this.wave * 16,
        speed: 48 + this.wave * 2,
        damage: 13 + this.wave * 2,
        gold: 6,
        sizeW: 30,
        sizeH: 34,
        headSize: 12,
        isRanged: false,
      },
      "Orc Warrior": {
        color: 0xef4444,
        headColor: 0x7f1d1d,
        hp: 145 + this.wave * 24,
        speed: 30 + this.wave * 2,
        damage: 19 + this.wave * 2,
        gold: 10,
        sizeW: 34,
        sizeH: 40,
        headSize: 14,
        isRanged: false,
      },
      "Orc Archer": {
        color: 0xf97316,
        headColor: 0x7c2d12,
        hp: 105 + this.wave * 18,
        speed: 32 + this.wave,
        damage: 16 + this.wave * 2,
        gold: 13,
        sizeW: 30,
        sizeH: 38,
        headSize: 13,
        isRanged: true,
      },
      "Armored Orc": {
        color: 0x64748b,
        headColor: 0x1f2937,
        hp: 230 + this.wave * 34,
        speed: 22 + this.wave,
        damage: 24 + this.wave * 2,
        gold: 20,
        sizeW: 40,
        sizeH: 46,
        headSize: 16,
        isRanged: false,
      },
      "Troll Boss": {
        color: 0x166534,
        headColor: 0x052e16,
        hp: 850 + this.wave * 110,
        speed: 20 + this.wave,
        damage: 36 + this.wave * 3,
        gold: 160,
        sizeW: 70,
        sizeH: 84,
        headSize: 26,
        isRanged: false,
      },
    };

    return base[type];
  }


  update(time) {
    if (this.gameEnded) {
      return;
    }

    if (this.mainMenuOpen) {
      this.handleMainMenuHotkeys();
      return;
    }

    this.handleHotkeys(time);

    if (this.isPaused) {
      return;
    }

    this.movePlayer();
    this.regeneratePlayerStamina();
    this.updatePlayerAutoAttack(time);
    this.updateEnemies(time);
    this.updateAllies(time);
    this.handleWaveClearUpgradeCards(time);
    this.resolveUnitOverlap();
    this.updateUnitWalkBob(time);
    this.updateLabels();
    this.updateCleanUnitLabels();
    this.updateUI();
    this.updateMinimap();

    if (!this.waveCooldown && this.enemies.countActive(true) === 0) {
      this.wave += 1;
      this.updateQuestProgress("survive3", this.wave);
      this.showMessage(`Wave ${this.wave - 1} cleared. Wave ${this.wave} starts soon.`);
      this.spawnWave();
    }
  }

  handleMainMenuHotkeys() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.N)) {
      this.playSound("wave");
      this.hideMainMenu();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
      this.loadGame();
      this.hideMainMenu();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.M)) {
      this.soundEnabled = !this.soundEnabled;
      this.updateMainMenuText();
      this.showMessage(`Sound ${this.soundEnabled ? "enabled" : "disabled"}.`);
    }
  }

  handleHotkeys(time) {
    if (this.upgradeCardOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.chooseWaveUpgrade(0);
      if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.chooseWaveUpgrade(1);
      if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) this.chooseWaveUpgrade(2);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      this.toggleFormationMode();
    }


    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.togglePause();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
      this.helpVisible = !this.helpVisible;
      this.updateHelpPanel();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.M)) {
      this.soundEnabled = !this.soundEnabled;
      this.showMessage(`Sound ${this.soundEnabled ? "ON" : "OFF"}.`);
      this.updateHelpPanel();
    }

    if (this.isPaused) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.P)) this.saveGame();
      if (Phaser.Input.Keyboard.JustDown(this.keys.L)) this.loadGame();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.playerSpecialAttack(time);
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.talkToNPC();
    if (Phaser.Input.Keyboard.JustDown(this.keys.U)) this.usePotion();
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.repairCastle();
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) this.saveGame();
    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) this.loadGame();

    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
      this.questOpen = !this.questOpen;
      this.updatePanels();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.O)) {
      this.upgradeOpen = !this.upgradeOpen;
      this.updatePanels();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.B)) {
      if (!this.shopOpen && !this.isNearShopNPC()) {
        this.showMessage("Stand near Merchant or Blacksmith to open shop.");
        return;
      }

      this.shopOpen = !this.shopOpen;
      this.showMessage(this.shopOpen ? "Shop opened. Press 1, 2, or 3." : "Shop closed.");
      this.updatePanels();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
      this.inventoryOpen = !this.inventoryOpen;
      this.updatePanels();
    }

    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.buyPotion();
    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.upgradeSword();
    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.THREE)) this.repairCastle();
    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.FOUR)) this.sellAllLoot();

    if (this.upgradeOpen && !this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.buyUpgrade("hp");
    if (this.upgradeOpen && !this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.buyUpgrade("damage");
    if (this.upgradeOpen && !this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.THREE)) this.buyUpgrade("castle");
    if (this.upgradeOpen && !this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.FOUR)) this.buyUpgrade("allies");
    if (this.upgradeOpen && !this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.FIVE)) this.buyUpgrade("tower");
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.world.pause();
      this.showMessage("Paused. Press ESC to resume. P save, L load.");
    } else {
      this.physics.world.resume();
      this.showMessage("Resumed.");
    }

    this.updatePausePanel();
  }

  movePlayer() {
    const baseSpeed = 185;
    const sprinting = this.keys.SHIFT.isDown && this.playerStats.stamina > 0;
    const speed = sprinting ? 255 : baseSpeed;

    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown || this.keys.A.isDown) this.player.body.setVelocityX(-speed);
    if (this.cursors.right.isDown || this.keys.D.isDown) this.player.body.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown) this.player.body.setVelocityY(-speed);
    if (this.cursors.down.isDown || this.keys.S.isDown) this.player.body.setVelocityY(speed);

    this.player.body.velocity.normalize().scale(speed);

    if (sprinting && this.player.body.velocity.length() > 0) {
      this.playerStats.stamina = Math.max(0, this.playerStats.stamina - 0.25);
    } else {
      this.playerStats.stamina = Math.min(this.playerStats.maxStamina, this.playerStats.stamina + 0.12);
    }
  }

  updateEnemies(time) {
    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      if (time > enemy.nextTargetCheck) {
        this.chooseEnemyTarget(enemy);
        enemy.nextTargetCheck = time + 450;
      }

      const target = this.resolveEnemyTarget(enemy);

      if (!target) {
        enemy.body.setVelocity(0);
        return;
      }

      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);

      if (enemy.isRanged) {
        this.updateRangedEnemy(enemy, target.x, target.y, time);
      } else {
        this.updateMeleeEnemy(enemy, target.x, target.y, time, target.kind, dist);
      }

      this.updateEnemyHealthBar(enemy);
    });
  }

  chooseEnemyTarget(enemy) {
    const playerDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const castleDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.castleGatePoint.x, this.castleGatePoint.y);
    const nearestAlly = this.getNearestAlly(enemy);

    if (nearestAlly && nearestAlly.distance < 150) {
      enemy.currentTargetKind = "ally";
      enemy.currentTargetRef = nearestAlly.ally;
      return;
    }

    if (playerDist < 165) {
      enemy.currentTargetKind = "player";
      enemy.currentTargetRef = this.player;
      return;
    }

    if (castleDist < 360) {
      enemy.currentTargetKind = "castle";
      enemy.currentTargetRef = null;
      return;
    }

    enemy.currentTargetKind = "castle";
    enemy.currentTargetRef = null;
  }


  resolveEnemyTarget(enemy) {
    if (enemy.currentTargetKind === "player") {
      return {
        kind: "player",
        x: this.player.x,
        y: this.player.y,
      };
    }

    if (enemy.currentTargetKind === "ally" && enemy.currentTargetRef && enemy.currentTargetRef.active) {
      return {
        kind: "ally",
        x: enemy.currentTargetRef.x,
        y: enemy.currentTargetRef.y,
      };
    }

    // Castle attackers first move to their assigned lane waypoint.
    // After reaching it, they move to a specific castle gate attack point.
    if (!enemy.laneReached && enemy.lane) {
      const laneDistance = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.lane.x, enemy.lane.y);

      if (laneDistance > 55) {
        return {
          kind: "lane",
          x: enemy.lane.x,
          y: enemy.lane.y,
        };
      }

      enemy.laneReached = true;
    }

    const attackPoint = enemy.castleAttackPoint ?? this.castleGatePoint;

    return {
      kind: "castle",
      x: attackPoint.x,
      y: attackPoint.y,
    };
  }


  updateMeleeEnemy(enemy, targetX, targetY, time, targetKind = "castle", distance = null) {
    const dist = distance ?? Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

    const attackDistance = targetKind === "castle" ? 96 : targetKind === "lane" ? 28 : 58;

    if (enemy.isBoss) {
      this.updateBossSpecials(enemy, time);
    }

    // Enemy locks in when close enough. No more walking away while attacking.
    if (dist <= attackDistance) {
      enemy.body.setVelocity(0);

      if (targetKind === "lane") {
        enemy.laneReached = true;
        return;
      }

      if (targetKind === "castle" && time - enemy.lastAttack > 650) {
        enemy.lastAttack = time;
        this.applyCastleDamage(enemy.isBoss ? enemy.damage * 1.1 : enemy.damage * 0.7);
      }

      if (targetKind === "player" && time - enemy.lastAttack > 700) {
        enemy.lastAttack = time;
        this.animateMeleeAttack(enemy);
        this.playerStats.hp -= enemy.damage;
        this.showDamage(this.player.x, this.player.y, enemy.damage, "#ef4444");
        this.cameras.main.shake(90, 0.006);
        this.playSound("hurt");

        if (this.playerStats.hp <= 0) {
          this.respawnPlayer();
        }
      }

      if (targetKind === "ally" && enemy.currentTargetRef && enemy.currentTargetRef.active && time - enemy.lastAttack > 780) {
        enemy.lastAttack = time;
        this.animateMeleeAttack(enemy);
        this.damageAlly(enemy.currentTargetRef, enemy.damage);
      }

      return;
    }

    // Move only while not in attack range.
    if (time > enemy.nextWander) {
      enemy.nextWander = time + Phaser.Math.Between(900, 1600);
      enemy.wanderX = targetKind === "castle" ? Phaser.Math.Between(-25, 25) : 0;
      enemy.wanderY = targetKind === "castle" ? Phaser.Math.Between(-25, 25) : 0;
    }

    if (time > enemy.nextMoveDecision) {
      enemy.nextMoveDecision = time + 260;
      this.physics.moveTo(
        enemy,
        targetX + enemy.wanderX,
        targetY + enemy.wanderY,
        enemy.speed
      );
    }
  }

  updateRangedEnemy(enemy, targetX, targetY, time) {
    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

    const minRange = 210;
    const maxRange = 340;

    if (dist > maxRange) {
      if (time > enemy.nextMoveDecision) {
        enemy.nextMoveDecision = time + 420;
        this.physics.moveTo(enemy, targetX, targetY, enemy.speed);
      }
    } else if (dist < minRange) {
      if (time > enemy.nextMoveDecision) {
        enemy.nextMoveDecision = time + 520;
        const angle = Phaser.Math.Angle.Between(targetX, targetY, enemy.x, enemy.y);
        const fleeX = Phaser.Math.Clamp(enemy.x + Math.cos(angle) * 120, 40, this.worldW - 40);
        const fleeY = Phaser.Math.Clamp(enemy.y + Math.sin(angle) * 120, 40, this.worldH - 40);
        this.physics.moveTo(enemy, fleeX, fleeY, enemy.speed);
      }
    } else {
      enemy.body.setVelocity(0);
    }

    if (dist < 370 && time - enemy.lastAttack > 1450) {
      enemy.lastAttack = time;
      enemy.body.setVelocity(0);
      this.shootEnemyProjectile(enemy, targetX, targetY);
    }
  }

  toggleFormationMode() {
    this.formationMode = this.formationMode === "follow" ? "hold" : "follow";

    if (this.formationMode === "hold") {
      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active) return;
        if (ally.role === "castleArcher") return;

        ally.holdX = ally.x;
        ally.holdY = ally.y;
      });

      this.showMessage("Formation: HOLD POSITION");
    } else {
      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active) return;
        ally.holdX = null;
        ally.holdY = null;
      });

      this.showMessage("Formation: FOLLOW PLAYER");
    }
  }

  updateAllies(time) {
    const roleCounts = {
      knight: 0,
      archer: 0,
      castleArcher: 0,
      healer: 0,
      other: 0,
    };

    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;

      this.updateAllyHealthBar?.(ally);

      // Castle Archer is a fixed wall unit.
      // It should never follow the player.
      if (ally.role === "castleArcher") {
        ally.x = ally.fixedX ?? ally.homeX ?? ally.x;
        ally.y = ally.fixedY ?? ally.homeY ?? ally.y;

        if (ally.body) {
          ally.body.setVelocity(0);
          ally.body.x = ally.x - ally.body.width / 2;
          ally.body.y = ally.y - ally.body.height / 2;
        }

        const target = this.getBestEnemyTargetForAlly(ally, ally.range || 900, true);

        if (target && time - ally.lastAttack > 750) {
          ally.lastAttack = time;
          ally.currentTarget = target;
          this.shootProjectile(ally, target, ally.damage || 16, 0xf59e0b);
        }

        return;
      }

      const role = ally.role || "other";
      const slotIndex = roleCounts[role] ?? 0;
      roleCounts[role] = slotIndex + 1;

      ally.formationSlot = this.getAllyFormationSlot(ally, slotIndex);

      if (role === "healer") {
        this.updateHealerAlly(ally, time);
        return;
      }

      if (role === "archer") {
        const target = this.getBestEnemyTargetForAlly(ally, ally.range || 650, false);

        if (target) {
          const distance = Phaser.Math.Distance.Between(ally.x, ally.y, target.x, target.y);
          this.updateArcherAlly(ally, target, distance, time);
        } else {
          this.moveAllyToFormation(ally, time);
        }

        return;
      }

      // Knights stay behind the player and intercept nearby enemies.
      const target = this.getBestEnemyTargetForAlly(ally, 230, false);

      if (target) {
        const distance = Phaser.Math.Distance.Between(ally.x, ally.y, target.x, target.y);
        this.updateKnightAlly(ally, target, distance, time);
      } else {
        this.moveAllyToFormation(ally, time);
      }
    });
  }


  getAllyFormationSlot(ally, slotIndex = 0) {
    // Castle Archer is fixed on the castle wall.
    if (ally.role === "castleArcher") {
      return {
        x: ally.fixedX ?? ally.homeX ?? ally.x,
        y: ally.fixedY ?? ally.homeY ?? ally.y,
      };
    }

    const followBaseX = this.player.x;
    const followBaseY = this.player.y;

    // Hold mode uses the ally's saved hold position as the formation base.
    const baseX = this.formationMode === "hold" && ally.holdX ? ally.holdX : followBaseX;
    const baseY = this.formationMode === "hold" && ally.holdY ? ally.holdY : followBaseY;

    const rowGap = 86;
    const colGap = 78;

    if (ally.role === "knight") {
      const slots = this.formationMode === "hold"
        ? [
            { x: baseX + 45, y: baseY - 45 },
            { x: baseX + 45, y: baseY + 45 },
            { x: baseX + 105, y: baseY },
          ]
        : [
            { x: baseX - rowGap, y: baseY - colGap },
            { x: baseX - rowGap, y: baseY + colGap },
            { x: baseX - rowGap * 1.55, y: baseY },
          ];

      return slots[slotIndex % slots.length];
    }

    if (ally.role === "healer") {
      const slots = this.formationMode === "hold"
        ? [
            { x: baseX - 25, y: baseY },
            { x: baseX - 60, y: baseY - 55 },
            { x: baseX - 60, y: baseY + 55 },
          ]
        : [
            { x: baseX - rowGap * 2.25, y: baseY },
            { x: baseX - rowGap * 2.4, y: baseY - colGap },
            { x: baseX - rowGap * 2.4, y: baseY + colGap },
          ];

      return slots[slotIndex % slots.length];
    }

    if (ally.role === "archer") {
      const slots = this.formationMode === "hold"
        ? [
            { x: baseX - 125, y: baseY - 110 },
            { x: baseX - 125, y: baseY + 110 },
            { x: baseX - 190, y: baseY },
          ]
        : [
            { x: baseX - rowGap * 3.05, y: baseY - colGap * 1.45 },
            { x: baseX - rowGap * 3.05, y: baseY + colGap * 1.45 },
            { x: baseX - rowGap * 3.8, y: baseY - colGap * 0.55 },
            { x: baseX - rowGap * 3.8, y: baseY + colGap * 0.55 },
          ];

      return slots[slotIndex % slots.length];
    }

    return { x: baseX - rowGap * 2.5, y: baseY };
  }


  moveAllyToFormation(ally, time) {
    if (!ally || !ally.body) return;

    // Castle Archer is fixed on wall.
    if (ally.role === "castleArcher") {
      ally.x = ally.fixedX ?? ally.homeX ?? ally.x;
      ally.y = ally.fixedY ?? ally.homeY ?? ally.y;
      ally.body.setVelocity(0);
      return;
    }

    if (!ally.formationSlot) return;

    const targetX = Phaser.Math.Clamp(ally.formationSlot.x, 90, this.worldW - 90);
    const targetY = Phaser.Math.Clamp(ally.formationSlot.y, 90, this.worldH - 90);

    const distance = Phaser.Math.Distance.Between(ally.x, ally.y, targetX, targetY);

    const stopRadius = ally.role === "healer" ? 46 : ally.role === "archer" ? 52 : 44;

    if (distance > stopRadius) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 130;

        const moveSpeed =
          ally.role === "knight" ? 82 :
          ally.role === "healer" ? 66 :
          ally.role === "archer" ? 64 :
          65;

        this.physics.moveTo(ally, targetX, targetY, moveSpeed);
      }
    } else {
      ally.body.setVelocity(
        ally.body.velocity.x * 0.2,
        ally.body.velocity.y * 0.2
      );
    }
  }


  getBestEnemyTargetForAlly(ally, maxRange = 650, preferCastleThreat = false) {
    if (!this.enemies) return null;

    let bestEnemy = null;
    let bestScore = Infinity;

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      const distanceToAlly = Phaser.Math.Distance.Between(ally.x, ally.y, enemy.x, enemy.y);
      if (distanceToAlly > maxRange) return;

      let score = distanceToAlly;

      if (preferCastleThreat && this.castleGatePoint) {
        const distanceToCastle = Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
          this.castleGatePoint.x,
          this.castleGatePoint.y
        );

        score = distanceToCastle * 0.65 + distanceToAlly * 0.35;
      }

      if (enemy.isBoss) score -= 150;
      if (enemy.isRanged) score -= 40;

      if (score < bestScore) {
        bestScore = score;
        bestEnemy = enemy;
      }
    });

    return bestEnemy;
  }

  updateHealerAlly(ally, time) {
    const healRange = 195;
    const searchRange = 760;

    let target = null;
    let targetKind = "ally";
    let lowestHpPercent = 1;

    // Heal weakest allied unit first.
    this.allies.children.iterate((other) => {
      if (!other || !other.active || other === ally) return;
      if (other.hp === undefined || other.maxHp === undefined) return;

      const distance = Phaser.Math.Distance.Between(ally.x, ally.y, other.x, other.y);
      if (distance > searchRange) return;

      const hpPercent = other.hp / other.maxHp;

      if (hpPercent < lowestHpPercent && hpPercent < 0.97) {
        lowestHpPercent = hpPercent;
        target = other;
        targetKind = "ally";
      }
    });

    // Heal player if player is weak enough.
    const playerHpPercent = this.playerStats.hp / this.playerStats.maxHp;
    const playerDistance = Phaser.Math.Distance.Between(ally.x, ally.y, this.player.x, this.player.y);

    if ((!target || playerHpPercent < lowestHpPercent) && playerHpPercent < 0.93 && playerDistance < searchRange) {
      target = this.player;
      targetKind = "player";
      lowestHpPercent = playerHpPercent;
    }

    if (!target) {
      this.moveAllyToFormation(ally, time);
      return;
    }

    const distance = Phaser.Math.Distance.Between(ally.x, ally.y, target.x, target.y);

    if (distance > healRange) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 280;
        this.physics.moveTo(ally, target.x, target.y, ally.speed || 58);
      }
    } else {
      ally.body.setVelocity(0);
    }

    if (distance <= healRange && time - ally.lastHeal > 900) {
      ally.lastHeal = time;
      ally.body.setVelocity(0);

      if (targetKind === "player") {
        const healAmount = 18;
        this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + healAmount);
        this.showFloatingText(this.player.x, this.player.y - 55, `+${healAmount} HP`, "#22c55e");
      } else {
        const healAmount = 28;
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        this.updateAllyHealthBar?.(target);
        this.showFloatingText(target.x, target.y - 55, `+${healAmount} HP`, "#22c55e");
      }

      this.drawHealPulse?.(ally.x, ally.y);
      this.playUnitAttackAnimation?.(ally);
      this.playSound?.("heal");
    }
  }

  updateKnightAlly(ally, enemy, distance, time) {
    const stopDistance = 64;

    if (distance > stopDistance) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 190;
        this.physics.moveTo(ally, enemy.x, enemy.y, ally.speed || 74);
      }
    } else {
      ally.body.setVelocity(0);
    }

    if (distance < 82 && time - ally.lastAttack > 760) {
      ally.lastAttack = time;
      ally.body.setVelocity(0);

      this.playUnitAttackAnimation?.(ally);

      const damage = ally.damage || 14;
      enemy.hp -= damage;

      this.showDamage(enemy.x, enemy.y, damage, "#93c5fd");
      this.updateEnemyHealthBar?.(enemy);

      if (enemy.hp <= 0) this.killEnemy(enemy);
    }
  }

  updateArcherAlly(ally, enemy, distance, time) {
    const dangerDistance = ally.role === "castleArcher" ? 75 : 125;
    const shootRange = ally.range || 650;

    // Back away if enemy reaches archer.
    if (distance < dangerDistance) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 420;

        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, ally.x, ally.y);
        const fleeX = Phaser.Math.Clamp(ally.x + Math.cos(angle) * 135, 40, this.worldW - 40);
        const fleeY = Phaser.Math.Clamp(ally.y + Math.sin(angle) * 135, 40, this.worldH - 40);

        this.physics.moveTo(ally, fleeX, fleeY, ally.speed || 52);
      }
    } else {
      this.moveAllyToFormation(ally, time);
    }

    if (distance <= shootRange && time - ally.lastAttack > 760) {
      ally.lastAttack = time;

      // Stop briefly to shoot, then continue formation movement next update.
      ally.body.setVelocity(0);

      const damage = ally.damage || 13;
      this.shootProjectile(ally, enemy, damage, ally.role === "castleArcher" ? 0xf59e0b : 0xfacc15);
    }
  }


  freeAllyWander(ally, time) {
    if (time > ally.nextWander) {
      ally.nextWander = time + Phaser.Math.Between(900, 1800);

      const roam = ally.type === "Archer" ? 95 : 180;

      ally.wanderX = Phaser.Math.Clamp(
        ally.homeX + Phaser.Math.Between(-roam, roam),
        40,
        this.worldW - 40
      );

      ally.wanderY = Phaser.Math.Clamp(
        ally.homeY + Phaser.Math.Between(-roam, roam),
        40,
        this.worldH - 40
      );
    }

    const dist = Phaser.Math.Distance.Between(ally.x, ally.y, ally.wanderX, ally.wanderY);

    if (dist > 28) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 500;
        this.physics.moveTo(ally, ally.wanderX, ally.wanderY, ally.speed * 0.35);
      }
    } else {
      ally.body.setVelocity(0);
    }
  }

  shootProjectile(from, target, damage, color) {
    if (!from || !target || !target.active) return;

    this.playUnitAttackAnimation?.(from);

    const angle = Phaser.Math.Angle.Between(from.x, from.y, target.x, target.y);

    const projectile = this.add.rectangle(from.x, from.y, 34, 5, color || 0xfacc15);
    projectile.setRotation(angle);
    projectile.setDepth(7000);

    projectile.trail = this.add.rectangle(from.x, from.y, 22, 4, color || 0xfacc15, 0.28);
    projectile.trail.setRotation(angle);
    projectile.trail.setDepth(6999);

    this.physics.add.existing(projectile);

    projectile.damage = damage;
    this.projectiles.add(projectile);

    this.physics.moveTo(projectile, target.x, target.y, 620);
    this.playSound?.("arrow");

    this.tweens.add({
      targets: projectile.trail,
      alpha: 0,
      duration: 350,
      onComplete: () => projectile.trail?.destroy(),
    });

    this.time.delayedCall(2200, () => {
      if (projectile.active) projectile.destroy();
      if (projectile.trail?.active) projectile.trail.destroy();
    });
  }


  shootEnemyProjectile(enemy, targetX, targetY) {
    this.animateRangedAttack(enemy);

    const color = enemy.enemyType === "Orc Archer" ? 0x111827 : 0xa78bfa;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);

    const projectile = this.add.rectangle(enemy.x, enemy.y, 30, 5, color);
    projectile.setRotation(angle);

    projectile.trail = this.add.rectangle(enemy.x, enemy.y, 20, 4, 0xef4444, 0.25);
    projectile.trail.setRotation(angle);

    this.physics.add.existing(projectile);

    projectile.damage = enemy.damage;
    this.enemyProjectiles.add(projectile);

    this.physics.moveTo(projectile, targetX, targetY, 350);
    this.playSound("arrow");

    this.tweens.add({
      targets: projectile.trail,
      alpha: 0,
      duration: 300,
      onComplete: () => projectile.trail?.destroy(),
    });

    this.time.delayedCall(1500, () => {
      if (projectile.active) projectile.destroy();
      if (projectile.trail?.active) projectile.trail.destroy();
    });
  }


  animateMeleeAttack(unit) {
    this.playUnitAttackAnimation(unit);
  }


  animateRangedAttack(unit) {
    this.playUnitAttackAnimation(unit);
  }


  animateDeath(unit, onComplete) {
    if (!unit || !unit.active) {
      if (onComplete) onComplete();
      return;
    }

    unit.setActive(false);

    if (unit.body) {
      unit.body.setVelocity(0);
      unit.body.enable = false;
    }

    this.playSound("death");

    this.tweens.add({
      targets: unit,
      alpha: 0,
      angle: unit.isBoss ? 0 : 70,
      scaleX: unit.isBoss ? 1.1 : 0.7,
      scaleY: unit.isBoss ? 0.7 : 0.7,
      duration: unit.isBoss ? 700 : 320,
      ease: "Sine.easeIn",
      onComplete: () => {
        if (onComplete) onComplete();
        unit.destroy();
      },
    });
  }

  regeneratePlayerStamina() {
    if (!this.playerStats) return;

    const maxStamina = 100;
    const regen = this.playerStats.stamina < 35 ? 0.16 : 0.09;

    this.playerStats.stamina = Math.min(maxStamina, this.playerStats.stamina + regen);
  }

  updatePlayerAutoAttack(time) {
    if (this.gameEnded || this.mainMenuOpen || this.isPaused || this.upgradeCardOpen) return;
    if (!this.player || !this.enemies) return;

    const cooldown = 560;
    if (time - this.lastAutoAttackTime < cooldown) return;

    const enemy = this.getNearestEnemyToPlayer(this.autoAttackRange);
    if (!enemy) return;

    this.lastAutoAttackTime = time;

    const damage = Math.max(8, Math.floor(this.playerStats.damage * 0.75));

    this.playUnitAttackAnimation?.(this.player);

    enemy.hp -= damage;
    this.showDamage(enemy.x, enemy.y, damage, "#facc15");
    this.updateEnemyHealthBar?.(enemy);

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  getNearestEnemyToPlayer(maxRange = 120) {
    let bestEnemy = null;
    let bestDistance = Infinity;

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);

      if (distance < bestDistance && distance <= maxRange) {
        bestDistance = distance;
        bestEnemy = enemy;
      }
    });

    return bestEnemy;
  }

  playerSpecialAttack(time) {
    if (this.gameEnded || this.mainMenuOpen || this.isPaused || this.upgradeCardOpen) return;

    this.fixStaminaNaN?.();

    const cooldown = 900;
    const staminaCost = Number(this.specialAttackStaminaCost || 35);

    if (time - this.lastSpecialAttackTime < cooldown) {
      this.showMessage("Special attack cooling down.");
      return;
    }

    if (this.playerStats.stamina < staminaCost) {
      this.showMessage(`Not enough stamina. Need ${staminaCost}.`);
      return;
    }

    this.playerStats.stamina = Math.max(0, this.playerStats.stamina - staminaCost);
    this.lastSpecialAttackTime = time;

    const range = this.specialAttackRange || 155;
    const damage = Math.floor((this.playerStats.damage || 25) * 1.55);

    this.playUnitAttackAnimation?.(this.player);
    this.playSound?.("attack");

    const ring = this.add.circle(this.player.x, this.player.y, range, 0xfacc15, 0.16);
    ring.setDepth(8500);

    const slash = this.add.arc(this.player.x, this.player.y, range * 0.75, -35, 220, false, 0xfacc15, 0.58);
    slash.setDepth(8501);

    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.35,
      duration: 260,
      onComplete: () => ring.destroy(),
    });

    this.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.5,
      duration: 210,
      onComplete: () => slash.destroy(),
    });

    let hitCount = 0;

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > range) return;

      hitCount += 1;

      enemy.hp -= damage;
      this.showDamage(enemy.x, enemy.y, damage, "#facc15");
      this.updateEnemyHealthBar?.(enemy);

      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      enemy.x += Math.cos(angle) * 28;
      enemy.y += Math.sin(angle) * 28;

      if (enemy.body) {
        enemy.body.x = enemy.x - enemy.body.width / 2;
        enemy.body.y = enemy.y - enemy.body.height / 2;
      }

      if (enemy.hp <= 0) {
        this.killEnemy(enemy);
      }
    });

    this.cameras.main.shake(120, 0.004);
    this.showMessage(hitCount > 0 ? `Special attack hit ${hitCount} enemies. -${staminaCost} ST` : `Special attack missed. -${staminaCost} ST`);
    this.updateUI?.();
  }


  playerAttack(time) {
    if (time - this.lastPlayerAttack < 420) return;
    this.lastPlayerAttack = time;
    this.playUnitAttackAnimation(this.player);

    let hitSomething = false;

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);

      if (distance < 88) {
        hitSomething = true;
        enemy.hp -= this.playerStats.damage;
        this.showDamage(enemy.x, enemy.y, this.playerStats.damage, "#ffffff");

        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        enemy.x += Math.cos(angle) * 18;
        enemy.y += Math.sin(angle) * 18;

        if (enemy.hp <= 0) this.killEnemy(enemy);
      }
    });

    const slash = this.add.arc(this.player.x, this.player.y, 78, -40, 40, false, 0xffffff, 0.35);
    slash.setDepth(50);

    this.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.25,
      duration: 180,
      onComplete: () => slash.destroy(),
    });

    if (!hitSomething) {
      this.showMessage("Swing missed. Move closer to enemies.");
    }
  }

  damagePlayer(enemy) {
    const now = this.time.now;
    if (now - enemy.lastAttack < 900) return;

    enemy.lastAttack = now;
    this.playerStats.hp -= enemy.damage;

    this.cameras.main.shake(80, 0.004);
    this.showDamage(this.player.x, this.player.y, enemy.damage, "#ef4444");

    if (this.playerStats.hp <= 0) {
      this.respawnPlayer();
    }
  }

  respawnPlayer() {
    this.heroGameOver();
  }

  restartGame() {
    // Direct restart after Game Over.
    // Important: skip main menu and immediately start a fresh game.
    this.scene.restart({ skipMainMenu: true });
  }


  heroGameOver() {
    if (this.gameEnded) return;

    this.gameEnded = true;
    this.isPaused = true;
    this.physics.world.pause();
    this.playSound("gameOver");

    this.player.body.setVelocity(0);
    this.playerStats.hp = 0;

    this.cameras.main.shake(240, 0.01);

    const overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.72);
    overlay.setScrollFactor(0);
    overlay.setDepth(10000);

    const panel = this.add.rectangle(480, 270, 620, 250, 0x111827, 0.96);
    panel.setScrollFactor(0);
    panel.setDepth(10001);

    const title = this.add.text(480, 205, "GAME OVER", {
      fontSize: "44px",
      color: "#ef4444",
      fontFamily: "monospace",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(10002);

    const body = this.add.text(480, 285, "The hero has fallen.\nENTER or R = New Game\nTip: Use potions with U before HP reaches 0.", {
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
      fontFamily: "monospace",
      lineSpacing: 8,
    });
    body.setOrigin(0.5);
    body.setScrollFactor(0);
    body.setDepth(10002);
  }

  killEnemy(enemy) {
    if (!enemy || !enemy.active) return;

    this.playerStats.gold += enemy.gold;
    this.playSound("coin");
    this.playerStats.xp += 10;
    this.playerStats.kills += 1;

    this.updateQuestProgress("kill5", this.playerStats.kills);

    if (enemy.isBoss) {
      this.playerStats.bossKills += 1;
      this.updateQuestProgress("boss1", this.playerStats.bossKills);
    }

    this.dropLoot(enemy);

    if (this.playerStats.xp >= this.playerStats.level * 80) {
      this.playerStats.xp = 0;
      this.playerStats.level += 1;
      this.playerStats.maxHp += 10;
      this.playerStats.hp = this.playerStats.maxHp;
      this.playerStats.damage += 4;
      this.showMessage(`Level up. You are now level ${this.playerStats.level}.`);
    }

    this.showFloatingText(enemy.x, enemy.y - 35, `+${enemy.gold} gold`, "#facc15");

    if (enemy.hpBar) enemy.hpBar.destroy();
    if (enemy.hpBack) enemy.hpBack.destroy();
    if (enemy.nameLabel) enemy.nameLabel.destroy();

    const death = this.add.circle(enemy.x, enemy.y, enemy.isBoss ? 38 : 18, 0xffffff, 0.25);

    this.tweens.add({
      targets: death,
      scale: enemy.isBoss ? 3 : 2,
      alpha: 0,
      duration: enemy.isBoss ? 600 : 250,
      onComplete: () => death.destroy(),
    });

    this.animateDeath(enemy);
  }


  dropLoot(enemy) {
    const lootTable = {
      Goblin: ["goblinCoin"],
      "Orc Warrior": ["orcTooth"],
      "Orc Archer": ["orcTooth", "goblinCoin"],
      "Armored Orc": ["orcTooth", "trollBone"],
      "Troll Boss": ["orcTooth", "trollBone", "magicCrystal"],
    };

    const possible = lootTable[enemy.enemyType] ?? ["goblinCoin"];
    const count = enemy.isBoss ? 4 : 1;

    for (let i = 0; i < count; i++) {
      if (!enemy.isBoss && Math.random() > 0.7) continue;

      const type = Phaser.Math.RND.pick(possible);
      const x = enemy.x + Phaser.Math.Between(-20, 20);
      const y = enemy.y + Phaser.Math.Between(-20, 20);

      const color = type === "magicCrystal"
        ? 0xa78bfa
        : type === "wolfFur"
          ? 0xcbd5e1
          : type === "trollBone"
            ? 0xe5e7eb
            : 0xfacc15;

      const loot = this.add.circle(x, y, 9, color);
      this.physics.add.existing(loot);

      loot.lootType = type;
      loot.label = this.add.text(x - 18, y - 25, this.shortLootName(type), {
        fontSize: "10px",
        color: "#ffffff",
        fontFamily: "monospace",
      });

      this.lootDrops.add(loot);
    }
  }


  collectLoot(loot) {
    if (!loot.active) return;

    const type = loot.lootType;
    this.playerStats.loot[type] = (this.playerStats.loot[type] ?? 0) + 1;

    this.showFloatingText(loot.x, loot.y - 10, `Picked ${this.shortLootName(type)}`, "#facc15");

    if (loot.label) loot.label.destroy();
    loot.destroy();
    this.updatePanels();
  }

  shortLootName(type) {
    const names = {
      goblinCoin: "Coin",
      wolfFur: "Fur",
      orcTooth: "Tooth",
      trollBone: "Bone",
      magicCrystal: "Crystal",
    };

    return names[type] ?? type;
  }

  talkToNPC() {
    let nearestNPC = null;
    let nearestDistance = Infinity;

    this.npcs.forEach((npc) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestNPC = npc;
      }
    });

    if (nearestNPC && nearestDistance < 90) {
      this.showMessage(nearestNPC.dialogue);
    } else {
      this.showMessage("No NPC nearby.");
    }
  }

  isNearShopNPC() {
    return this.npcs.some((npc) => {
      const isShopNPC = npc.name === "Merchant" || npc.name === "Blacksmith";
      if (!isShopNPC) return false;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      return distance < 120;
    });
  }

  isNearCastleGate() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.castleGatePoint.x,
      this.castleGatePoint.y
    );

    return distance < 145;
  }

  buyPotion() {
    if (!this.isNearShopNPC()) {
      this.showMessage("You moved away from the shop NPC.");
      this.shopOpen = false;
      this.updatePanels();
      return;
    }

    if (this.playerStats.gold < 20) {
      this.showMessage("Not enough gold. Potion costs 20.");
      return;
    }

    this.playerStats.gold -= 20;
    this.playerStats.potions += 1;
    this.playSound("coin");
    this.showMessage("Bought 1 health potion.");
    this.updatePanels();
  }

  upgradeSword() {
    if (!this.isNearShopNPC()) {
      this.showMessage("You moved away from the shop NPC.");
      this.shopOpen = false;
      this.updatePanels();
      return;
    }

    const cost = 60 + this.playerStats.swordLevel * 25;

    if (this.playerStats.gold < cost) {
      this.showMessage(`Not enough gold. Sword upgrade costs ${cost}.`);
      return;
    }

    this.playerStats.gold -= cost;
    this.playerStats.swordLevel += 1;
    this.playSound("upgrade");
    this.playerStats.damage += 8;
    this.player.sword.setFillStyle(0xfacc15);

    this.updateQuestProgress("upgrade1", 1);
    this.showMessage(`Sword upgraded to level ${this.playerStats.swordLevel}.`);
    this.updatePanels();
  }

  usePotion() {
    if (this.playerStats.potions <= 0) {
      this.showMessage("No health potions left.");
      return;
    }

    if (this.playerStats.hp >= this.playerStats.maxHp) {
      this.showMessage("HP is already full.");
      return;
    }

    this.playerStats.potions -= 1;
    this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 45);
    this.playSound("upgrade");
    this.showMessage("Used health potion. +45 HP.");
    this.updatePanels();
  }

  repairCastle() {
    if (!this.isNearCastleGate()) {
      this.showMessage("Stand near the castle gate repair point to repair.");
      return;
    }

    if (this.castleHealth >= this.maxCastleHealth) {
      this.showMessage("Castle is already fully repaired.");
      return;
    }

    if (this.playerStats.gold < 30) {
      this.showMessage("Not enough gold. Castle repair costs 30.");
      return;
    }

    this.playerStats.gold -= 30;
    this.castleHealth = Math.min(this.maxCastleHealth, this.castleHealth + 90);
    this.updateCastleDamageVisuals();
    this.playSound("upgrade");

    this.updateQuestProgress("repair1", 1);
    this.showMessage("Castle repaired. +90 castle HP.");
    this.updatePanels();
  }

  updateQuestProgress(id, value) {
    const quest = this.quests.find((q) => q.id === id);
    if (!quest || quest.done) return;

    if (id === "kill5" || id === "survive3" || id === "boss1") {
      quest.progress = Math.min(quest.target, value);
    } else {
      quest.progress = Math.min(quest.target, quest.progress + value);
    }

    if (quest.progress >= quest.target) {
      quest.done = true;
      this.playerStats.gold += quest.rewardGold;
      this.playerStats.xp += quest.rewardXp;
      this.showMessage(`Quest complete: ${quest.title}. Reward: ${quest.rewardGold} gold, ${quest.rewardXp} XP.`);
    }

    this.updatePanels();
  }

  saveGame() {
    if (this.gameEnded) {
      this.showMessage("Cannot save after Game Over.");
      return;
    }

    const saveData = {
      wave: this.wave,
      castleHealth: this.castleHealth,
      maxCastleHealth: this.maxCastleHealth,
      playerStats: this.playerStats,
      playerPosition: {
        x: this.player.x,
        y: this.player.y,
      },
      quests: this.quests,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

    this.lastSavedText = new Date(saveData.savedAt).toLocaleString();
    this.showMessage("Game saved.");
    this.updateUI?.();
  }


  loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      this.showMessage("No save file found.");
      return;
    }

    try {
      const saveData = JSON.parse(raw);

      this.wave = saveData.wave ?? 1;
      this.castleHealth = saveData.castleHealth ?? 500;
      this.maxCastleHealth = saveData.maxCastleHealth ?? 500;

      this.playerStats = {
        ...this.playerStats,
        ...(saveData.playerStats ?? {}),
        loot: {
          ...this.playerStats.loot,
          ...(saveData.playerStats?.loot ?? {}),
        },
      };

      this.quests = saveData.quests ?? this.quests;

      if (saveData.playerPosition) {
        this.player.x = saveData.playerPosition.x ?? 520;
        this.player.y = saveData.playerPosition.y ?? 545;
      }

      this.lastSavedText = saveData.savedAt ? new Date(saveData.savedAt).toLocaleString() : "Unknown";

      this.clearEnemiesProjectilesLoot?.();
      this.spawnWave?.();

      this.showMessage("Save loaded.");
      this.updatePanels?.();
      this.updateUI?.();
      this.updateCastleDamageVisuals?.();
    } catch (error) {
      console.error(error);
      this.showMessage("Save file corrupted.");
    }
  }


  clearEnemiesProjectilesLoot() {
    this.enemies.children.iterate((enemy) => {
      if (!enemy) return;
      if (enemy.hpBar) enemy.hpBar.destroy();
      if (enemy.hpBack) enemy.hpBack.destroy();
      enemy.destroy();
    });

    this.projectiles.children.iterate((projectile) => {
      if (!projectile) return;
      if (projectile.trail) projectile.trail.destroy();
      projectile.destroy();
    });

    this.enemyProjectiles.children.iterate((projectile) => {
      if (!projectile) return;
      projectile.destroy();
    });

    this.lootDrops.children.iterate((loot) => {
      if (!loot) return;
      if (loot.label) loot.label.destroy();
      loot.destroy();
    });

    this.enemies.clear(true, true);
    this.projectiles.clear(true, true);
    this.enemyProjectiles.clear(true, true);
    this.lootDrops.clear(true, true);
  }

  damageAlly(ally, damage) {
    if (!ally || !ally.active) return;

    ally.hp -= damage;
    this.showDamage(ally.x, ally.y, damage, "#ef4444");
    this.playSound("hurt");

    if (ally.hp <= 0) {
      this.removeAlly(ally);
    } else {
      this.updateAllyHealthBar(ally);
    }
  }

  removeAlly(ally) {
    if (!ally || !ally.active) return;

    this.showFloatingText(ally.x, ally.y - 30, `${ally.type} fell`, "#ef4444");

    if (ally.hpBar) ally.hpBar.destroy();
    if (ally.hpBack) ally.hpBack.destroy();
    if (ally.nameLabel) ally.nameLabel.destroy();

    const dust = this.add.circle(ally.x, ally.y, 22, 0xffffff, 0.25);
    this.tweens.add({
      targets: dust,
      scale: 2,
      alpha: 0,
      duration: 280,
      onComplete: () => dust.destroy(),
    });

    this.animateDeath(ally);
  }


  updateAllyHealthBar(ally) {
    if (!ally.hpBar || !ally.hpBack) return;

    ally.hpBack.x = ally.x;
    ally.hpBack.y = ally.y - 50;

    ally.hpBar.x = ally.x;
    ally.hpBar.y = ally.y - 50;

    const ratio = Phaser.Math.Clamp(ally.hp / ally.maxHp, 0, 1);
    ally.hpBar.width = Math.max(0, 46 * ratio);

    if (ally.hp <= 0) ally.hpBar.width = 0;
  }


  applyCastleDamage(amount) {
    this.castleHealth = Math.max(0, this.castleHealth - amount);

    this.playSound("castleHit");

    if (this.time.now % 8 < 2) {
      this.cameras.main.shake(55, 0.003);
    }

    this.showGateHitEffect();
    this.updateCastleDamageVisuals();

    if (this.castleHealth <= 0) {
      this.gameOver();
    }
  }

  createCastleDamageVisuals() {
    this.castleCracks = [];
    this.castleSmoke = [];

    for (let i = 0; i < 5; i++) {
      const crack = this.add.text(
        Phaser.Math.Between(70, 175),
        Phaser.Math.Between(365, 610),
        "╱",
        {
          fontSize: "28px",
          color: "#1f2937",
          fontFamily: "monospace",
        }
      );

      crack.setVisible(false);
      this.castleCracks.push(crack);
    }

    for (let i = 0; i < 4; i++) {
      const smoke = this.add.circle(
        Phaser.Math.Between(90, 210),
        Phaser.Math.Between(340, 620),
        Phaser.Math.Between(10, 18),
        0x6b7280,
        0.32
      );

      smoke.setVisible(false);
      this.castleSmoke.push(smoke);

      this.tweens.add({
        targets: smoke,
        y: smoke.y - 22,
        alpha: 0.08,
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(900, 1500),
      });
    }
  }

  updateCastleDamageVisuals() {
    if (!this.castleCracks || !this.castleSmoke) return;

    const hpPercent = this.castleHealth / this.maxCastleHealth;

    this.castleCracks.forEach((crack, index) => {
      crack.setVisible(hpPercent < 0.8 - index * 0.12);
    });

    this.castleSmoke.forEach((smoke, index) => {
      smoke.setVisible(hpPercent < 0.55 - index * 0.09);
    });
  }

  showGateHitEffect() {
    const hit = this.add.circle(this.castleGatePoint.x, this.castleGatePoint.y, 18, 0xef4444, 0.32);

    this.tweens.add({
      targets: hit,
      scale: 2.2,
      alpha: 0,
      duration: 180,
      onComplete: () => hit.destroy(),
    });
  }

  updateBossSpecials(enemy, time) {
    if (!enemy.phaseTwo && enemy.hp <= enemy.maxHp * 0.5) {
      enemy.phaseTwo = true;
      enemy.speed += 8;
      enemy.damage += 12;
      enemy.bodyShape?.setFillStyle?.(0xb91c1c);
      this.showMessage("Troll Boss enraged. Phase 2 started.");
      this.cameras.main.shake(220, 0.012);
      this.playSound("boss");
    }

    const stompDelay = enemy.phaseTwo ? 2800 : 4500;
    const summonDelay = enemy.phaseTwo ? 6200 : 9000;

    if (time > enemy.nextBossStomp) {
      enemy.nextBossStomp = time + stompDelay;
      this.bossStomp(enemy);
    }

    if (time > enemy.nextBossSummon) {
      enemy.nextBossSummon = time + summonDelay;
      this.bossSummon(enemy);
    }
  }


  bossStomp(enemy) {
    const radius = 150;

    const ring = this.add.circle(enemy.x, enemy.y, radius, 0xef4444, 0.15);
    ring.setDepth(90);

    this.tweens.add({
      targets: ring,
      scale: 1.25,
      alpha: 0,
      duration: 450,
      onComplete: () => ring.destroy(),
    });

    const playerDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    if (playerDist < radius) {
      this.playerStats.hp -= 24;
      this.showDamage(this.player.x, this.player.y, 24, "#ef4444");
      this.cameras.main.shake(160, 0.009);

      if (this.playerStats.hp <= 0) {
        this.respawnPlayer();
      }
    }

    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;

      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y);
      if (dist < radius) {
        this.damageAlly(ally, 22);
      }
    });

    this.playSound("boss");
    this.showMessage("Boss stomp attack!");
  }

  bossSummon(enemy) {
    for (let i = 0; i < 3; i++) {
      this.spawnEnemy(
        enemy.x + Phaser.Math.Between(-90, 90),
        enemy.y + Phaser.Math.Between(-90, 90),
        false
      );
    }

    this.showMessage("Boss summoned minions!");
    this.playSound("summon");
  }

  sellAllLoot() {
    if (!this.isNearShopNPC()) {
      this.showMessage("Stand near Merchant or Blacksmith to sell loot.");
      this.shopOpen = false;
      this.updatePanels();
      return;
    }

    const loot = this.playerStats.loot;

    const total =
      loot.goblinCoin * 3 +
      loot.wolfFur * 5 +
      loot.orcTooth * 8 +
      loot.trollBone * 14 +
      loot.magicCrystal * 25;

    if (total <= 0) {
      this.showMessage("No loot to sell.");
      return;
    }

    this.playerStats.gold += total;

    loot.goblinCoin = 0;
    loot.wolfFur = 0;
    loot.orcTooth = 0;
    loot.trollBone = 0;
    loot.magicCrystal = 0;

    this.showMessage(`Sold all loot for ${total} gold.`);
    this.playSound("coin");
    this.updatePanels();
  }

  buyUpgrade(type) {
    const costs = {
      hp: 70,
      damage: 90,
      castle: 120,
      allies: 100,
      tower: 150,
    };

    const cost = costs[type];

    if (this.playerStats.gold < cost) {
      this.showMessage(`Not enough gold. Need ${cost}.`);
      return;
    }

    this.playerStats.gold -= cost;

    if (type === "hp") {
      this.playerStats.maxHp += 20;
      this.playerStats.hp = this.playerStats.maxHp;
      this.showMessage("Upgrade bought: Max HP +20.");
    }

    if (type === "damage") {
      this.playerStats.damage += 8;
      this.showMessage("Upgrade bought: Player damage +8.");
    }

    if (type === "castle") {
      this.maxCastleHealth += 100;
      this.castleHealth += 100;
      this.showMessage("Upgrade bought: Castle max HP +100.");
    }

    if (type === "allies") {
      this.playerStats.allyUpgradeLevel += 1;

      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active) return;

        ally.maxHp += 25;
        ally.hp += 25;

        if (ally.role !== "healer") {
          ally.damage += 3;
        }

        this.updateAllyHealthBar(ally);
      });

      this.showMessage(`Ally units upgraded to Lv ${this.playerStats.allyUpgradeLevel}.`);
    }

    if (type === "tower") {
      this.playerStats.castleArcherLevel += 1;

      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active) return;

        if (ally.role === "castleArcher") {
          ally.damage += 5;
          ally.range += 35;
          ally.maxHp += 35;
          ally.hp = ally.maxHp;
          ally.bodyShape?.setFillStyle?.(0xfbbf24);
          this.updateAllyHealthBar(ally);
        }
      });

      this.applyCastleArcherVisualUpgrade();
      this.showMessage(`Castle Archer tower upgraded to Lv ${this.playerStats.castleArcherLevel}.`);
    }

    this.playSound("upgrade");
    this.updatePanels();
  }


  playSound(type) {
    if (!this.soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const sounds = {
        attack: [220, 0.04],
        arrow: [520, 0.04],
        hurt: [110, 0.06],
        coin: [720, 0.05],
        upgrade: [520, 0.08],
        castleHit: [80, 0.05],
        boss: [65, 0.16],
        summon: [180, 0.12],
        tick: [440, 0.03],
        wave: [330, 0.08],
        death: [140, 0.12],
        heal: [620, 0.08],
        gameOver: [60, 0.22],
      };

      const [freq, duration] = sounds[type] ?? [300, 0.05];

      osc.frequency.value = freq;
      gain.gain.value = 0.045;

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Browser may block sound until first user interaction.
    }
  }


  getNearestEnemy(source) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      const distance = Phaser.Math.Distance.Between(source.x, source.y, enemy.x, enemy.y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    if (!nearestEnemy) return null;
    return { enemy: nearestEnemy, distance: nearestDistance };
  }

  getNearestAlly(source) {
    let nearestAlly = null;
    let nearestDistance = Infinity;

    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;

      const distance = Phaser.Math.Distance.Between(source.x, source.y, ally.x, ally.y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestAlly = ally;
      }
    });

    if (!nearestAlly) return null;
    return { ally: nearestAlly, distance: nearestDistance };
  }

  updateEnemyHealthBar(enemy) {
    if (!enemy.hpBar || !enemy.hpBack) return;

    enemy.hpBack.x = enemy.x;
    enemy.hpBack.y = enemy.y - 56;

    enemy.hpBar.x = enemy.x;
    enemy.hpBar.y = enemy.y - 56;

    const ratio = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1);
    enemy.hpBar.width = Math.max(0, 52 * ratio);

    if (enemy.hp <= 0) enemy.hpBar.width = 0;

    if (enemy.nameLabel) {
      enemy.nameLabel.x = enemy.x - 45;
      enemy.nameLabel.y = enemy.y - 75;
    }
  }


  resolveUnitOverlap() {
    const units = [];

    if (this.player && this.player.active !== false) {
      units.push({
        ref: this.player,
        radius: 22,
        fixed: false,
        weight: 1.4,
      });
    }

    if (this.allies) {
      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active) return;

        units.push({
          ref: ally,
          radius: ally.role === "castleArcher" ? 28 : 23,
          fixed: ally.role === "castleArcher",
          weight: ally.role === "castleArcher" ? 10 : 1,
        });
      });
    }

    if (this.enemies) {
      this.enemies.children.iterate((enemy) => {
        if (!enemy || !enemy.active) return;

        units.push({
          ref: enemy,
          radius: enemy.isBoss ? 42 : enemy.enemyType === "Armored Orc" ? 30 : 23,
          fixed: false,
          weight: enemy.isBoss ? 2.4 : 1,
        });
      });
    }

    // Gentle local avoidance.
    // Important: do NOT use body.reset() here.
    // body.reset() kills velocity and causes units to stick together.
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < units.length; i++) {
        for (let j = i + 1; j < units.length; j++) {
          const a = units[i];
          const b = units[j];

          let dx = b.ref.x - a.ref.x;
          let dy = b.ref.y - a.ref.y;

          let distSq = dx * dx + dy * dy;

          if (distSq === 0) {
            dx = Phaser.Math.FloatBetween(-0.5, 0.5);
            dy = Phaser.Math.FloatBetween(-0.5, 0.5);
            distSq = dx * dx + dy * dy;
          }

          const dist = Math.sqrt(distSq);
          const minDist = a.radius + b.radius;

          if (dist >= minDist) continue;

          const nx = dx / dist;
          const ny = dy / dist;

          // Move only part of the overlap each frame.
          // This avoids sudden snapping and sticky movement.
          const overlap = (minDist - dist) * 0.35;

          if (a.fixed && b.fixed) {
            continue;
          }

          if (a.fixed && !b.fixed) {
            b.ref.x += nx * overlap;
            b.ref.y += ny * overlap;
          } else if (!a.fixed && b.fixed) {
            a.ref.x -= nx * overlap;
            a.ref.y -= ny * overlap;
          } else {
            const totalWeight = a.weight + b.weight;
            const aMove = (b.weight / totalWeight) * overlap;
            const bMove = (a.weight / totalWeight) * overlap;

            a.ref.x -= nx * aMove;
            a.ref.y -= ny * aMove;

            b.ref.x += nx * bMove;
            b.ref.y += ny * bMove;
          }

          a.ref.x = Phaser.Math.Clamp(a.ref.x, 25, this.worldW - 25);
          a.ref.y = Phaser.Math.Clamp(a.ref.y, 25, this.worldH - 25);

          b.ref.x = Phaser.Math.Clamp(b.ref.x, 25, this.worldW - 25);
          b.ref.y = Phaser.Math.Clamp(b.ref.y, 25, this.worldH - 25);

          // Sync body position without killing velocity.
          if (a.ref.body) {
            a.ref.body.x = a.ref.x - a.ref.body.width / 2;
            a.ref.body.y = a.ref.y - a.ref.body.height / 2;
          }

          if (b.ref.body) {
            b.ref.body.x = b.ref.x - b.ref.body.width / 2;
            b.ref.body.y = b.ref.y - b.ref.body.height / 2;
          }
        }
      }
    }
  }


  updateUnitWalkBob(time) {
    const bobUnit = (unit, strength = 2.2, speed = 0.018) => {
      if (!unit || !unit.active || !unit.body) return;

      const moving = Math.abs(unit.body.velocity.x) > 4 || Math.abs(unit.body.velocity.y) > 4;

      if (!unit.baseScaleX) {
        unit.baseScaleX = unit.scaleX || 1;
        unit.baseScaleY = unit.scaleY || 1;
      }

      if (moving) {
        const bob = Math.sin(time * speed + unit.x * 0.03) * strength;
        const squash = Math.sin(time * speed + unit.y * 0.02) * 0.025;

        unit.y += bob * 0.025;
        unit.scaleX = unit.baseScaleX + squash;
        unit.scaleY = unit.baseScaleY - squash;
      } else {
        unit.scaleX += (unit.baseScaleX - unit.scaleX) * 0.18;
        unit.scaleY += (unit.baseScaleY - unit.scaleY) * 0.18;
      }
    };

    bobUnit(this.player, 2.5, 0.019);

    if (this.allies) {
      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active) return;
        bobUnit(ally, ally.role === "castleArcher" ? 0.35 : 2.0, 0.018);
      });
    }

    if (this.enemies) {
      this.enemies.children.iterate((enemy) => {
        if (!enemy || !enemy.active) return;
        bobUnit(enemy, enemy.isBoss ? 1.2 : 2.1, enemy.isBoss ? 0.012 : 0.019);
      });
    }
  }

  playUnitAttackAnimation(unit) {
    if (!unit || !unit.active) return;

    const type = unit.type || unit.enemyType || "Unit";
    const role = unit.role || "";

    if (type === "Player Knight") {
      this.animateSwordSlash(unit, 0xfacc15, 1.25);
      return;
    }

    if (type === "Ally Knight" || role === "knight") {
      this.animateSwordSlash(unit, 0x93c5fd, 1.0);
      return;
    }

    if (type === "Ally Archer" || role === "archer") {
      this.animateBowShot(unit, 0xfacc15);
      return;
    }

    if (type === "Castle Archer" || role === "castleArcher") {
      this.animateCastleArcherShot(unit);
      return;
    }

    if (type === "Healer" || role === "healer") {
      this.animateHealerCast(unit);
      return;
    }

    if (type === "Goblin") {
      this.animateGoblinStab(unit);
      return;
    }

    if (type === "Orc Warrior") {
      this.animateHeavySwing(unit, 0xef4444, 1.0);
      return;
    }

    if (type === "Orc Archer") {
      this.animateBowShot(unit, 0xef4444);
      return;
    }

    if (type === "Armored Orc") {
      this.animateHeavySwing(unit, 0xcbd5e1, 1.15);
      return;
    }

    if (type === "Troll Boss") {
      this.animateBossSmash(unit);
      return;
    }

    this.animateBasicAttack(unit);
  }

  animateSwordSlash(unit, color = 0xffffff, size = 1) {
    this.playSound?.("attack");

    const slash = this.add.arc(unit.x + 20, unit.y, 36 * size, -45, 55, false, color, 0.55);
    slash.setDepth(8000);

    this.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.45,
      scaleY: 1.45,
      duration: 160,
      onComplete: () => slash.destroy(),
    });

    if (unit.sword || unit.swordBlade || unit.weapon) {
      const weapon = unit.sword || unit.swordBlade || unit.weapon;

      this.tweens.add({
        targets: weapon,
        angle: 38,
        x: weapon.x + 4,
        duration: 80,
        yoyo: true,
      });
    }

    this.tweens.add({
      targets: unit,
      x: unit.x + 5,
      duration: 70,
      yoyo: true,
    });
  }

  animateBowShot(unit, color = 0xfacc15) {
    this.playSound?.("arrow");

    if (unit.weapon) {
      this.tweens.add({
        targets: unit.weapon,
        scaleX: 0.72,
        scaleY: 1.18,
        duration: 90,
        yoyo: true,
      });
    }

    const flash = this.add.circle(unit.x + 24, unit.y - 2, 9, color, 0.5);
    flash.setDepth(8000);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 160,
      onComplete: () => flash.destroy(),
    });
  }

  animateCastleArcherShot(unit) {
    this.playSound?.("arrow");

    const flash = this.add.circle(unit.x + 25, unit.y - 10, 11, 0xfacc15, 0.55);
    flash.setDepth(8000);

    this.tweens.add({
      targets: flash,
      y: flash.y - 8,
      alpha: 0,
      scale: 2,
      duration: 180,
      onComplete: () => flash.destroy(),
    });

    if (unit.weapon) {
      this.tweens.add({
        targets: unit.weapon,
        angle: -8,
        duration: 80,
        yoyo: true,
      });
    }
  }

  animateHealerCast(unit) {
    this.playSound?.("heal");

    const ring = this.add.circle(unit.x, unit.y, 28, 0x22c55e, 0.18);
    ring.setDepth(8000);

    this.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 420,
      onComplete: () => ring.destroy(),
    });

    if (unit.glow || unit.staffTop) {
      this.tweens.add({
        targets: [unit.glow, unit.staffTop].filter(Boolean),
        scale: 1.35,
        duration: 140,
        yoyo: true,
      });
    }
  }

  animateGoblinStab(unit) {
    this.playSound?.("attack");

    if (unit.weapon) {
      this.tweens.add({
        targets: unit.weapon,
        x: unit.weapon.x + 8,
        duration: 65,
        yoyo: true,
      });
    }

    this.tweens.add({
      targets: unit,
      x: unit.x + 4,
      duration: 60,
      yoyo: true,
    });
  }

  animateHeavySwing(unit, color = 0xef4444, size = 1) {
    this.playSound?.("attack");

    const smash = this.add.arc(unit.x + 25, unit.y + 2, 42 * size, -65, 70, false, color, 0.45);
    smash.setDepth(8000);

    this.tweens.add({
      targets: smash,
      alpha: 0,
      scale: 1.6,
      duration: 210,
      onComplete: () => smash.destroy(),
    });

    if (unit.weapon || unit.weaponHead) {
      this.tweens.add({
        targets: [unit.weapon, unit.weaponHead].filter(Boolean),
        angle: 42,
        duration: 110,
        yoyo: true,
      });
    }

    this.tweens.add({
      targets: unit,
      scaleX: unit.scaleX * 1.08,
      scaleY: unit.scaleY * 0.95,
      duration: 90,
      yoyo: true,
    });
  }

  animateBossSmash(unit) {
    this.playSound?.("boss");

    const warning = this.add.circle(unit.x + 35, unit.y + 15, 55, 0xef4444, 0.18);
    warning.setDepth(8000);

    const shock = this.add.circle(unit.x + 35, unit.y + 15, 18, 0xfacc15, 0.28);
    shock.setDepth(8001);

    this.tweens.add({
      targets: warning,
      alpha: 0,
      scale: 1.8,
      duration: 350,
      onComplete: () => warning.destroy(),
    });

    this.tweens.add({
      targets: shock,
      alpha: 0,
      scale: 3,
      duration: 250,
      onComplete: () => shock.destroy(),
    });

    if (unit.club || unit.clubHead || unit.weapon) {
      this.tweens.add({
        targets: [unit.club, unit.clubHead, unit.weapon].filter(Boolean),
        angle: 55,
        duration: 130,
        yoyo: true,
      });
    }

    this.cameras.main.shake(70, 0.003);
  }

  animateBasicAttack(unit) {
    this.tweens.add({
      targets: unit,
      scaleX: unit.scaleX * 1.08,
      scaleY: unit.scaleY * 1.08,
      duration: 80,
      yoyo: true,
    });
  }

  updateCleanUnitLabels() {
    if (this.playerLabel && this.player) {
      this.playerLabel.x = this.player.x - 46;
      this.playerLabel.y = this.player.y - 82;
    }

    const roleSlots = {
      knight: 0,
      archer: 0,
      healer: 0,
      castleArcher: 0,
      other: 0,
    };

    if (this.allies) {
      this.allies.children.iterate((ally) => {
        if (!ally || !ally.active || !ally.nameLabel) return;

        const role = ally.role || "other";
        const slot = roleSlots[role] ?? 0;
        roleSlots[role] = slot + 1;

        const offsets = {
          knight: { x: -42 + (slot % 2) * 16, y: -78 - Math.floor(slot / 2) * 14 },
          archer: { x: -45 + (slot % 2) * 18, y: -84 - Math.floor(slot / 2) * 14 },
          healer: { x: -34, y: -86 - slot * 14 },
          castleArcher: { x: -48, y: -82 - slot * 14 },
          other: { x: -38, y: -76 - slot * 14 },
        };

        const off = offsets[role] || offsets.other;
        ally.nameLabel.x = ally.x + off.x;
        ally.nameLabel.y = ally.y + off.y;

        ally.nameLabel.setDepth(9000);
      });
    }

    if (this.enemies) {
      let enemySlot = 0;

      this.enemies.children.iterate((enemy) => {
        if (!enemy || !enemy.active || !enemy.nameLabel) return;

        const row = enemySlot % 3;
        enemy.nameLabel.x = enemy.x - 45 + row * 12;
        enemy.nameLabel.y = enemy.y - (enemy.isBoss ? 95 : 82) - Math.floor(enemySlot / 3) * 8;
        enemy.nameLabel.setDepth(9000);
        enemySlot += 1;
      });
    }
  }

  updateLabels() {
    this.playerLabel.x = this.player.x - 22;
    this.playerLabel.y = this.player.y - 60;

    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;

      if (ally.nameLabel) {
        ally.nameLabel.x = ally.x - 42;
        ally.nameLabel.y = ally.y - 64;
      }

      this.updateAllyHealthBar(ally);
    });
  }


  fixStaminaNaN() {
    if (!this.playerStats) return;

    const safeNumber = (value, fallback) => {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : fallback;
    };

    this.playerStats.maxStamina = safeNumber(this.playerStats.maxStamina, 100);
    this.playerStats.stamina = safeNumber(this.playerStats.stamina, this.playerStats.maxStamina);

    this.playerStats.maxStamina = Math.max(1, this.playerStats.maxStamina);
    this.playerStats.stamina = Phaser.Math.Clamp(
      this.playerStats.stamina,
      0,
      this.playerStats.maxStamina
    );
  }

  updateUI() {
    this.fixStaminaNaN?.();
    this.fixStaminaNaN?.();
    this.goldText.setText(
      `HP:${Math.floor(this.playerStats.hp)}/${this.playerStats.maxHp}  ST:${Math.floor(Number.isFinite(Number(this.playerStats.stamina)) ? Number(this.playerStats.stamina) : 100)}  Gold:${this.playerStats.gold}  XP:${this.playerStats.xp}  Lv:${this.playerStats.level}  Wave:${this.wave}`
    );

    this.castleHpText.setText(
      `Castle HP: ${Math.max(0, Math.floor(this.castleHealth))}/${this.maxCastleHealth}`
    );

    this.saveInfoText.setText(`Save: ${this.lastSavedText}`);
  }

  updateHelpPanel() {
    if (!this.helpPanel) return;

    this.helpPanel.setVisible(true);

    if (!this.helpVisible) {
      this.helpPanel.setText("H: Show keys");
      return;
    }

    this.helpPanel.setText(
      [
        "KEYS",
        "WASD Move",
        "Shift Run",
        "Space Special Attack",
        "E Talk",
        "B Shop",
        "I Bag",
        "Q Quests",
        "O Upgrades",
        "U Potion",
        "R Repair / Restart",
        "P Save",
        "L Load",
        "X Delete save",
        "M Sound",
        "ESC Pause",
        "F Formation",
        "H Hide",
      ].join("\n")
    );
  }


  updatePanels() {
    if (this.shopOpen) {
      const swordCost = 60 + this.playerStats.swordLevel * 25;

      this.shopPanel.setVisible(true);
      this.shopPanel.setText(
        [
          "SHOP",
          "1 Potion: 20 gold",
          `2 Sword upgrade: ${swordCost} gold`,
          "3 Castle repair: 30 gold",
          "4 Sell all loot",
          "B Close shop",
        ].join("\n")
      );
    } else {
      this.shopPanel.setText("");
      this.shopPanel.setVisible(false);
    }

    if (this.inventoryOpen) {
      const loot = this.playerStats.loot;

      this.inventoryPanel.setVisible(true);
      this.inventoryPanel.setText(
        [
          "INVENTORY",
          `Potions: ${this.playerStats.potions}`,
          `Sword Lv: ${this.playerStats.swordLevel}`,
          `Damage: ${this.playerStats.damage}`,
          `Kills: ${this.playerStats.kills}`,
          `Coins: ${loot.goblinCoin}`,
          `Fur: ${loot.wolfFur}`,
          `Teeth: ${loot.orcTooth}`,
          `Bones: ${loot.trollBone}`,
          `Crystals: ${loot.magicCrystal}`,
          "I Close inventory",
        ].join("\n")
      );
    } else {
      this.inventoryPanel.setText("");
      this.inventoryPanel.setVisible(false);
    }

    if (this.questOpen) {
      const questLines = this.quests.map((q) => {
        const mark = q.done ? "DONE" : `${q.progress}/${q.target}`;
        return `${mark} ${q.title}`;
      });

      this.questPanel.setVisible(true);
      this.questPanel.setText(["QUESTS", ...questLines, "Q Close quests"].join("\n"));
    } else {
      this.questPanel.setText("");
      this.questPanel.setVisible(false);
    }

    if (this.upgradeOpen) {
      this.upgradePanel.setVisible(true);
      this.upgradePanel.setText(
        [
          "UPGRADES",
          "1 Max HP +20: 70 gold",
          "2 Damage +8: 90 gold",
          "3 Castle max +100: 120 gold",
          "4 Ally level +1: 100 gold",
          "5 Castle archer tower +1: 150 gold",
          "O Close upgrades",
        ].join("\n")
      );
    } else {
      this.upgradePanel.setText("");
      this.upgradePanel.setVisible(false);
    }
  }

  updatePausePanel() {
    if (!this.isPaused) {
      this.pausePanel.setText("");
      this.upgradePanel.setVisible(false);
    this.pausePanel.setVisible(false);
      return;
    }

    this.pausePanel.setVisible(true);
    this.pausePanel.setText(
      [
        "PAUSED",
        "ESC Resume",
        "P Save",
        "4 Sell loot",
        "L Load",
      ].join("\n")
    );
  }

  updateMinimap() {
    const x = 780;
    const y = 390;
    const w = 160;
    const h = 120;

    this.minimap.clear();

    this.minimap.fillStyle(0x020617, 0.82);
    this.minimap.fillRoundedRect(x, y, w, h, 8);
    this.minimap.lineStyle(2, 0x94a3b8, 1);
    this.minimap.strokeRoundedRect(x, y, w, h, 8);

    const sx = w / this.worldW;
    const sy = h / this.worldH;

    const drawPoint = (worldX, worldY, color, size = 3) => {
      this.minimap.fillStyle(color, 1);
      this.minimap.fillCircle(x + worldX * sx, y + worldY * sy, size);
    };

    drawPoint(this.castle.x, this.castle.y, 0x94a3b8, 5);
    drawPoint(this.player.x, this.player.y, 0x38bdf8, 4);

    this.npcs.forEach((npc) => drawPoint(npc.x, npc.y, 0xfacc15, 3));

    this.enemies.children.iterate((enemy) => {
      if (enemy && enemy.active) drawPoint(enemy.x, enemy.y, enemy.isBoss ? 0xfacc15 : 0xef4444, enemy.isBoss ? 5 : 3);
    });

    this.lootDrops.children.iterate((loot) => {
      if (loot && loot.active) drawPoint(loot.x, loot.y, 0xa78bfa, 2);
    });
  }

  showMessage(message) {
    if (!this.messageText) return;
    this.messageText.setText(message);
  }

  showDamage(x, y, damage, color) {
    this.showFloatingText(x, y - 20, `-${damage}`, color);
  }

  showFloatingText(x, y, message, color) {
    const text = this.add.text(x, y, message, {
      fontSize: "18px",
      color,
      fontStyle: "bold",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    });

    this.tweens.add({
      targets: text,
      y: y - 45,
      alpha: 0,
      duration: 650,
      onComplete: () => text.destroy(),
    });
  }

  gameOver() {
    if (this.gameEnded) return;

    this.gameEnded = true;
    this.isPaused = true;
    this.physics.world.pause();
    this.playSound("gameOver");

    const overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.72);
    overlay.setScrollFactor(0);
    overlay.setDepth(10000);

    const bg = this.add.rectangle(480, 270, 640, 250, 0x111827, 0.96);
    bg.setScrollFactor(0);
    bg.setDepth(10001);

    const text = this.add.text(480, 270, "GAME OVER\nCastle Destroyed\nENTER or R = New Game", {
      fontSize: "32px",
      color: "#ef4444",
      align: "center",
      fontFamily: "monospace",
      lineSpacing: 8,
    });

    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(10002);
  }
}
