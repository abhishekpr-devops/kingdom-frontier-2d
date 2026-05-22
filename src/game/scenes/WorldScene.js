import Phaser from "phaser";

const SAVE_KEY = "kingdom-frontier-2d-save-v04";

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  create() {
    this.gameVersion = "v0.13";
    this.worldW = 1800;
    this.worldH = 1100;

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
    this.isPaused = false;
    this.gameEnded = false;
    this.mainMenuOpen = true;
    this.loadingOpen = false;
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
    this.createCastle();
    this.createCastleDamageVisuals();
    this.createPlayer();
    this.createNPCs();
    this.createAllies();
    this.createGroups();
    this.createInput();
    this.createCamera();
    this.createCombat();
    this.createFixedUI();
    this.createMainMenu();
    this.spawnWave();

    this.physics.world.pause();
    this.showMessage("Main menu open. Press N for new game or L to load.");
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

    // Player Knight: silver armor + blue cloth + shield + sword + cape.
    this.player.shadow = this.add.ellipse(0, 27, 44, 14, 0x000000, 0.32);

    this.player.cape = this.add.rectangle(-12, 4, 18, 42, 0x1d4ed8);
    this.player.cape.setAlpha(0.9);

    this.player.outline = this.add.rectangle(0, 0, 38, 46, 0x0f172a);
    this.player.bodyShape = this.add.rectangle(0, 0, 30, 40, 0xcbd5e1);
    this.player.chest = this.add.rectangle(0, -2, 20, 25, 0xe5e7eb);
    this.player.blueCloth = this.add.rectangle(0, 14, 18, 12, 0x2563eb);

    this.player.headOutline = this.add.circle(0, -28, 18, 0x0f172a);
    this.player.helmet = this.add.circle(0, -28, 15, 0x94a3b8);
    this.player.eye = this.add.rectangle(2, -29, 16, 3, 0x111827);
    this.player.goldTrim = this.add.rectangle(0, -42, 20, 4, 0xfacc15);

    this.player.shield = this.add.rectangle(-24, 4, 14, 30, 0x1d4ed8);
    this.player.shieldBorder = this.add.rectangle(-24, 4, 18, 34, 0xcbd5e1);
    this.player.shieldBorder.setDepth(-1);

    this.player.sword = this.add.rectangle(25, -1, 7, 35, 0xe5e7eb);
    this.player.swordHandle = this.add.rectangle(25, 20, 12, 5, 0x78350f);

    this.player.add([
      this.player.shadow,
      this.player.cape,
      this.player.shieldBorder,
      this.player.shield,
      this.player.outline,
      this.player.bodyShape,
      this.player.chest,
      this.player.blueCloth,
      this.player.headOutline,
      this.player.helmet,
      this.player.eye,
      this.player.goldTrim,
      this.player.sword,
      this.player.swordHandle,
    ]);

    this.physics.add.existing(this.player);
    this.player.body.setSize(32, 42);
    this.player.body.setOffset(-16, -21);
    this.player.body.setCollideWorldBounds(true);

    this.playerLabel = this.add.text(this.player.x - 40, this.player.y - 70, "Player Knight", {
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
        hp: 90,
        damage: 9,
        range: 330,
        speed: 46,
        role: "archer",
      },
      "Castle Archer": {
        color: 0xf59e0b,
        hp: 110,
        damage: 12,
        range: 420,
        speed: 0,
        role: "castleArcher",
      },
      "Healer": {
        color: 0xf8fafc,
        hp: 95,
        damage: 0,
        range: 230,
        speed: 42,
        role: "healer",
      },
    }[type];

    const ally = this.add.container(x, y);

    ally.shadow = this.add.ellipse(0, 25, 40, 13, 0x000000, 0.3);

    // Common body foundation.
    ally.outline = this.add.rectangle(0, 0, 36, 44, 0x0f172a);
    ally.bodyShape = this.add.rectangle(0, 0, 30, 38, config.color);
    ally.headOutline = this.add.circle(0, -25, 16, 0x0f172a);
    ally.head = this.add.circle(0, -25, 13, 0xfde68a);

    ally.add([ally.shadow]);

    if (config.role === "knight") {
      // Ally Knight: gray armor, blue team cloth, smaller than hero.
      ally.armor = this.add.rectangle(0, -2, 26, 34, 0x94a3b8);
      ally.blueBand = this.add.rectangle(0, 12, 22, 8, 0x2563eb);
      ally.helmet = this.add.circle(0, -25, 13, 0x64748b);
      ally.eye = this.add.rectangle(2, -26, 13, 3, 0x111827);
      ally.shield = this.add.rectangle(-22, 5, 12, 25, 0x78350f);
      ally.weapon = this.add.rectangle(22, 2, 7, 30, 0xcbd5e1);

      ally.add([
        ally.outline,
        ally.armor,
        ally.blueBand,
        ally.headOutline,
        ally.helmet,
        ally.eye,
        ally.shield,
        ally.weapon,
      ]);
    }

    if (config.role === "archer") {
      // Ally Archer: hood, leather, clear bow silhouette.
      ally.hood = this.add.circle(0, -25, 15, 0x166534);
      ally.face = this.add.circle(2, -23, 9, 0xfde68a);
      ally.leather = this.add.rectangle(0, 2, 26, 34, 0x92400e);
      ally.belt = this.add.rectangle(0, 10, 28, 4, 0x78350f);
      ally.quiver = this.add.rectangle(-18, -2, 7, 26, 0x7c2d12);
      ally.bow = this.add.arc(23, 0, 24, 250, 110, false, 0x7c2d12);
      ally.arrow = this.add.rectangle(22, -2, 26, 2, 0xe5e7eb);

      ally.add([
        ally.outline,
        ally.leather,
        ally.belt,
        ally.quiver,
        ally.headOutline,
        ally.hood,
        ally.face,
        ally.bow,
        ally.arrow,
      ]);
    }

    if (config.role === "castleArcher") {
      // Castle Archer: partly hidden behind stone wall.
      ally.wall = this.add.rectangle(0, 12, 44, 30, 0x94a3b8);
      ally.wallTop = this.add.rectangle(0, -4, 48, 12, 0xcbd5e1);
      ally.hood = this.add.circle(0, -24, 13, 0x475569);
      ally.face = this.add.circle(2, -22, 8, 0xfde68a);
      ally.bow = this.add.arc(22, -8, 22, 250, 110, false, 0x7c2d12);
      ally.flag = this.add.triangle(-20, -30, -4, -39, -4, -21, 0x2563eb);

      ally.add([
        ally.wall,
        ally.wallTop,
        ally.headOutline,
        ally.hood,
        ally.face,
        ally.bow,
        ally.flag,
      ]);
    }

    if (config.role === "healer") {
      // Healer: robe + glowing staff.
      ally.robeOutline = this.add.rectangle(0, 4, 34, 44, 0x0f172a);
      ally.robe = this.add.rectangle(0, 4, 28, 40, 0xf8fafc);
      ally.blueScarf = this.add.rectangle(0, -6, 24, 5, 0x2563eb);
      ally.hood = this.add.circle(0, -25, 14, 0xfef3c7);
      ally.staff = this.add.rectangle(23, -2, 5, 48, 0x78350f);
      ally.crystal = this.add.circle(23, -31, 9, 0x22c55e);
      ally.glow = this.add.circle(23, -31, 15, 0x22c55e, 0.2);

      ally.add([
        ally.robeOutline,
        ally.robe,
        ally.blueScarf,
        ally.headOutline,
        ally.hood,
        ally.staff,
        ally.glow,
        ally.crystal,
      ]);
    }

    this.physics.add.existing(ally);
    ally.body.setSize(30, 38);
    ally.body.setOffset(-15, -19);
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

    ally.nameLabel = this.add.text(x - 42, y - 66, type, {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    });

    ally.hpBack = this.add.rectangle(x, y - 48, 48, 8, 0x7f1d1d);
    ally.hpBar = this.add.rectangle(x, y - 48, 46, 6, 0x22c55e);

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
      X: Phaser.Input.Keyboard.KeyCodes.X,
      ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
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
    this.menuOverlay = this.add.rectangle(480, 270, 960, 540, 0x020617, 0.88);
    this.menuOverlay.setScrollFactor(0);
    this.menuOverlay.setDepth(20000);

    this.menuPanel = this.add.rectangle(480, 270, 660, 360, 0x111827, 0.97);
    this.menuPanel.setScrollFactor(0);
    this.menuPanel.setDepth(20001);

    this.menuTitle = this.add.text(480, 140, "KINGDOM FRONTIER 2D", {
      fontSize: "34px",
      color: "#facc15",
      fontFamily: "monospace",
      fontStyle: "bold",
      align: "center",
    });
    this.menuTitle.setOrigin(0.5);
    this.menuTitle.setScrollFactor(0);
    this.menuTitle.setDepth(20002);

    this.versionText = this.add.text(480, 176, this.gameVersion, {
      fontSize: "16px",
      color: "#93c5fd",
      fontFamily: "monospace",
      align: "center",
    });
    this.versionText.setOrigin(0.5);
    this.versionText.setScrollFactor(0);
    this.versionText.setDepth(20002);

    this.menuText = this.add.text(480, 295, "", {
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

    const hasSave = localStorage.getItem(SAVE_KEY) ? "YES" : "NO";

    this.menuText.setText(
      [
        "N / ENTER  New Game",
        "L          Load Game",
        "X          Delete Save",
        `M          Sound: ${this.soundEnabled ? "ON" : "OFF"}`,
        "",
        `Save Found: ${hasSave}`,
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
      this.versionText,
      this.menuText,
    ]) {
      if (item) item.setVisible(false);
    }

    this.isPaused = false;
    this.physics.world.resume();
    this.showMessage("Game started. Press H for controls.");
  }

  showLoadingScreen(nextAction) {
    if (this.loadingOpen) return;

    this.loadingOpen = true;

    this.loadingOverlay = this.add.rectangle(480, 270, 960, 540, 0x020617, 0.92);
    this.loadingOverlay.setScrollFactor(0);
    this.loadingOverlay.setDepth(21000);

    this.loadingText = this.add.text(480, 250, "LOADING...", {
      fontSize: "34px",
      color: "#facc15",
      fontFamily: "monospace",
      fontStyle: "bold",
    });
    this.loadingText.setOrigin(0.5);
    this.loadingText.setScrollFactor(0);
    this.loadingText.setDepth(21001);

    this.loadingSubText = this.add.text(480, 305, "Preparing battlefield", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "monospace",
    });
    this.loadingSubText.setOrigin(0.5);
    this.loadingSubText.setScrollFactor(0);
    this.loadingSubText.setDepth(21001);

    this.tweens.add({
      targets: this.loadingText,
      alpha: 0.35,
      yoyo: true,
      repeat: 2,
      duration: 280,
      onComplete: () => {
        if (this.loadingOverlay) this.loadingOverlay.destroy();
        if (this.loadingText) this.loadingText.destroy();
        if (this.loadingSubText) this.loadingSubText.destroy();

        this.loadingOpen = false;
        nextAction();
      },
    });
  }


  spawnWave() {
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
    const isBossWave = this.wave % 5 === 0;
    const count = isBossWave ? 8 + this.wave : 5 + this.wave * 2;

    for (let i = 0; i < count; i++) {
      const { x, y } = this.getSpawnPoint();
      this.spawnEnemy(x, y, false);
    }

    if (isBossWave) {
      const bossSpawn = this.getSpawnPoint();
      this.spawnEnemy(bossSpawn.x, bossSpawn.y, true);
      this.showMessage(`Boss wave ${this.wave}. Boss Orc has appeared.`);
      this.playSound("boss");
    } else {
      this.showMessage(`Wave ${this.wave} started.`);
      this.playSound("wave");
    }

    this.waveCooldown = false;
  }

  getSpawnPoint() {
    const spawnSide = Phaser.Math.RND.pick(["right", "bottom", "top"]);

    if (spawnSide === "right") {
      return {
        x: Phaser.Math.Between(1450, 1740),
        y: Phaser.Math.Between(230, 950),
      };
    }

    if (spawnSide === "bottom") {
      return {
        x: Phaser.Math.Between(700, 1600),
        y: Phaser.Math.Between(930, 1040),
      };
    }

    return {
      x: Phaser.Math.Between(900, 1650),
      y: Phaser.Math.Between(100, 200),
    };
  }

  spawnEnemy(x, y, isBoss = false) {
    const availableTypes = this.wave >= 4
      ? ["Goblin", "Orc Warrior", "Orc Archer", "Armored Orc"]
      : ["Goblin", "Orc Warrior", "Orc Archer"];

    const enemyType = isBoss ? "Troll Boss" : Phaser.Math.RND.pick(availableTypes);

    const enemy = this.add.container(x, y);
    enemy.shadow = this.add.ellipse(0, 28, 42, 14, 0x000000, 0.34);

    const stats = this.getEnemyStats(enemyType);

    enemy.add([enemy.shadow]);

    if (enemyType === "Goblin") {
      // Goblin: small green body, pointy ears, dagger.
      enemy.earL = this.add.triangle(-15, -25, -29, -31, -17, -16, 0x365314);
      enemy.earR = this.add.triangle(15, -25, 29, -31, 17, -16, 0x365314);
      enemy.bodyOutline = this.add.rectangle(0, 4, 33, 35, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 4, 27, 29, 0x84cc16);
      enemy.headOutline = this.add.circle(0, -24, 18, 0x0f172a);
      enemy.head = this.add.circle(0, -24, 15, 0x65a30d);
      enemy.eyeL = this.add.circle(-5, -26, 2, 0xfacc15);
      enemy.eyeR = this.add.circle(5, -26, 2, 0xfacc15);
      enemy.weapon = this.add.rectangle(20, 6, 6, 22, 0x9ca3af);

      enemy.add([
        enemy.earL,
        enemy.earR,
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.headOutline,
        enemy.head,
        enemy.eyeL,
        enemy.eyeR,
        enemy.weapon,
      ]);
    }

    if (enemyType === "Orc Warrior") {
      // Orc Warrior: top-heavy, weapon-focused.
      enemy.bodyOutline = this.add.rectangle(0, 0, 42, 48, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 0, 36, 42, 0x166534);
      enemy.armor = this.add.rectangle(0, 4, 32, 22, 0x78350f);
      enemy.redCloth = this.add.rectangle(0, 18, 28, 6, 0xb91c1c);
      enemy.headOutline = this.add.circle(0, -30, 18, 0x0f172a);
      enemy.head = this.add.circle(0, -30, 15, 0x365314);
      enemy.tuskL = this.add.rectangle(-7, -18, 4, 7, 0xf8fafc);
      enemy.tuskR = this.add.rectangle(7, -18, 4, 7, 0xf8fafc);
      enemy.weapon = this.add.rectangle(27, 0, 9, 38, 0xcbd5e1);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.armor,
        enemy.redCloth,
        enemy.headOutline,
        enemy.head,
        enemy.tuskL,
        enemy.tuskR,
        enemy.weapon,
      ]);
    }

    if (enemyType === "Orc Archer") {
      // Orc Archer: hunched ranged unit with crude bow.
      enemy.bodyOutline = this.add.rectangle(0, 2, 36, 42, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 2, 30, 36, 0x7c2d12);
      enemy.leather = this.add.rectangle(0, 5, 26, 24, 0x92400e);
      enemy.headOutline = this.add.circle(0, -28, 16, 0x0f172a);
      enemy.head = this.add.circle(0, -28, 13, 0x365314);
      enemy.tusk = this.add.rectangle(6, -17, 4, 6, 0xf8fafc);
      enemy.quiver = this.add.rectangle(-17, 0, 7, 28, 0x451a03);
      enemy.weapon = this.add.arc(24, 0, 25, 250, 110, false, 0x451a03);
      enemy.arrow = this.add.rectangle(23, -2, 28, 2, 0x111827);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.leather,
        enemy.headOutline,
        enemy.head,
        enemy.tusk,
        enemy.quiver,
        enemy.weapon,
        enemy.arrow,
      ]);
    }

    if (enemyType === "Armored Orc") {
      // Armored Orc: bulky, dark metal armor, shield.
      enemy.bodyOutline = this.add.rectangle(0, 2, 50, 56, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 2, 44, 50, 0x64748b);
      enemy.armorHighlight = this.add.rectangle(0, -4, 34, 20, 0x94a3b8);
      enemy.headOutline = this.add.circle(0, -34, 19, 0x0f172a);
      enemy.helmet = this.add.circle(0, -34, 16, 0x475569);
      enemy.jaw = this.add.rectangle(0, -22, 20, 8, 0x365314);
      enemy.eye = this.add.rectangle(2, -36, 15, 3, 0xef4444);
      enemy.shield = this.add.rectangle(-26, 4, 13, 34, 0x334155);
      enemy.weapon = this.add.rectangle(30, 2, 10, 42, 0xe5e7eb);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.armorHighlight,
        enemy.headOutline,
        enemy.helmet,
        enemy.jaw,
        enemy.eye,
        enemy.shield,
        enemy.weapon,
      ]);
    }

    if (enemyType === "Troll Boss") {
      // Troll Boss: huge, hunched, club, red eyes.
      enemy.bodyOutline = this.add.rectangle(0, 6, 78, 88, 0x0f172a);
      enemy.bodyShape = this.add.rectangle(0, 6, 70, 80, 0x166534);
      enemy.belly = this.add.ellipse(0, 18, 48, 42, 0x14532d);
      enemy.headOutline = this.add.circle(0, -48, 31, 0x0f172a);
      enemy.head = this.add.circle(0, -48, 27, 0x365314);
      enemy.eyeL = this.add.circle(-10, -52, 4, 0xef4444);
      enemy.eyeR = this.add.circle(10, -52, 4, 0xef4444);
      enemy.tuskL = this.add.rectangle(-10, -31, 5, 12, 0xf8fafc);
      enemy.tuskR = this.add.rectangle(10, -31, 5, 12, 0xf8fafc);
      enemy.club = this.add.rectangle(42, 0, 16, 64, 0x78350f);
      enemy.clubHead = this.add.rectangle(42, -33, 28, 22, 0x451a03);
      enemy.chain = this.add.rectangle(0, -8, 50, 5, 0x64748b);

      enemy.add([
        enemy.bodyOutline,
        enemy.bodyShape,
        enemy.belly,
        enemy.headOutline,
        enemy.head,
        enemy.eyeL,
        enemy.eyeR,
        enemy.tuskL,
        enemy.tuskR,
        enemy.club,
        enemy.clubHead,
        enemy.chain,
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

    enemy.nameLabel = this.add.text(enemy.x - 45, enemy.y - 72, enemyType, {
      fontSize: enemy.isBoss ? "13px" : "10px",
      color: enemy.isBoss ? "#facc15" : "#ffffff",
      fontFamily: "monospace",
      stroke: "#000000",
      strokeThickness: 3,
    });

    enemy.hpBack = this.add.rectangle(enemy.x, enemy.y - 54, 54, 8, 0x7f1d1d);
    enemy.hpBar = this.add.rectangle(enemy.x, enemy.y - 54, 52, 6, 0x22c55e);

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
    this.updateEnemies(time);
    this.updateAllies(time);
    this.updateLabels();
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.N) || Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
      this.playSound("wave");

      this.showLoadingScreen(() => {
        this.hideMainMenu();
      });
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
      this.showLoadingScreen(() => {
        this.loadGame();
        this.hideMainMenu();
      });
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.X)) {
      this.deleteSave();
      this.updateMainMenuText();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.M)) {
      this.soundEnabled = !this.soundEnabled;
      this.updateMainMenuText();
      this.showMessage(`Sound ${this.soundEnabled ? "enabled" : "disabled"}.`);
    }
  }


  handleHotkeys(time) {
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

    if (Phaser.Input.Keyboard.JustDown(this.keys.X)) {
      this.deleteSave();
    }

    if (this.isPaused) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.P)) this.saveGame();
      if (Phaser.Input.Keyboard.JustDown(this.keys.L)) this.loadGame();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.playerAttack(time);
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

    return {
      kind: "castle",
      x: this.castleGatePoint.x,
      y: this.castleGatePoint.y,
    };
  }

  updateMeleeEnemy(enemy, targetX, targetY, time, targetKind = "castle", distance = null) {
    const dist = distance ?? Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

    const attackDistance = targetKind === "castle" ? 96 : 58;

    if (enemy.isBoss) {
      this.updateBossSpecials(enemy, time);
    }

    // Enemy locks in when close enough. No more walking away while attacking.
    if (dist <= attackDistance) {
      enemy.body.setVelocity(0);

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

  updateAllies(time) {
    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;

      this.updateAllyHealthBar(ally);

      if (ally.role === "healer") {
        this.updateHealerAlly(ally, time);
        return;
      }

      if (!ally.currentTarget || !ally.currentTarget.active || time > ally.nextTargetCheck) {
        const nearest = this.getNearestEnemy(ally);
        ally.currentTarget = nearest?.enemy ?? null;
        ally.nextTargetCheck = time + 350;
      }

      const enemy = ally.currentTarget;

      if (!enemy || !enemy.active) {
        if (ally.role === "castleArcher") {
          ally.body.setVelocity(0);
        } else {
          this.freeAllyWander(ally, time);
        }
        return;
      }

      const distance = Phaser.Math.Distance.Between(ally.x, ally.y, enemy.x, enemy.y);

      if (distance > ally.range) {
        ally.currentTarget = null;

        if (ally.role === "castleArcher") {
          ally.body.setVelocity(0);
        } else {
          this.freeAllyWander(ally, time);
        }
        return;
      }

      if (ally.role === "knight") {
        this.updateKnightAlly(ally, enemy, distance, time);
      }

      if (ally.role === "archer" || ally.role === "castleArcher") {
        this.updateArcherAlly(ally, enemy, distance, time);
      }
    });
  }

  updateHealerAlly(ally, time) {
    let target = null;
    let lowestScore = 1;

    this.allies.children.iterate((other) => {
      if (!other || !other.active || other === ally) return;

      const distance = Phaser.Math.Distance.Between(ally.x, ally.y, other.x, other.y);
      if (distance > 300) return;

      const hpPercent = other.hp / other.maxHp;

      if (hpPercent < lowestScore) {
        lowestScore = hpPercent;
        target = other;
      }
    });

    const playerPercent = this.playerStats.hp / this.playerStats.maxHp;
    const playerDistance = Phaser.Math.Distance.Between(ally.x, ally.y, this.player.x, this.player.y);

    if (!target && playerPercent < 0.85 && playerDistance < 300) {
      target = "player";
      lowestScore = playerPercent;
    }

    if (!target) {
      this.freeAllyWander(ally, time);
      return;
    }

    const targetX = target === "player" ? this.player.x : target.x;
    const targetY = target === "player" ? this.player.y : target.y;
    const distance = Phaser.Math.Distance.Between(ally.x, ally.y, targetX, targetY);

    if (distance > 95) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 450;
        this.physics.moveTo(ally, targetX, targetY, ally.speed);
      }
    } else {
      ally.body.setVelocity(0);
    }

    if (distance < 130 && time - ally.lastHeal > 1250) {
      ally.lastHeal = time;

      if (target === "player") {
        this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 14);
        this.showFloatingText(this.player.x, this.player.y - 50, "+14 HP", "#22c55e");
      } else {
        target.hp = Math.min(target.maxHp, target.hp + 18);
        this.updateAllyHealthBar(target);
        this.showFloatingText(target.x, target.y - 50, "+18 HP", "#22c55e");
      }

      this.drawHealPulse(ally.x, ally.y);
      this.playSound("heal");
    }
  }


  updateKnightAlly(ally, enemy, distance, time) {
    const stopDistance = 58;

    if (distance > stopDistance) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 220;
        this.physics.moveTo(ally, enemy.x, enemy.y, ally.speed);
      }
    } else {
      ally.body.setVelocity(0);
    }

    if (distance < 72 && time - ally.lastAttack > 950) {
      ally.lastAttack = time;
      ally.body.setVelocity(0);

      this.animateMeleeAttack(ally);
      enemy.hp -= ally.damage;
      this.showDamage(enemy.x, enemy.y, ally.damage, "#93c5fd");

      this.tweens.add({
        targets: ally.bodyShape,
        scaleX: 1.18,
        scaleY: 1.18,
        yoyo: true,
        duration: 90,
      });

      if (enemy.hp <= 0) this.killEnemy(enemy);
    }
  }

  updateArcherAlly(ally, enemy, distance, time) {
    if (ally.role === "castleArcher") {
      ally.body.setVelocity(0);

      if (distance < ally.range && time - ally.lastAttack > 1150) {
        ally.lastAttack = time;
        this.shootProjectile(ally, enemy, ally.damage, 0xfacc15);
      }

      return;
    }

    const dangerDistance = 145;
    const goodMin = 190;
    const goodMax = 295;

    if (distance < dangerDistance) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 450;

        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, ally.x, ally.y);
        ally.wanderX = Phaser.Math.Clamp(ally.x + Math.cos(angle) * 120, 40, this.worldW - 40);
        ally.wanderY = Phaser.Math.Clamp(ally.y + Math.sin(angle) * 120, 40, this.worldH - 40);

        this.physics.moveTo(ally, ally.wanderX, ally.wanderY, ally.speed);
      }
    } else if (distance > goodMax) {
      if (time > ally.nextMoveDecision) {
        ally.nextMoveDecision = time + 450;
        this.physics.moveTo(ally, enemy.x, enemy.y, ally.speed * 0.45);
      }
    } else {
      ally.body.setVelocity(0);
    }

    if (distance < ally.range && time - ally.lastAttack > 1450) {
      ally.lastAttack = time;
      ally.body.setVelocity(0);
      this.shootProjectile(ally, enemy, ally.damage, 0xfacc15);
    }
  }

  drawHealPulse(x, y) {
    const pulse = this.add.circle(x, y, 18, 0x22c55e, 0.22);

    this.tweens.add({
      targets: pulse,
      scale: 2.2,
      alpha: 0,
      duration: 500,
      onComplete: () => pulse.destroy(),
    });
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
    this.animateRangedAttack(from);

    const angle = Phaser.Math.Angle.Between(from.x, from.y, target.x, target.y);

    const projectile = this.add.rectangle(from.x, from.y, 28, 4, color);
    projectile.setRotation(angle);

    projectile.trail = this.add.rectangle(from.x, from.y, 18, 3, color, 0.28);
    projectile.trail.setRotation(angle);

    this.physics.add.existing(projectile);

    projectile.damage = damage;
    this.projectiles.add(projectile);

    this.physics.moveTo(projectile, target.x, target.y, 440);
    this.playSound("arrow");

    this.tweens.add({
      targets: projectile.trail,
      alpha: 0,
      duration: 250,
      onComplete: () => projectile.trail?.destroy(),
    });

    this.time.delayedCall(1300, () => {
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
    if (!unit || !unit.active) return;

    this.tweens.add({
      targets: unit.weapon || unit.bodyShape,
      angle: 35,
      duration: 80,
      yoyo: true,
      ease: "Sine.easeOut",
    });

    this.tweens.add({
      targets: unit.bodyShape,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 80,
      yoyo: true,
    });

    this.playSound("attack");
  }

  animateRangedAttack(unit) {
    if (!unit || !unit.active) return;

    this.tweens.add({
      targets: unit.weapon || unit.bodyShape,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 90,
      yoyo: true,
    });
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

  playerAttack(time) {
    if (time - this.lastPlayerAttack < 420) return;
    this.lastPlayerAttack = time;

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

    const panel = this.add.rectangle(480, 270, 650, 270, 0x111827, 0.96);
    panel.setScrollFactor(0);
    panel.setDepth(10001);

    const title = this.add.text(480, 195, "GAME OVER", {
      fontSize: "44px",
      color: "#ef4444",
      fontFamily: "monospace",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(10002);

    const body = this.add.text(480, 288, "The hero has fallen.\nPress ENTER to restart.\nTip: Use potions with U before HP reaches 0.", {
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
      fontFamily: "monospace",
      lineSpacing: 8,
    });
    body.setOrigin(0.5);
    body.setScrollFactor(0);
    body.setDepth(10002);

    this.input.keyboard.once("keydown-ENTER", () => {
      window.location.reload();
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

    const bg = this.add.rectangle(480, 270, 660, 270, 0x111827, 0.96);
    bg.setScrollFactor(0);
    bg.setDepth(10001);

    const text = this.add.text(480, 270, "GAME OVER\nCastle Destroyed\nPress ENTER to restart", {
      fontSize: "32px",
      color: "#ef4444",
      align: "center",
      fontFamily: "monospace",
      lineSpacing: 8,
    });

    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(10002);

    this.input.keyboard.once("keydown-ENTER", () => {
      window.location.reload();
    });
  }
}

  }
}
