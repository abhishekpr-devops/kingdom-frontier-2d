import Phaser from "phaser";

const SAVE_KEY = "kingdom-frontier-2d-save-v03";

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
    this.helpVisible = true;
    this.shopOpen = false;
    this.inventoryOpen = false;

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
    };

    this.createWorld();
    this.createCastle();
    this.createPlayer();
    this.createNPCs();
    this.createAllies();
    this.createEnemies();
    this.createInput();
    this.createCamera();
    this.createCombat();
    this.createFixedUI();

    this.showMessage("Game ready. Press H for keys. Press P to save, L to load.");
  }

  createWorld() {
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    this.add.rectangle(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, 0x3f7d20);

    for (let i = 0; i < 120; i++) {
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

    for (let i = 0; i < 80; i++) {
      this.drawTree(Phaser.Math.Between(1050, 1740), Phaser.Math.Between(130, 1040));
    }

    for (let i = 0; i < 34; i++) {
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

    this.add.rectangle(120, 315, 190, 45, 0xcbd5e1);
    this.add.rectangle(60, 290, 45, 70, 0xcbd5e1);
    this.add.rectangle(180, 290, 45, 70, 0xcbd5e1);
    this.add.rectangle(205, 520, 32, 130, 0x78350f);
    this.add.rectangle(205, 520, 10, 100, 0x451a03);

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
        dialogue: "King: Defend the castle. Save often with P.",
      },
      {
        name: "Merchant",
        x: 330,
        y: 845,
        color: 0x22c55e,
        dialogue: "Merchant: Press B. Buy potion with 1, repair castle with 3.",
      },
      {
        name: "Blacksmith",
        x: 500,
        y: 845,
        color: 0xf97316,
        dialogue: "Blacksmith: Press B, then 2 to upgrade sword for 60 gold.",
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

  createEnemies() {
    this.enemies = this.physics.add.group();
    this.spawnWave();
  }

  spawnWave() {
    this.waveCooldown = true;

    this.time.delayedCall(900, () => {
      const count = 5 + this.wave * 2;

      for (let i = 0; i < count; i++) {
        const spawnSide = Phaser.Math.RND.pick(["right", "bottom", "top"]);
        let x;
        let y;

        if (spawnSide === "right") {
          x = Phaser.Math.Between(1450, 1740);
          y = Phaser.Math.Between(230, 950);
        } else if (spawnSide === "bottom") {
          x = Phaser.Math.Between(700, 1600);
          y = Phaser.Math.Between(930, 1040);
        } else {
          x = Phaser.Math.Between(900, 1650);
          y = Phaser.Math.Between(100, 200);
        }

        this.spawnEnemy(x, y);
      }

      this.waveCooldown = false;
      this.showMessage(`Wave ${this.wave} started. Enemies incoming.`);
    });
  }

  spawnEnemy(x, y) {
    const enemyType = Phaser.Math.RND.pick(["Goblin", "Orc", "Wolf"]);

    const enemy = this.add.container(x, y);
    enemy.shadow = this.add.ellipse(0, 23, 30, 10, 0x000000, 0.24);

    let color = 0xef4444;
    let hp = 90 + this.wave * 15;
    let speed = 28 + this.wave * 2;
    let damage = 8 + this.wave;

    if (enemyType === "Goblin") {
      color = 0x84cc16;
      hp = 70 + this.wave * 12;
      speed = 45 + this.wave * 2;
      damage = 6 + this.wave;
    }

    if (enemyType === "Orc") {
      color = 0xef4444;
      hp = 110 + this.wave * 18;
      speed = 26 + this.wave * 2;
      damage = 10 + this.wave;
    }

    if (enemyType === "Wolf") {
      color = 0x64748b;
      hp = 65 + this.wave * 10;
      speed = 58 + this.wave * 2;
      damage = 7 + this.wave;
    }

    enemy.bodyShape = this.add.rectangle(0, 0, 30, 34, color);
    enemy.head = this.add.circle(0, -22, 12, 0x7f1d1d);
    enemy.add([enemy.shadow, enemy.bodyShape, enemy.head]);

    this.physics.add.existing(enemy);
    enemy.body.setSize(30, 34);
    enemy.body.setOffset(-15, -17);

    enemy.enemyType = enemyType;
    enemy.hp = hp;
    enemy.maxHp = hp;
    enemy.speed = speed;
    enemy.damage = damage;
    enemy.gold = enemyType === "Orc" ? 8 : 5;
    enemy.lastAttack = 0;
    enemy.nextWander = 0;
    enemy.wanderX = 0;
    enemy.wanderY = 0;

    enemy.hpBack = this.add.rectangle(enemy.x, enemy.y - 42, 36, 6, 0x111827);
    enemy.hpBar = this.add.rectangle(enemy.x, enemy.y - 42, 34, 4, 0x22c55e);

    this.enemies.add(enemy);
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
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
      THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
    });
  }

  createCamera() {
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1);
  }

  createCombat() {
    this.projectiles = this.physics.add.group();

    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => {
      if (!projectile.active || !enemy.active) return;

      enemy.hp -= projectile.damage;
      this.showDamage(enemy.x, enemy.y, projectile.damage, "#ffffff");
      projectile.destroy();

      if (enemy.hp <= 0) {
        this.killEnemy(enemy);
      }
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!enemy.active) return;
      this.damagePlayer(enemy);
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

    this.messageText = this.add.text(170, 485, "", {
      fontSize: "15px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 12, y: 8 },
      wordWrap: { width: 660 },
    });

    this.helpPanel = this.add.text(690, 16, "", {
      fontSize: "12px",
      color: "#e5e7eb",
      fontFamily: "monospace",
      backgroundColor: "#020617",
      padding: { x: 10, y: 8 },
      lineSpacing: 4,
    });

    this.shopPanel = this.add.text(20, 90, "", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 10, y: 8 },
      lineSpacing: 5,
    });

    this.inventoryPanel = this.add.text(20, 230, "", {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "monospace",
      backgroundColor: "#111827",
      padding: { x: 10, y: 8 },
      lineSpacing: 5,
    });

    for (const item of [
      this.goldText,
      this.castleHpText,
      this.messageText,
      this.helpPanel,
      this.shopPanel,
      this.inventoryPanel,
    ]) {
      item.setScrollFactor(0);
      item.setDepth(9999);
    }

    this.updateHelpPanel();
    this.updatePanels();
  }

  update(time) {
    this.movePlayer();
    this.updateEnemies(time);
    this.updateAllies(time);
    this.updateLabels();
    this.updateUI();

    this.handleHotkeys(time);

    if (!this.waveCooldown && this.enemies.countActive(true) === 0) {
      this.wave += 1;
      this.showMessage(`Wave ${this.wave - 1} cleared. Wave ${this.wave} starts soon.`);
      this.spawnWave();
    }
  }

  handleHotkeys(time) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.playerAttack(time);
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.talkToNPC();

    if (Phaser.Input.Keyboard.JustDown(this.keys.B)) {
      this.shopOpen = !this.shopOpen;
      this.showMessage(this.shopOpen ? "Shop opened. Press 1, 2, or 3." : "Shop closed.");
      this.updatePanels();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
      this.inventoryOpen = !this.inventoryOpen;
      this.showMessage(this.inventoryOpen ? "Inventory opened." : "Inventory closed.");
      this.updatePanels();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.U)) this.usePotion();
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.repairCastle();
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) this.saveGame();
    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) this.loadGame();

    if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
      this.helpVisible = !this.helpVisible;
      this.updateHelpPanel();
    }

    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.buyPotion();
    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.upgradeSword();
    if (this.shopOpen && Phaser.Input.Keyboard.JustDown(this.keys.THREE)) this.repairCastle();
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

      if (time > enemy.nextWander) {
        enemy.nextWander = time + Phaser.Math.Between(700, 1400);
        enemy.wanderX = Phaser.Math.Between(-70, 70);
        enemy.wanderY = Phaser.Math.Between(-70, 70);
      }

      this.physics.moveTo(enemy, targetX + enemy.wanderX, targetY + enemy.wanderY, enemy.speed);

      if (castleDist < 115) {
        enemy.body.setVelocity(0);
        this.castleHealth -= 0.09;
        if (this.castleHealth <= 0) this.gameOver();
      }

      this.updateEnemyHealthBar(enemy);
    });
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
            const fleeX = ally.x + Math.cos(angle) * 80;
            const fleeY = ally.y + Math.sin(angle) * 80;
            this.physics.moveTo(ally, fleeX, fleeY, ally.speed);
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
      this.playerStats.hp = this.playerStats.maxHp;
      this.player.x = 520;
      this.player.y = 545;
      this.showMessage("You fell. Respawned near castle.");
    }
  }

  killEnemy(enemy) {
    this.playerStats.gold += enemy.gold;
    this.playerStats.xp += 10;
    this.playerStats.kills += 1;

    if (this.playerStats.xp >= this.playerStats.level * 80) {
      this.playerStats.xp = 0;
      this.playerStats.level += 1;
      this.playerStats.maxHp += 10;
      this.playerStats.hp = this.playerStats.maxHp;
      this.playerStats.damage += 4;
      this.showMessage(`Level up! You are now level ${this.playerStats.level}.`);
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

  buyPotion() {
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
    const cost = 60 + this.playerStats.swordLevel * 25;

    if (this.playerStats.gold < cost) {
      this.showMessage(`Not enough gold. Sword upgrade costs ${cost}.`);
      return;
    }

    this.playerStats.gold -= cost;
    this.playerStats.swordLevel += 1;
    this.playerStats.damage += 8;
    this.player.sword.setFillStyle(0xfacc15);

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
    this.showMessage("Castle repaired. +90 castle HP.");
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
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    this.showMessage("Game saved. Press L anytime to load.");
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
      };

      if (saveData.playerPosition) {
        this.player.x = saveData.playerPosition.x ?? 520;
        this.player.y = saveData.playerPosition.y ?? 545;
      }

      this.clearEnemiesAndProjectiles();
      this.spawnWave();

      this.showMessage("Game loaded. Current live enemies were reset for safety.");
      this.updatePanels();
    } catch (error) {
      console.error(error);
      this.showMessage("Save file is corrupted. Could not load.");
    }
  }

  clearEnemiesAndProjectiles() {
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

    this.enemies.clear(true, true);
    this.projectiles.clear(true, true);
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
    enemy.hpBack.y = enemy.y - 42;

    enemy.hpBar.x = enemy.x;
    enemy.hpBar.y = enemy.y - 42;
    enemy.hpBar.width = Math.max(3, 34 * (enemy.hp / enemy.maxHp));
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
  }

  updateHelpPanel() {
    if (!this.helpVisible) {
      this.helpPanel.setText("H = Show keys");
      return;
    }

    this.helpPanel.setText(
      [
        "KEYS",
        "WASD/Arrows Move",
        "Shift Sprint",
        "Space Attack",
        "E Talk",
        "B Shop",
        "I Inventory",
        "U Use potion",
        "R Repair castle",
        "P Save",
        "L Load",
        "H Hide keys",
      ].join("\n")
    );
  }

  updatePanels() {
    if (this.shopOpen) {
      const swordCost = 60 + this.playerStats.swordLevel * 25;

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
    }

    if (this.inventoryOpen) {
      this.inventoryPanel.setText(
        [
          "INVENTORY",
          `Potions: ${this.playerStats.potions}`,
          `Sword Lv: ${this.playerStats.swordLevel}`,
          `Damage: ${this.playerStats.damage}`,
          `Kills: ${this.playerStats.kills}`,
          "U Use potion",
          "I Close inventory",
        ].join("\n")
      );
    } else {
      this.inventoryPanel.setText("");
    }
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
    this.scene.pause();

    const bg = this.add.rectangle(480, 270, 600, 230, 0x111827, 0.94);
    bg.setScrollFactor(0);
    bg.setDepth(10000);

    const text = this.add.text(275, 205, "GAME OVER\nCastle Destroyed\nPress browser refresh to restart", {
      fontSize: "32px",
      color: "#ef4444",
      align: "center",
      fontFamily: "monospace",
    });

    text.setScrollFactor(0);
    text.setDepth(10001);
  }
}
