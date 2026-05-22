import Phaser from "phaser";

const SAVE_KEY = "kingdom-frontier-2d-save-v04";

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  create() {
    this.worldW = 1800;
    this.worldH = 1100;

    this.wave = 1;
    this.waveCooldown = false;
    this.castleHealth = 500;
    this.maxCastleHealth = 500;

    this.lastPlayerAttack = 0;
    this.attackRange = 105;
    this.attackArcDegrees = 95;
    this.hitFreezeUntil = 0;
    this.helpVisible = true;
    this.shopOpen = false;
    this.inventoryOpen = false;
    this.questOpen = false;
    this.isPaused = false;
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
    this.createCastle();
    this.createPlayer();
    this.createNPCs();
    this.createAllies();
    this.createGroups();
    this.createInput();
    this.createMouseAim();
    this.createCamera();
    this.createCombat();
    this.createFixedUI();
    this.spawnWave();

    this.showMessage("V04 loaded. Shop and repair now require correct location. Press H for keys.");
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

    this.player.shadow = this.add.ellipse(0, 24, 34, 12, 0x000000, 0.22);
    this.player.bodyShape = this.add.rectangle(0, 0, 28, 38, 0x38bdf8);
    this.player.head = this.add.circle(0, -24, 14, 0xfacc15);
    this.player.sword = this.add.rectangle(22, 0, 7, 32, 0xe5e7eb);

    this.player.add([this.player.shadow, this.player.bodyShape, this.player.head, this.player.sword]);

    this.physics.add.existing(this.player);
    this.player.body.setSize(28, 38);
    this.player.body.setOffset(-14, -20);
    this.player.body.setCollideWorldBounds(true);

    this.playerLabel = this.add.text(this.player.x - 22, this.player.y - 60, "Hero", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
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

    this.spawnAlly("Knight", 250, 565);
    this.spawnAlly("Knight", 310, 500);
    this.spawnAlly("Archer", 175, 345);
    this.spawnAlly("Archer", 75, 360);
  }

  spawnAlly(type, x, y) {
    const color = type === "Archer" ? 0xfacc15 : 0x2563eb;

    const ally = this.add.container(x, y);

    ally.shadow = this.add.ellipse(0, 22, 30, 10, 0x000000, 0.2);
    ally.bodyShape = this.add.rectangle(0, 0, 28, 36, color);
    ally.head = this.add.circle(0, -22, 12, 0xfde68a);

    if (type === "Archer") {
      ally.weapon = this.add.arc(18, 0, 18, 250, 110, false, 0x7c2d12);
    } else {
      ally.weapon = this.add.rectangle(20, 0, 8, 30, 0xcbd5e1);
    }

    ally.add([ally.shadow, ally.bodyShape, ally.head, ally.weapon]);

    this.physics.add.existing(ally);
    ally.body.setSize(28, 36);
    ally.body.setOffset(-14, -18);
    ally.body.setCollideWorldBounds(true);

    ally.type = type;
    ally.damage = type === "Archer" ? 7 : 10;
    ally.range = type === "Archer" ? 320 : 95;
    ally.speed = type === "Archer" ? 45 : 75;
    ally.lastAttack = 0;
    ally.homeX = x;
    ally.homeY = y;
    ally.wanderX = x;
    ally.wanderY = y;
    ally.nextWander = 0;

    this.add.text(x - 28, y - 58, type, {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "monospace",
    });

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
    });
  }

  createMouseAim() {
    this.input.mouse.disableContextMenu();

    this.aimReticle = this.add.graphics();
    this.aimReticle.setDepth(9998);

    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
        this.playerAttack(this.time.now);
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
      this.flashTarget(this.player.bodyShape, 0xef4444);
      projectile.destroy();

      if (this.playerStats.hp <= 0) {
        this.respawnPlayer();
      }
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
      this.pausePanel,
      this.minimap,
    ]) {
      item.setScrollFactor(0);
      item.setDepth(9999);
    }

    this.shopPanel.setVisible(false);
    this.inventoryPanel.setVisible(false);
    this.questPanel.setVisible(false);
    this.pausePanel.setVisible(false);

    this.updateHelpPanel();
    this.updatePanels();
    this.updatePausePanel();
  }

  spawnWave() {
    this.waveCooldown = true;

    this.time.delayedCall(900, () => {
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
      } else {
        this.showMessage(`Wave ${this.wave} started.`);
      }

      this.waveCooldown = false;
    });
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
      ? ["Goblin", "Orc", "Wolf", "Troll", "Skeleton Archer", "Dark Mage"]
      : ["Goblin", "Orc", "Wolf"];

    const enemyType = isBoss ? "Boss Orc" : Phaser.Math.RND.pick(availableTypes);

    const enemy = this.add.container(x, y);
    enemy.shadow = this.add.ellipse(0, 23, 30, 10, 0x000000, 0.24);

    const stats = this.getEnemyStats(enemyType);

    enemy.bodyShape = this.add.rectangle(0, 0, stats.sizeW, stats.sizeH, stats.color);
    enemy.head = this.add.circle(0, -stats.sizeH / 2 - 6, stats.headSize, stats.headColor);
    enemy.add([enemy.shadow, enemy.bodyShape, enemy.head]);

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
    enemy.nextWander = 0;
    enemy.wanderX = 0;
    enemy.wanderY = 0;

    enemy.hpBack = this.add.rectangle(enemy.x, enemy.y - 48, 46, 6, 0x111827);
    enemy.hpBar = this.add.rectangle(enemy.x, enemy.y - 48, 44, 4, isBoss ? 0xfacc15 : 0x22c55e);

    this.enemies.add(enemy);
  }

  getEnemyStats(type) {
    const base = {
      Goblin: {
        color: 0x84cc16,
        headColor: 0x365314,
        hp: 70 + this.wave * 12,
        speed: 45 + this.wave * 2,
        damage: 6 + this.wave,
        gold: 5,
        sizeW: 30,
        sizeH: 34,
        headSize: 12,
        isRanged: false,
      },
      Orc: {
        color: 0xef4444,
        headColor: 0x7f1d1d,
        hp: 110 + this.wave * 18,
        speed: 26 + this.wave * 2,
        damage: 10 + this.wave,
        gold: 8,
        sizeW: 32,
        sizeH: 38,
        headSize: 13,
        isRanged: false,
      },
      Wolf: {
        color: 0x64748b,
        headColor: 0x334155,
        hp: 65 + this.wave * 10,
        speed: 58 + this.wave * 2,
        damage: 7 + this.wave,
        gold: 6,
        sizeW: 38,
        sizeH: 24,
        headSize: 10,
        isRanged: false,
      },
      Troll: {
        color: 0x166534,
        headColor: 0x052e16,
        hp: 220 + this.wave * 28,
        speed: 18 + this.wave,
        damage: 18 + this.wave,
        gold: 16,
        sizeW: 44,
        sizeH: 54,
        headSize: 17,
        isRanged: false,
      },
      "Skeleton Archer": {
        color: 0xe5e7eb,
        headColor: 0xf8fafc,
        hp: 80 + this.wave * 12,
        speed: 28 + this.wave,
        damage: 10 + this.wave,
        gold: 12,
        sizeW: 28,
        sizeH: 36,
        headSize: 12,
        isRanged: true,
      },
      "Dark Mage": {
        color: 0x7c3aed,
        headColor: 0x312e81,
        hp: 95 + this.wave * 14,
        speed: 24 + this.wave,
        damage: 14 + this.wave,
        gold: 18,
        sizeW: 30,
        sizeH: 38,
        headSize: 13,
        isRanged: true,
      },
      "Boss Orc": {
        color: 0xb91c1c,
        headColor: 0x450a0a,
        hp: 650 + this.wave * 80,
        speed: 20 + this.wave,
        damage: 28 + this.wave * 2,
        gold: 120,
        sizeW: 64,
        sizeH: 76,
        headSize: 24,
        isRanged: false,
      },
    };

    return base[type];
  }

  update(time) {
    this.handleHotkeys(time);

    if (this.isPaused) {
      return;
    }

    this.updateAimReticle();

    if (time < this.hitFreezeUntil) {
      this.player.body.setVelocity(0);
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

  updateAimReticle() {
    if (!this.aimReticle || !this.player) return;

    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.cameras.main);

    this.aimReticle.clear();

    this.aimReticle.lineStyle(2, 0xffffff, 0.55);
    this.aimReticle.strokeCircle(worldPoint.x, worldPoint.y, 8);

    this.aimReticle.lineStyle(1, 0xffffff, 0.22);
    this.aimReticle.lineBetween(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
    this.player.sword.rotation = angle + Math.PI / 2;
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

      const playerDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const castleDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.castle.x, this.castle.y);

      let targetX = this.castle.x;
      let targetY = this.castle.y;

      if (playerDist < 190) {
        targetX = this.player.x;
        targetY = this.player.y;
      } else {
        const nearestAlly = this.getNearestAlly(enemy);
        if (nearestAlly && nearestAlly.distance < 150) {
          targetX = nearestAlly.ally.x;
          targetY = nearestAlly.ally.y;
        }
      }

      if (enemy.isRanged) {
        this.updateRangedEnemy(enemy, targetX, targetY, time);
      } else {
        this.updateMeleeEnemy(enemy, targetX, targetY, time);
      }

      if (castleDist < 115) {
        enemy.body.setVelocity(0);
        this.castleHealth -= enemy.isBoss ? 0.22 : 0.09;
        if (this.castleHealth <= 0) this.gameOver();
      }

      this.updateEnemyHealthBar(enemy);
    });
  }

  updateMeleeEnemy(enemy, targetX, targetY, time) {
    if (time > enemy.nextWander) {
      enemy.nextWander = time + Phaser.Math.Between(700, 1400);
      enemy.wanderX = Phaser.Math.Between(-70, 70);
      enemy.wanderY = Phaser.Math.Between(-70, 70);
    }

    this.physics.moveTo(enemy, targetX + enemy.wanderX, targetY + enemy.wanderY, enemy.speed);
  }

  updateRangedEnemy(enemy, targetX, targetY, time) {
    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, targetX, targetY);

    if (dist > 280) {
      this.physics.moveTo(enemy, targetX, targetY, enemy.speed);
    } else if (dist < 180) {
      const angle = Phaser.Math.Angle.Between(targetX, targetY, enemy.x, enemy.y);
      this.physics.moveTo(enemy, enemy.x + Math.cos(angle) * 80, enemy.y + Math.sin(angle) * 80, enemy.speed);
    } else {
      enemy.body.setVelocity(0);
    }

    if (dist < 340 && time - enemy.lastAttack > 1700) {
      enemy.lastAttack = time;
      this.shootEnemyProjectile(enemy, targetX, targetY);
    }
  }

  updateAllies(time) {
    this.allies.children.iterate((ally) => {
      if (!ally || !ally.active) return;

      const nearest = this.getNearestEnemy(ally);
      const enemy = nearest?.enemy;
      const distance = nearest?.distance ?? Infinity;

      if (enemy && distance < ally.range) {
        if (ally.type === "Knight") {
          if (distance > 45) {
            this.physics.moveTo(ally, enemy.x, enemy.y, ally.speed);
          } else {
            ally.body.setVelocity(0);
          }

          if (distance < 70 && time - ally.lastAttack > 900) {
            ally.lastAttack = time;
            enemy.hp -= ally.damage;
            this.showDamage(enemy.x, enemy.y, ally.damage, "#93c5fd");

            this.tweens.add({
              targets: ally.bodyShape,
              scaleX: 1.25,
              scaleY: 1.25,
              yoyo: true,
              duration: 100,
            });

            if (enemy.hp <= 0) this.killEnemy(enemy);
          }
        } else {
          if (distance < 170) {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, ally.x, ally.y);
            this.physics.moveTo(ally, ally.x + Math.cos(angle) * 80, ally.y + Math.sin(angle) * 80, ally.speed);
          } else if (distance > 280) {
            this.physics.moveTo(ally, enemy.x, enemy.y, ally.speed * 0.55);
          } else {
            this.freeAllyWander(ally, time);
          }

          if (time - ally.lastAttack > 1450) {
            ally.lastAttack = time;
            this.shootProjectile(ally, enemy, ally.damage, 0xfacc15);
          }
        }
      } else {
        this.freeAllyWander(ally, time);
      }
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

    if (dist > 12) {
      this.physics.moveTo(ally, ally.wanderX, ally.wanderY, ally.speed * 0.45);
    } else {
      ally.body.setVelocity(0);
    }
  }

  shootProjectile(from, target, damage, color) {
    const projectile = this.add.circle(from.x, from.y, 6, color);
    projectile.trail = this.add.circle(from.x, from.y, 10, color, 0.18);

    this.physics.add.existing(projectile);

    projectile.damage = damage;
    this.projectiles.add(projectile);

    this.physics.moveTo(projectile, target.x, target.y, 420);

    this.tweens.add({
      targets: projectile.trail,
      scale: 0.2,
      alpha: 0,
      duration: 500,
      onComplete: () => projectile.trail?.destroy(),
    });

    this.time.delayedCall(1300, () => {
      if (projectile.active) projectile.destroy();
      if (projectile.trail?.active) projectile.trail.destroy();
    });
  }

  shootEnemyProjectile(enemy, targetX, targetY) {
    const color = enemy.enemyType === "Dark Mage" ? 0xa78bfa : 0xe5e7eb;
    const projectile = this.add.circle(enemy.x, enemy.y, 6, color);
    this.physics.add.existing(projectile);

    projectile.damage = enemy.damage;
    this.enemyProjectiles.add(projectile);
    this.physics.moveTo(projectile, targetX, targetY, 320);

    this.time.delayedCall(1500, () => {
      if (projectile.active) projectile.destroy();
    });
  }

  playerAttack(time) {
    if (time - this.lastPlayerAttack < 420) return;
    this.lastPlayerAttack = time;

    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.cameras.main);

    const attackAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      worldPoint.x,
      worldPoint.y
    );

    let hitSomething = false;

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > this.attackRange) return;

      const enemyAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(enemyAngle - attackAngle));
      const arcLimit = Phaser.Math.DegToRad(this.attackArcDegrees / 2);

      if (angleDiff <= arcLimit) {
        hitSomething = true;

        const crit = Math.random() < 0.15;
        const damage = crit ? Math.floor(this.playerStats.damage * 1.7) : this.playerStats.damage;

        enemy.hp -= damage;

        this.showDamage(
          enemy.x,
          enemy.y,
          crit ? `CRIT ${damage}` : damage,
          crit ? "#facc15" : "#ffffff"
        );

        this.applyKnockback(enemy, attackAngle, crit ? 55 : 32);
        this.flashTarget(enemy.bodyShape, crit ? 0xfacc15 : 0xffffff);
        this.hitFreezeUntil = time + (crit ? 95 : 55);

        if (enemy.hp <= 0) this.killEnemy(enemy);
      }
    });

    this.drawSlashEffect(attackAngle, hitSomething);

    if (!hitSomething) {
      this.showMessage("Swing missed. Aim toward enemies with mouse.");
    }
  }

  drawSlashEffect(angle, hitSomething) {
    const arc = this.add.graphics();
    arc.setDepth(80);

    const color = hitSomething ? 0xfacc15 : 0xffffff;
    arc.lineStyle(8, color, hitSomething ? 0.75 : 0.35);

    const startAngle = angle - Phaser.Math.DegToRad(this.attackArcDegrees / 2);
    const endAngle = angle + Phaser.Math.DegToRad(this.attackArcDegrees / 2);

    arc.beginPath();
    arc.arc(this.player.x, this.player.y, this.attackRange, startAngle, endAngle);
    arc.strokePath();

    const spark = this.add.circle(
      this.player.x + Math.cos(angle) * 72,
      this.player.y + Math.sin(angle) * 72,
      8,
      color,
      hitSomething ? 0.9 : 0.35
    );
    spark.setDepth(81);

    this.tweens.add({
      targets: arc,
      alpha: 0,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 150,
      onComplete: () => arc.destroy(),
    });

    this.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 2,
      duration: 180,
      onComplete: () => spark.destroy(),
    });
  }

  applyKnockback(target, angle, force) {
    target.x += Math.cos(angle) * force;
    target.y += Math.sin(angle) * force;

    target.x = Phaser.Math.Clamp(target.x, 20, this.worldW - 20);
    target.y = Phaser.Math.Clamp(target.y, 20, this.worldH - 20);
  }

  flashTarget(target, color) {
    if (!target || !target.setFillStyle) return;

    const originalFill = target.fillColor ?? 0xffffff;
    target.setFillStyle(color);

    this.time.delayedCall(90, () => {
      if (target.active) {
        target.setFillStyle(originalFill);
      }
    });
  }

  damagePlayer(enemy) {
    const now = this.time.now;
    if (now - enemy.lastAttack < 900) return;

    enemy.lastAttack = now;
    this.playerStats.hp -= enemy.damage;

    this.flashTarget(this.player.bodyShape, 0xef4444);
    this.cameras.main.shake(80, 0.004);
    this.showDamage(this.player.x, this.player.y, enemy.damage, "#ef4444");

    if (this.playerStats.hp <= 0) {
      this.respawnPlayer();
    }
  }

  respawnPlayer() {
    this.playerStats.hp = this.playerStats.maxHp;
    this.player.x = 520;
    this.player.y = 545;
    this.showMessage("You fell. Respawned near castle.");
  }

  killEnemy(enemy) {
    this.playerStats.gold += enemy.gold;
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

    const death = this.add.circle(enemy.x, enemy.y, 18, 0xffffff, 0.25);

    this.tweens.add({
      targets: death,
      scale: 2,
      alpha: 0,
      duration: 250,
      onComplete: () => death.destroy(),
    });

    enemy.destroy();
  }

  dropLoot(enemy) {
    const lootTable = {
      Goblin: ["goblinCoin"],
      Orc: ["orcTooth"],
      Wolf: ["wolfFur"],
      Troll: ["trollBone"],
      "Skeleton Archer": ["goblinCoin", "magicCrystal"],
      "Dark Mage": ["magicCrystal"],
      "Boss Orc": ["orcTooth", "trollBone", "magicCrystal"],
    };

    const possible = lootTable[enemy.enemyType] ?? ["goblinCoin"];
    const count = enemy.isBoss ? 3 : 1;

    for (let i = 0; i < count; i++) {
      if (!enemy.isBoss && Math.random() > 0.72) continue;

      const type = Phaser.Math.RND.pick(possible);
      const x = enemy.x + Phaser.Math.Between(-20, 20);
      const y = enemy.y + Phaser.Math.Between(-20, 20);

      const color = type === "magicCrystal" ? 0xa78bfa : type === "wolfFur" ? 0xcbd5e1 : 0xfacc15;
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
    this.updateUI();
  }

  loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      this.showMessage("No save found. Press P first to save.");
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

      this.clearEnemiesProjectilesLoot();
      this.spawnWave();

      this.showMessage("Game loaded. Active enemies reset for safety.");
      this.updatePanels();
      this.updateUI();
    } catch (error) {
      console.error(error);
      this.showMessage("Save file is corrupted. Could not load.");
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
    enemy.hpBack.y = enemy.y - 48;

    enemy.hpBar.x = enemy.x;
    enemy.hpBar.y = enemy.y - 48;
    enemy.hpBar.width = Math.max(3, 44 * (enemy.hp / enemy.maxHp));
  }

  updateLabels() {
    this.playerLabel.x = this.player.x - 22;
    this.playerLabel.y = this.player.y - 60;
  }

  updateUI() {
    this.goldText.setText(
      `HP:${Math.floor(this.playerStats.hp)}/${this.playerStats.maxHp}  ST:${Math.floor(this.playerStats.stamina)}  Gold:${this.playerStats.gold}  XP:${this.playerStats.xp}  Lv:${this.playerStats.level}  Wave:${this.wave}`
    );

    this.castleHpText.setText(
      `Castle HP: ${Math.max(0, Math.floor(this.castleHealth))}/${this.maxCastleHealth}`
    );

    this.saveInfoText.setText(`Save: ${this.lastSavedText}`);
  }

  updateHelpPanel() {
    if (!this.helpVisible) {
      this.helpPanel.setVisible(true);
      this.helpPanel.setText("H: Keys");
      return;
    }

    this.helpPanel.setVisible(true);
    this.helpPanel.setText(
      [
        "KEYS",
        "WASD Move",
        "Shift Run",
        "Mouse/Space Hit",
        "E Talk",
        "B Shop",
        "I Bag",
        "Q Quest",
        "U Potion",
        "R Repair",
        "P Save",
        "L Load",
        "ESC Pause",
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
  }

  updatePausePanel() {
    if (!this.isPaused) {
      this.pausePanel.setText("");
      this.pausePanel.setVisible(false);
      return;
    }

    this.pausePanel.setVisible(true);
    this.pausePanel.setText(
      [
        "PAUSED",
        "ESC Resume",
        "P Save",
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
    const label = typeof damage === "number" ? `-${damage}` : damage;
    this.showFloatingText(x, y - 20, label, color);
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
    this.isPaused = true;
    this.physics.world.pause();

    const bg = this.add.rectangle(480, 270, 600, 230, 0x111827, 0.94);
    bg.setScrollFactor(0);
    bg.setDepth(10000);

    const text = this.add.text(275, 205, "GAME OVER\nCastle Destroyed\nRefresh browser to restart", {
      fontSize: "32px",
      color: "#ef4444",
      align: "center",
      fontFamily: "monospace",
    });

    text.setScrollFactor(0);
    text.setDepth(10001);
  }
}
